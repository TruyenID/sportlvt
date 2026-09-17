"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { formatVnd } from "@/lib/utils";
import type { Product, ProductVariant } from "@/lib/types";

/**
 * Kết hợp gallery ảnh + bộ chọn size/màu (display-only, không có giỏ hàng).
 * Khi chọn màu có ảnh riêng, ảnh chính sẽ đổi theo biến thể đó.
 */
export function ProductGalleryWithOptions({
  product,
  gallery,
}: {
  product: Product;
  gallery: { id: number; url: string }[];
}) {
  const variants = product.variants ?? [];
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[],
    [variants]
  );
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[],
    [variants]
  );

  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [color, setColor] = useState<string | undefined>(colors[0]);

  const selectedVariant: ProductVariant | undefined = variants.find(
    (v) => (sizes.length === 0 || v.size === size) && (colors.length === 0 || v.color === color)
  );

  const mainImage = selectedVariant?.image || gallery[0]?.url;
  const price = selectedVariant?.final_price ?? selectedVariant?.price ?? product.sale_price ?? product.base_price;
  const outOfStock = selectedVariant ? selectedVariant.stock <= 0 : variants.length === 0;

  // Một size/màu chỉ được phép chọn nếu tồn tại biến thể khớp với lựa chọn
  // còn lại hiện tại (và còn hàng). Nếu không, disable để tránh chọn phải
  // tổ hợp size/màu không có sản phẩm.
  function isSizeAvailable(s: string) {
    return variants.some(
      (v) => v.size === s && (colors.length === 0 || v.color === color) && v.stock > 0
    );
  }
  function isColorAvailable(c: string) {
    return variants.some(
      (v) => v.color === c && (sizes.length === 0 || v.size === size) && v.stock > 0
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Gallery */}
      <div className="flex flex-col gap-3">
        <div
          className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted"
          style={{ viewTransitionName: `product-image-${product.id}` } as React.CSSProperties}
        >
          {mainImage ? (
            <Image src={mainImage} alt={product.name} fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Không có ảnh</div>
          )}
        </div>
        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {gallery
              .filter((img) => img.url !== mainImage)
              .map((img) => (
                <div
                  key={img.id}
                  className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <Image src={img.url} alt={product.name} fill unoptimized className="object-cover" />
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4">
        {product.brand?.name && (
          <span className="text-sm text-muted-foreground">{product.brand.name}</span>
        )}
        <h1 className="text-2xl font-bold">{product.name}</h1>

        {product.rating_avg > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>⭐ {Number(product.rating_avg).toFixed(1)}</span>
            <span>· Đã bán {product.sold_count}</span>
          </div>
        )}

        {product.short_description && (
          <p className="text-muted-foreground">{product.short_description}</p>
        )}

        <div className="flex flex-col gap-4">
          <div className="text-2xl font-bold text-primary">{formatVnd(price)}</div>

          {sizes.length > 0 && (
            <div>
              <p className="mb-1 text-sm font-medium">Kích cỡ</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const available = isSizeAvailable(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!available}
                      onClick={() => available && setSize(s)}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${!available
                        ? "cursor-not-allowed border-border text-muted-foreground/40 line-through"
                        : size === s
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border"
                        }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div>
              <p className="mb-1 text-sm font-medium">Màu sắc</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const available = isColorAvailable(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={!available}
                      onClick={() => available && setColor(c)}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${!available
                          ? "cursor-not-allowed border-border text-muted-foreground/40 line-through"
                          : color === c
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border"
                        }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedVariant && (
            <p className="text-sm text-muted-foreground">
              {selectedVariant.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm` : "Hết hàng"}
            </p>
          )}

          {outOfStock && (
            <p className="w-fit rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
              Hết hàng
            </p>
          )}
        </div>

        {product.sale_price != null && product.sale_price < product.base_price && (
          <p className="text-sm text-muted-foreground line-through">{formatVnd(product.base_price)}</p>
        )}
      </div>
    </div>
  );
}
