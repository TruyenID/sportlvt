"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Tags, UploadCloud, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createBrand, deleteBrand, getBrands, updateBrand, uploadImage } from "@/lib/endpoints";
import { slugify } from "@/lib/utils";
import type { Brand } from "@/lib/types";

const EMPTY_FORM = { id: 0, name: "", slug: "", logo: "" as string | null, is_active: true };

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setBrands(await getBrands());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải thương hiệu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(b: Brand) {
    setForm({ id: b.id, name: b.name, slug: b.slug, logo: b.logo ?? "", is_active: b.is_active });
    setShowForm(true);
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setForm((f) => ({ ...f, logo: result.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh lên thất bại.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        logo: form.logo || null,
        is_active: form.is_active,
      };
      if (form.id) {
        await updateBrand(form.id, payload);
      } else {
        await createBrand(payload);
      }
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu thương hiệu.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteBrand(deleteTarget.id);
      setBrands((list) => list.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xóa thương hiệu.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý thương hiệu</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách thương hiệu gắn với sản phẩm trên website.
          </p>
        </div>
        <Button className="gap-1.5" onClick={openCreate}>
          <Plus className="size-4" /> Thêm thương hiệu
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{form.id ? "Sửa thương hiệu" : "Thêm thương hiệu"}</CardTitle>
            <Button variant="ghost" size="icon-sm" onClick={() => setShowForm(false)}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="name">Tên thương hiệu</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: f.id ? f.slug : slugify(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Đường dẫn trên website, tự sinh từ tên (vd: &quot;Nike&quot; → &quot;nike&quot;).
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="logo">Logo</Label>
                <label
                  htmlFor="logo"
                  className="group relative flex size-24 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  {form.logo ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.logo}
                        alt="Xem trước logo"
                        className="absolute inset-0 size-full object-contain p-2"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                        <UploadCloud className="size-4" />
                      </div>
                    </>
                  ) : uploading ? (
                    <span className="text-[10px] text-muted-foreground">Đang tải...</span>
                  ) : (
                    <>
                      <UploadCloud className="size-5 text-muted-foreground/60" />
                      <span className="px-2 text-[10px] text-muted-foreground">Tải ảnh lên</span>
                    </>
                  )}
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 pb-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                Hoạt động
              </label>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-1 py-4">
                      <p>Chưa có thương hiệu nào.</p>
                      <p className="text-xs">
                        Bấm nút &quot;Thêm thương hiệu&quot; phía trên để tạo thương hiệu đầu tiên.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      {b.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.logo} alt={b.name} className="size-8 rounded object-contain" />
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded bg-muted text-muted-foreground">
                          <Tags className="size-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-muted-foreground">{b.slug}</TableCell>
                    <TableCell>
                      <Badge variant={b.is_active ? "default" : "secondary"} className="rounded-full">
                        {b.is_active ? "Hoạt động" : "Ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" title={`Sửa ${b.name}`} onClick={() => openEdit(b)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" title={`Xóa ${b.name}`} onClick={() => setDeleteTarget(b)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center sm:items-center sm:text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <TriangleAlert className="size-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">Xóa thương hiệu này?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Thương hiệu <span className="font-medium text-foreground">&ldquo;{deleteTarget.name}&rdquo;</span>{" "}
                  sẽ bị xóa vĩnh viễn và không thể khôi phục.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="gap-1.5">
              {deleting ? (
                "Đang xóa..."
              ) : (
                <>
                  <Trash2 className="size-4" /> Xóa thương hiệu
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
