"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createCategory, deleteCategory, getCategories, updateCategory, uploadImage } from "@/lib/endpoints";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

const EMPTY_FORM = {
  id: 0,
  name: "",
  slug: "",
  parent_id: "" as number | "",
  description: "",
  image: "" as string | null,
  sort_order: "" as number | "",
  is_active: true,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCategories(await getCategories());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải danh mục.");
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

  function openEdit(c: Category) {
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parent_id: c.parent_id ?? "",
      description: c.description ?? "",
      image: c.image ?? "",
      sort_order: c.sort_order ?? "",
      is_active: c.is_active,
    });
    setShowForm(true);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setForm((f) => ({ ...f, image: result.url }));
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
        parent_id: form.parent_id === "" ? null : Number(form.parent_id),
        description: form.description || null,
        image: form.image || null,
        sort_order: form.sort_order === "" ? null : Number(form.sort_order),
        is_active: form.is_active,
      };
      if (form.id) {
        await updateCategory(form.id, payload);
      } else {
        await createCategory(payload);
      }
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu danh mục.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      await deleteCategory(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xóa danh mục.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý danh mục</h1>
        <Button className="gap-1.5" onClick={openCreate}>
          <Plus className="size-4" /> Thêm danh mục
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{form.id ? "Sửa danh mục" : "Thêm danh mục"}</CardTitle>
            <Button variant="ghost" size="icon-sm" onClick={() => setShowForm(false)}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="name">Tên danh mục</Label>
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
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="parent">Danh mục cha</Label>
                  <select
                    id="parent"
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    value={form.parent_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, parent_id: e.target.value ? Number(e.target.value) : "" }))
                    }
                  >
                    <option value="">Không có</option>
                    {categories
                      .filter((c) => c.id !== form.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex w-32 flex-col gap-1.5">
                  <Label htmlFor="sort_order">Thứ tự</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sort_order: e.target.value === "" ? "" : Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="image">Ảnh</Label>
                  <label
                    htmlFor="image"
                    className="group relative flex size-24 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                  >
                    {form.image ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.image}
                          alt="Xem trước ảnh danh mục"
                          className="absolute inset-0 size-full object-cover"
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
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploading}
                      className="sr-only"
                    />
                  </label>
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  />
                  Hoạt động
                </label>
                <Button type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Danh mục cha</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Chưa có danh mục nào.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image ?? undefined} alt={c.name} className="size-8 rounded object-contain" />
                      ) : (
                        <div className="size-8 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {categories.find((p) => p.id === c.parent_id)?.name ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? "default" : "secondary"} className="rounded-full">
                        {c.is_active ? "Hoạt động" : "Ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(c.id)}>
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
    </div>
  );
}
