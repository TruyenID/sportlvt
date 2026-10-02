"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, ImageOff, UploadCloud, TriangleAlert, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createBanner, deleteBanner, getBanners, updateBanner, uploadImage } from "@/lib/endpoints";
import type { Banner } from "@/lib/types";

const EMPTY_FORM = {
  id: 0, image: "", shape: "rect" as "rect" | "square", sort_order: 0, is_active: true,
};

export function BannersPanel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setBanners(await getBanners());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải banner.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate(shape: "rect" | "square") {
    const maxSort = banners
      .filter((b) => b.shape === shape)
      .reduce((max, b) => Math.max(max, b.sort_order), 0);
    setForm({ ...EMPTY_FORM, shape, sort_order: maxSort + 1 });
    setShowForm(true);
  }

  function openEdit(b: Banner) {
    setForm({
      id: b.id, image: b.image,
      shape: b.shape, sort_order: b.sort_order, is_active: b.is_active,
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
        title: null, image: form.image, link: null,
        shape: form.shape, sort_order: form.sort_order, is_active: form.is_active,
      };
      if (form.id) await updateBanner(form.id, payload);
      else await createBanner(payload);
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu banner.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(b: Banner) {
    setBanners((list) => list.map((x) => (x.id === b.id ? { ...x, is_active: !x.is_active } : x)));
    try {
      await updateBanner(b.id, { is_active: !b.is_active });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật trạng thái.");
      await load();
    }
  }

  async function handleReorder(shape: "rect" | "square", reordered: Banner[]) {
    setBanners((list) => {
      const others = list.filter((b) => b.shape !== shape);
      return [...others, ...reordered].sort((a, b) => a.sort_order - b.sort_order);
    });
    try {
      await Promise.all(
        reordered.map((b, i) => (b.sort_order === i + 1 ? null : updateBanner(b.id, { sort_order: i + 1 }))),
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật thứ tự.");
      await load();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteBanner(deleteTarget.id);
      setBanners((list) => list.filter((b) => b.id !== deleteTarget.id));
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
          <h2 className="text-lg font-semibold">Banner trang chủ</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý các ảnh banner hiển thị ở đầu trang chủ website.
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => openCreate("rect")}>
          <Plus className="size-4" /> Thêm banner
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{form.id ? "Sửa banner" : "Thêm banner"}</CardTitle>
            <Button variant="ghost" size="icon-sm" onClick={() => setShowForm(false)}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-image">Ảnh</Label>
                <label
                  htmlFor="b-image"
                  className="group relative flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  {form.image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.image}
                        alt="Xem trước ảnh banner"
                        className="absolute inset-0 size-full object-contain p-2"
                      />
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
                  <input
                    id="b-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-shape">Kiểu banner</Label>
                <select id="b-shape" value={form.shape}
                  onChange={(e) => setForm((f) => ({ ...f, shape: e.target.value as "rect" | "square" }))}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="rect">Chữ nhật (hàng trên)</option>
                  <option value="square">Vuông (hàng dưới)</option>
                </select>
              </div>
              <label className="flex items-center gap-2 self-end pb-1.5 text-sm">
                <input type="checkbox" checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                Hiển thị
              </label>
              <Button type="submit" className="w-fit" disabled={saving || uploading || !form.image}>
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <BannerSection
        title="Banner chữ nhật (hàng trên)"
        description="Hiển thị ở hàng trên cùng trên trang chủ. Kéo thả để đổi thứ tự."
        banners={banners.filter((b) => b.shape === "rect")}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onToggleActive={handleToggleActive}
        onReorder={(list) => handleReorder("rect", list)}
      />

      <BannerSection
        title="Banner vuông (hàng dưới)"
        description="Hiển thị ở hàng dưới trên trang chủ. Kéo thả để đổi thứ tự."
        banners={banners.filter((b) => b.shape === "square")}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onToggleActive={handleToggleActive}
        onReorder={(list) => handleReorder("square", list)}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center sm:items-center sm:text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <TriangleAlert className="size-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">Xóa banner này?</AlertDialogTitle>
            <AlertDialogDescription>Banner sẽ bị xóa vĩnh viễn khỏi trang chủ.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="gap-1.5">
              {deleting ? (
                "Đang xóa..."
              ) : (
                <>
                  <Trash2 className="size-4" /> Xóa banner
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BannerSection({
  title,
  description,
  banners,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
  onReorder,
}: {
  title: string;
  description: string;
  banners: Banner[];
  loading: boolean;
  onEdit: (b: Banner) => void;
  onDelete: (b: Banner) => void;
  onToggleActive: (b: Banner) => void;
  onReorder: (list: Banner[]) => void;
}) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  function handleDrop(targetId: number) {
    setOverId(null);
    if (dragId === null || dragId === targetId) {
      setDragId(null);
      return;
    }
    const list = [...banners];
    const fromIdx = list.findIndex((b) => b.id === dragId);
    const toIdx = list.findIndex((b) => b.id === targetId);
    if (fromIdx === -1 || toIdx === -1) {
      setDragId(null);
      return;
    }
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    setDragId(null);
    onReorder(list);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Ảnh</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-1 py-4">
                    <p>Chưa có banner nào.</p>
                    <p className="text-xs">Bấm nút &quot;Thêm banner&quot; phía trên để tạo banner đầu tiên.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              banners.map((b) => (
                <TableRow
                  key={b.id}
                  draggable
                  onDragStart={() => setDragId(b.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (overId !== b.id) setOverId(b.id);
                  }}
                  onDragLeave={() => setOverId((id) => (id === b.id ? null : id))}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(b.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                  }}
                  className={
                    (dragId === b.id ? "opacity-50 " : "") +
                    (overId === b.id && dragId !== b.id ? "bg-accent/50 " : "") +
                    "cursor-grab active:cursor-grabbing"
                  }
                >
                  <TableCell className="text-muted-foreground">
                    <GripVertical className="size-4" />
                  </TableCell>
                  <TableCell>
                    {b.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image} alt={b.title ?? ""} className="h-10 w-16 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-muted-foreground">
                        <ImageOff className="size-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={b.is_active}
                      onClick={() => onToggleActive(b)}
                      title={b.is_active ? "Đang hiển thị — bấm để ẩn" : "Đang ẩn — bấm để hiển thị"}
                      className={
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors " +
                        (b.is_active ? "bg-primary" : "bg-muted-foreground/30")
                      }
                    >
                      <span
                        className={
                          "inline-block size-3.5 transform rounded-full bg-background shadow transition-transform " +
                          (b.is_active ? "translate-x-4.5" : "translate-x-1")
                        }
                      />
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" title={`Sửa ${b.title || "banner"}`} onClick={() => onEdit(b)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" title={`Xóa ${b.title || "banner"}`} onClick={() => onDelete(b)}>
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
  );
}
