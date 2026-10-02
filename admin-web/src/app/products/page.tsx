"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Pencil, PackageX, ImageOff, UploadCloud, TriangleAlert, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { deleteProduct, getAdminProducts } from "@/lib/endpoints";
import { formatVnd } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { exportProductsToExcel } from "./export";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function load(search?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminProducts({ search });
      setProducts(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      let page = 1;
      let all: Product[] = [];
      while (true) {
        const res = await getAdminProducts({ page });
        all = all.concat(res.data);
        if (page >= res.last_page || res.data.length === 0) break;
        page++;
      }
      exportProductsToExcel(all);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xuất Excel.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xóa sản phẩm.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý sản phẩm</h1>
          <p className="text-sm text-muted-foreground">
            Xem, thêm, sửa hoặc xóa sản phẩm đang bán trên website.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={handleExport} disabled={exporting}>
            <FileDown className="size-4" /> {exporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Link href="/products/bulk-import">
            <Button variant="outline" className="gap-1.5">
              <UploadCloud className="size-4" /> Thêm hàng loạt
            </Button>
          </Link>
          <Link href="/products/new">
            <Button className="gap-1.5">
              <Plus className="size-4" /> Thêm sản phẩm
            </Button>
          </Link>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(search);
        }}
        className="flex max-w-sm items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="outline">
          Tìm
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-1">
                    <PackageX className="size-8 text-muted-foreground/50" />
                    <p>Chưa có sản phẩm nào.</p>
                    <p className="text-xs">
                      Bấm nút &quot;Thêm sản phẩm&quot; phía trên để tạo sản phẩm đầu tiên.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => {
                const stock = p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {p.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.thumbnail ?? undefined}
                            alt={p.name}
                            className="size-10 shrink-0 rounded-lg border border-border object-cover"
                          />
                        ) : (
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground">
                            <ImageOff className="size-4" />
                          </div>
                        )}
                        <span>{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.category?.name ?? "-"}
                    </TableCell>
                    <TableCell>{formatVnd(p.sale_price ?? p.base_price)}</TableCell>
                    <TableCell>{stock}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.is_active ? "default" : "secondary"}
                        className="rounded-full"
                      >
                        {p.is_active ? "Đang bán" : "Ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/products/${p.id}`}>
                          <Button variant="ghost" size="icon-sm" title={`Sửa ${p.name}`}>
                            <Pencil className="size-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title={`Xóa ${p.name}`}
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

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
            <AlertDialogTitle className="text-lg">Xóa sản phẩm này?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Sản phẩm <span className="font-medium text-foreground">&ldquo;{deleteTarget.name}&rdquo;</span> sẽ
                  bị xóa vĩnh viễn và không thể khôi phục.
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
                  <Trash2 className="size-4" /> Xóa sản phẩm
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
