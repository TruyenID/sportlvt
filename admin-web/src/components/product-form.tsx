"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Info, Layers, Plus, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createProduct,
  createVariant,
  deleteVariant,
  getBrands,
  getCategories,
  updateProduct,
  updateVariant,
  uploadImage,
} from "@/lib/endpoints";
import { slugify } from "@/lib/utils";
import type { Brand, Category, Product, ProductVariant } from "@/lib/types";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type VariantForm = Partial<ProductVariant> & { sku: string; stock: number };

const emptyVariant = (): VariantForm => ({ sku: "", size: "", color: "", stock: 0 });

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id?.toString() ?? "");
  const [brandId, setBrandId] = useState(product?.brand_id?.toString() ?? "");
  const [basePrice, setBasePrice] = useState(product?.base_price?.toString() ?? "");
  const [salePrice, setSalePrice] = useState(product?.sale_price?.toString() ?? "");
  const [weight, setWeight] = useState(product?.weight?.toString() ?? "");
  const [thumbnail, setThumbnail] = useState(product?.thumbnail ?? "");
  const [shortDescription, setShortDescription] = useState(product?.short_description ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [variants, setVariants] = useState<VariantForm[]>(
    product?.variants?.length ? product.variants : [emptyVariant()]
  );
  const [hasVariants, setHasVariants] = useState<boolean>(() => {
    if (!product?.variants?.length) return false;
    return product.variants.length > 1 || product.variants.some((v) => v.size || v.color);
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);
  const [variantSavingIndex, setVariantSavingIndex] = useState<number | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    getBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  function patchVariant(index: number, patch: Partial<VariantForm>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function handleAddVariant() {
    // Một khi đã bấm "Thêm biến thể", sản phẩm chuyển hẳn sang chế độ có
    // biến thể (size/màu) và không còn quay lại chế độ "sản phẩm đơn" nữa.
    setHasVariants(true);
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  async function handleSaveVariant(index: number) {
    if (!product) return;
    const v = variants[index];
    setVariantError(null);
    setVariantSavingIndex(index);
    try {
      const payload = {
        sku: v.sku,
        size: hasVariants ? v.size || null : null,
        color: hasVariants ? v.color || null : null,
        color_hex: hasVariants ? v.color_hex || null : null,
        price: hasVariants && v.price ? Number(v.price) : null,
        sale_price: hasVariants && v.sale_price ? Number(v.sale_price) : null,
        stock: Number(v.stock) || 0,
        image: v.image || null,
        is_active: v.is_active ?? true,
      };
      if (v.id) {
        const updated = await updateVariant(product.id, v.id, payload);
        patchVariant(index, updated);
      } else {
        const created = await createVariant(product.id, payload);
        patchVariant(index, created);
      }
    } catch (err) {
      setVariantError(err instanceof Error ? err.message : "Không thể lưu biến thể.");
    } finally {
      setVariantSavingIndex(null);
    }
  }

  async function handleRemoveVariant(index: number) {
    const v = variants[index];
    if (product && v.id) {
      setVariantError(null);
      setVariantSavingIndex(index);
      try {
        await deleteVariant(product.id, v.id);
        setVariants((prev) => prev.filter((_, i) => i !== index));
      } catch (err) {
        setVariantError(err instanceof Error ? err.message : "Không thể xóa biến thể.");
      } finally {
        setVariantSavingIndex(null);
      }
    } else {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setThumbnail(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh lên thất bại.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleVariantImageChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingVariantIndex(index);
    try {
      const result = await uploadImage(file);
      patchVariant(index, { image: result.url });
      if (product && variants[index]?.id) {
        await updateVariant(product.id, variants[index].id!, { image: result.url });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh biến thể thất bại.");
    } finally {
      setUploadingVariantIndex(null);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        category_id: Number(categoryId),
        brand_id: brandId ? Number(brandId) : null,
        name,
        slug: slug || slugify(name),
        short_description: shortDescription || null,
        description: description || null,
        base_price: Number(basePrice),
        sale_price: salePrice ? Number(salePrice) : null,
        weight: weight ? Number(weight) : 0,
        thumbnail: thumbnail || null,
        is_active: isActive,
        is_featured: isFeatured,
      };

      if (product) {
        await updateProduct(product.id, payload);
        // Đồng bộ các biến thể chưa lưu (mới thêm) hoặc đã chỉnh sửa nhưng
        // chưa bấm nút "Lưu" riêng của từng dòng, để bấm "Lưu sản phẩm" ở
        // dưới cũng lưu luôn toàn bộ biến thể.
        for (const v of variants) {
          const variantPayload = {
            sku: v.sku,
            size: hasVariants ? v.size || null : null,
            color: hasVariants ? v.color || null : null,
            color_hex: hasVariants ? v.color_hex || null : null,
            price: hasVariants && v.price ? Number(v.price) : null,
            sale_price: hasVariants && v.sale_price ? Number(v.sale_price) : null,
            stock: Number(v.stock) || 0,
            image: v.image || null,
            is_active: v.is_active ?? true,
          };
          if (v.id) {
            await updateVariant(product.id, v.id, variantPayload);
          } else if (v.sku) {
            await createVariant(product.id, variantPayload);
          }
        }
      } else {
        payload.variants = variants.map((v) => ({
          sku: v.sku,
          size: hasVariants ? v.size || null : null,
          color: hasVariants ? v.color || null : null,
          color_hex: hasVariants ? v.color_hex || null : null,
          price: hasVariants && v.price ? Number(v.price) : null,
          sale_price: hasVariants && v.sale_price ? Number(v.sale_price) : null,
          stock: Number(v.stock) || 0,
          image: v.image || null,
        }));
        await createProduct(payload);
      }
      router.push("/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu sản phẩm.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-20">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          <Info className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="size-4 text-primary" /> Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!product) setSlug(slugify(e.target.value));
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Đường dẫn trên website, tự sinh từ tên sản phẩm (vd: &quot;Áo thun nam&quot; → &quot;ao-thun-nam&quot;).
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Danh mục</Label>
              <select
                id="category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brand">Thương hiệu</Label>
              <select
                id="brand"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className={selectClass}
              >
                <option value="">-- Không --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="base_price">Giá gốc (VND)</Label>
              <Input
                id="base_price"
                type="number"
                required
                min={0}
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sale_price">Giá khuyến mãi (VND)</Label>
              <Input
                id="sale_price"
                type="number"
                min={0}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="weight">Khối lượng (gram)</Label>
              <Input
                id="weight"
                type="number"
                min={0}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            {!hasVariants && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    required
                    value={variants[0]?.sku ?? ""}
                    onChange={(e) => patchVariant(0, { sku: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Mã quản lý riêng của sản phẩm, dùng để phân biệt tồn kho (vd: &quot;AT-NAM-001&quot;).
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="stock">Tồn kho</Label>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    required
                    value={variants[0]?.stock ?? 0}
                    onChange={(e) => patchVariant(0, { stock: Number(e.target.value) })}
                  />
                </div>
              </>
            )}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="short_description">Mô tả ngắn</Label>
              <Input
                id="short_description"
                value={shortDescription ?? ""}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <textarea
                id="description"
                rows={5}
                value={description ?? ""}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 accent-primary"
                />
                Đang bán
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="size-4 accent-primary"
                />
                Sản phẩm nổi bật
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ImagePlus className="size-4 text-primary" /> Ảnh đại diện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="thumbnail"
              className="group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              {thumbnail ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnail}
                    alt="Xem trước ảnh đại diện"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <UploadCloud className="size-4" /> Đổi ảnh
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="size-7 text-muted-foreground/60" />
                  <span className="px-4 text-xs text-muted-foreground">
                    Nhấn để tải ảnh lên (PNG, JPG)
                  </span>
                </>
              )}
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                disabled={uploading}
                className="sr-only"
              />
            </label>
            {uploading && (
              <p className="mt-2 text-center text-xs text-muted-foreground">Đang tải ảnh lên...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {!hasVariants && (
        <Button type="button" variant="outline" className="w-fit gap-1.5" onClick={handleAddVariant}>
          <Plus className="size-4" /> Thêm biến thể (sản phẩm có nhiều size/màu)
        </Button>
      )}

      {hasVariants && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="size-4 text-primary" />
              Biến thể (size / màu / giá / tồn kho)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {variantError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                <Info className="size-4 shrink-0" />
                {variantError}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Mỗi biến thể có thể có size, màu, giá riêng và tồn kho riêng.
            </p>

            {variants.map((v, i) => (
              <div
                key={v.id ?? `new-${i}`}
                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3 sm:flex-row sm:items-center"
              >
                <span className="hidden size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary sm:flex">
                  {i + 1}
                </span>

                <label
                  htmlFor={`variant-image-${i}`}
                  className="group relative flex size-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-primary/50"
                >
                  {v.image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.image}
                        alt={`Ảnh biến thể ${i + 1}`}
                        className="absolute inset-0 size-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                        <UploadCloud className="size-4" />
                      </div>
                    </>
                  ) : uploadingVariantIndex === i ? (
                    <span className="text-[10px]">...</span>
                  ) : (
                    <ImagePlus className="size-4" />
                  )}
                  <input
                    id={`variant-image-${i}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleVariantImageChange(i, e)}
                    disabled={uploadingVariantIndex === i}
                    className="sr-only"
                  />
                </label>

                <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  <Input
                    placeholder="SKU"
                    required
                    value={v.sku}
                    onChange={(e) => patchVariant(i, { sku: e.target.value })}
                  />
                  <Input
                    placeholder="Size"
                    value={v.size ?? ""}
                    onChange={(e) => patchVariant(i, { size: e.target.value })}
                  />
                  <Input
                    placeholder="Màu"
                    value={v.color ?? ""}
                    onChange={(e) => patchVariant(i, { color: e.target.value })}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Giá riêng (VND)"
                    value={v.price ?? ""}
                    onChange={(e) => patchVariant(i, { price: e.target.value ? Number(e.target.value) : null })}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Giá KM riêng (VND)"
                    value={v.sale_price ?? ""}
                    onChange={(e) =>
                      patchVariant(i, { sale_price: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Tồn kho"
                    required
                    value={v.stock}
                    onChange={(e) => patchVariant(i, { stock: Number(e.target.value) })}
                  />
                </div>

                <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
                  {product && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={variantSavingIndex === i}
                      onClick={() => handleSaveVariant(i)}
                    >
                      {variantSavingIndex === i ? "Đang lưu..." : "Lưu"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={variants.length === 1 || variantSavingIndex === i}
                    onClick={() => handleRemoveVariant(i)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-fit gap-1.5" onClick={handleAddVariant}>
              <Plus className="size-4" /> Thêm biến thể
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 flex justify-end gap-2 border-t bg-card/95 px-6 py-3 backdrop-blur-sm">
        <Button type="button" variant="outline" onClick={() => router.push("/products")}>
          Hủy
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu sản phẩm"}
        </Button>
      </div>
    </form>
  );
}
