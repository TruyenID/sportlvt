"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createPage, deletePage, getPages, updatePage } from "@/lib/endpoints";
import { slugify } from "@/lib/utils";
import type { Page } from "@/lib/types";

const EMPTY_FORM = { id: 0, title: "", slug: "", content: "", is_active: true };

export function PagesPanel() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setPages(await getPages());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải trang.");
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

  function openEdit(p: Page) {
    setForm({ id: p.id, title: p.title, slug: p.slug, content: p.content ?? "", is_active: p.is_active });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { title: form.title, slug: form.slug, content: form.content || null, is_active: form.is_active };
      if (form.id) await updatePage(form.id, payload);
      else await createPage(payload);
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu trang.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await deletePage(deleteTarget.id);
      setPages((list) => list.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xóa trang.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Trang nội dung động</h2>
          <p className="text-sm text-muted-foreground">
            Tạo các trang tĩnh như Giới thiệu, Liên hệ, Chính sách...
          </p>
        </div>
        <Button className="gap-1.5" onClick={openCreate}>
          <Plus className="size-4" /> Thêm trang
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{form.id ? "Sửa trang" : "Thêm trang"}</CardTitle>
            <Button variant="ghost" size="icon-sm" onClick={() => setShowForm(false)}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-title">Tiêu đề</Label>
                  <Input id="p-title" required value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="p-slug">Slug (đường dẫn /pages/...)</Label>
                  <Input id="p-slug" required value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">
                    Đường dẫn trên website, tự sinh từ tiêu đề (vd: &quot;Giới thiệu&quot; → &quot;gioi-thieu&quot;).
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-content">Nội dung</Label>
                <Textarea id="p-content" rows={8} value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
              </div>
              <label className="flex w-fit items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                Hiển thị công khai
              </label>
              <Button type="submit" className="w-fit" disabled={saving}>
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
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Đang tải...</TableCell></TableRow>
              ) : pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-1 py-4">
                      <p>Chưa có trang nào.</p>
                      <p className="text-xs">Bấm nút &quot;Thêm trang&quot; phía trên để tạo trang đầu tiên.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="text-muted-foreground">/pages/{p.slug}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_active ? "default" : "secondary"} className="rounded-full">
                        {p.is_active ? "Hiển thị" : "Ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" title={`Sửa ${p.title}`} onClick={() => openEdit(p)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" title={`Xóa ${p.title}`} onClick={() => setDeleteTarget(p)}>
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
            <AlertDialogTitle className="text-lg">Xóa trang này?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>Trang <span className="font-medium text-foreground">&ldquo;{deleteTarget.title}&rdquo;</span> sẽ bị xóa vĩnh viễn.</>
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
                  <Trash2 className="size-4" /> Xóa trang
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
