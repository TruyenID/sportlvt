"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, ImageOff, UploadCloud, TriangleAlert, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createHeroSlide, deleteHeroSlide, getHeroSlides, updateHeroSlide, uploadImage,
} from "@/lib/endpoints";
import type { HeroSlide } from "@/lib/types";

const EMPTY_FORM = {
  id: 0, image: "", eyebrow: "", heading: "", description: "",
  cta_label: "", cta_link: "", sort_order: 0, is_active: true,
};

export function HeroSlidesPanel() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setSlides(await getHeroSlides());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải banner.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    const maxSort = slides.reduce((max, s) => Math.max(max, s.sort_order), 0);
    setForm({ ...EMPTY_FORM, sort_order: maxSort + 1 });
    setShowForm(true);
  }

  function openEdit(s: HeroSlide) {
    setForm({
      id: s.id, image: s.image, eyebrow: s.eyebrow ?? "", heading: s.heading,
      description: s.description ?? "", cta_label: s.cta_label ?? "", cta_link: s.cta_link ?? "",
      sort_order: s.sort_order, is_active: s.is_active,
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
        image: form.image,
        eyebrow: form.eyebrow || null,
        heading: form.heading,
        description: form.description || null,
        cta_label: form.cta_label || null,
        cta_link: form.cta_link || null,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };
      if (form.id) await updateHeroSlide(form.id, payload);
      else await createHeroSlide(payload);
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu banner.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(s: HeroSlide) {
    setSlides((list) => list.map((x) => (x.id === s.id ? { ...x, is_active: !x.is_active } : x)));
    try {
      await updateHeroSlide(s.id, { is_active: !s.is_active });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật trạng thái.");
      await load();
    }
  }

  function handleDrop(targetId: number) {
    setOverId(null);
    if (dragId === null || dragId === targetId) {
      setDragId(null);
      return;
    }
    const list = [...slides];
    const fromIdx = list.findIndex((s) => s.id === dragId);
    const toIdx = list.findIndex((s) => s.id === targetId);
    setDragId(null);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    setSlides(list);
    Promise.all(
      list.map((s, i) => (s.sort_order === i + 1 ? null : updateHeroSlide(s.id, { sort_order: i + 1 }))),
    )
      .then(load)
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Không thể cập nhật thứ tự.");
        load();
      });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteHeroSlide(deleteTarget.id);
      setSlides((list) => list.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xóa banner.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Banner đầu trang chủ</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý slider banner lớn hiển thị ở đầu trang chủ (ảnh nền, tiêu đề, mô tả, nút CTA).
          </p>
        </div>
        <Button className="gap-1.5" onClick={openCreate}>
          <Plus className="size-4" /> Thêm slide
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{form.id ? "Sửa slide" : "Thêm slide"}</CardTitle>
            <Button variant="ghost" size="icon-sm" onClick={() => setShowForm(false)}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="h-image">Ảnh nền</Label>
                <label
                  htmlFor="h-image"
                  className="group relative flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  {form.image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.image} alt="Xem trước ảnh" className="absolute inset-0 size-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                          <UploadCloud className="size-4" /> Đổi ảnh
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="size-6 text-muted-foreground/60" />
                      <span className="px-2 text-xs text-muted-foreground">
                        {uploading ? "Đang tải..." : "Nhấn để chọn ảnh"}
                      </span>
                    </>
                  )}
                  <input id="h-image" type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="sr-only" />
                </label>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="h-eyebrow">Nhãn nhỏ</Label>
                <Input id="h-eyebrow" value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="h-heading">Tiêu đề (2 dòng, xuống dòng bằng Enter)</Label>
                <Textarea id="h-heading" rows={2} required value={form.heading} onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="h-desc">Mô tả</Label>
                <Textarea id="h-desc" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="h-cta-label">Nhãn nút CTA</Label>
                <Input id="h-cta-label" value={form.cta_label} onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="h-cta-link">Link nút CTA</Label>
                <Input id="h-cta-link" placeholder="/products" value={form.cta_link} onChange={(e) => setForm((f) => ({ ...f, cta_link: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 self-end pb-1.5 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                Hiển thị
              </label>
              <Button type="submit" className="w-fit" disabled={saving || uploading || !form.image || !form.heading}>
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danh sách slide</CardTitle>
          <p className="text-sm text-muted-foreground">Kéo thả để đổi thứ tự hiển thị.</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Ảnh</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>
              ) : slides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-1 py-4">
                      <p>Chưa có slide nào.</p>
                      <p className="text-xs">Bấm nút &quot;Thêm slide&quot; phía trên để tạo slide đầu tiên.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                slides.map((s) => (
                  <TableRow
                    key={s.id}
                    draggable
                    onDragStart={() => setDragId(s.id)}
                    onDragOver={(e) => { e.preventDefault(); if (overId !== s.id) setOverId(s.id); }}
                    onDragLeave={() => setOverId((id) => (id === s.id ? null : id))}
                    onDrop={(e) => { e.preventDefault(); handleDrop(s.id); }}
                    onDragEnd={() => { setDragId(null); setOverId(null); }}
                    className={
                      (dragId === s.id ? "opacity-50 " : "") +
                      (overId === s.id && dragId !== s.id ? "bg-accent/50 " : "") +
                      "cursor-grab active:cursor-grabbing"
                    }
                  >
                    <TableCell className="text-muted-foreground"><GripVertical className="size-4" /></TableCell>
                    <TableCell>
                      {s.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image} alt={s.heading} className="h-10 w-16 rounded object-cover" />
                      ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-muted-foreground">
                          <ImageOff className="size-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-sm">{s.heading}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={s.is_active}
                        onClick={() => handleToggleActive(s)}
                        title={s.is_active ? "Đang hiển thị — bấm để ẩn" : "Đang ẩn — bấm để hiển thị"}
                        className={"relative inline-flex h-5 w-9 items-center rounded-full transition-colors " + (s.is_active ? "bg-primary" : "bg-muted-foreground/30")}
                      >
                        <span className={"inline-block size-3.5 transform rounded-full bg-background shadow transition-transform " + (s.is_active ? "translate-x-4.5" : "translate-x-1")} />
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" title="Sửa slide" onClick={() => openEdit(s)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" title="Xóa slide" onClick={() => setDeleteTarget(s)}>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center sm:items-center sm:text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <TriangleAlert className="size-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">Xóa slide này?</AlertDialogTitle>
            <AlertDialogDescription>Slide sẽ bị xóa vĩnh viễn khỏi trang chủ.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="gap-1.5">
              {deleting ? "Đang xóa..." : (<><Trash2 className="size-4" /> Xóa slide</>)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
