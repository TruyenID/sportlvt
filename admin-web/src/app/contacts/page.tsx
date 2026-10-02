"use client";

import { useEffect, useState } from "react";
import { Trash2, TriangleAlert, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { deleteContact, getContacts, updateContactStatus } from "@/lib/endpoints";
import type { Contact } from "@/lib/types";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setContacts(await getContacts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải danh sách liên hệ.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(c: Contact) {
    try {
      const updated = await updateContactStatus(c.id, "read");
      setContacts((list) => list.map((x) => (x.id === c.id ? updated : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật trạng thái.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteContact(deleteTarget.id);
      setContacts((list) => list.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xóa liên hệ.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Liên hệ khách hàng</h1>
        <p className="text-sm text-muted-foreground">
          Danh sách khách hàng gửi liên hệ qua form trên website.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Chưa có liên hệ nào.
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.phone || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground" title={c.message}>
                      {c.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status === "new" ? "default" : "secondary"} className="rounded-full">
                        {c.status === "new" ? "Mới" : "Đã đọc"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.created_at).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {c.status === "new" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Đánh dấu đã đọc"
                            onClick={() => markRead(c)}
                          >
                            <MailOpen className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title={`Xóa liên hệ của ${c.name}`}
                          onClick={() => setDeleteTarget(c)}
                        >
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
            <AlertDialogTitle className="text-lg">Xóa liên hệ này?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Liên hệ của <span className="font-medium text-foreground">&ldquo;{deleteTarget.name}&rdquo;</span>{" "}
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
                  <Trash2 className="size-4" /> Xóa liên hệ
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
