"use client";

import { useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSiteSettings, updateSiteSettings, uploadImage } from "@/lib/endpoints";
import type { SiteSettings } from "@/lib/types";

const SUB_TABS = [
  { key: "header", label: "Header" },
  { key: "footer", label: "Footer" },
  { key: "contact", label: "Liên hệ" },
] as const;

type SubTabKey = (typeof SUB_TABS)[number]["key"];

const IMAGE_FIELDS: Record<SubTabKey, { key: keyof SiteSettings; label: string }[]> = {
  header: [
    { key: "logo_header", label: "Logo header" },
    { key: "favicon", label: "Favicon" },
  ],
  footer: [{ key: "logo_footer", label: "Logo footer" }],
  contact: [],
};

const TEXT_FIELDS: Record<SubTabKey, { key: keyof SiteSettings; label: string; placeholder?: string }[]> = {
  header: [{ key: "site_name", label: "Tên website" }],
  footer: [
    { key: "footer_note", label: "Ghi chú footer" },
    { key: "facebook_url", label: "Link Facebook" },
  ],
  contact: [
    { key: "hotline", label: "Hotline" },
    { key: "email", label: "Email liên hệ" },
    { key: "address", label: "Địa chỉ" },
    { key: "zalo_url", label: "Link Zalo" },
    { key: "messenger_url", label: "Link Messenger" },
  ],
};

export function GeneralPanel() {
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<SubTabKey>("header");

  useEffect(() => {
    getSiteSettings()
      .then(setForm)
      .catch((e) => setError(e instanceof Error ? e.message : "Không thể tải cài đặt."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { id, ...rest } = form;
      void id;
      const updated = await updateSiteSettings(rest);
      setForm(updated);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu cài đặt.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageChange(key: keyof SiteSettings, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingKey(key);
    try {
      const result = await uploadImage(file);
      setForm((prev) => (prev ? { ...prev, [key]: result.url } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh lên thất bại.");
    } finally {
      setUploadingKey(null);
      e.target.value = "";
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Đang tải...</p>;
  if (!form) return <p className="text-sm text-destructive">{error ?? "Không tải được cài đặt."}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin chung</CardTitle>
        <div className="mt-2 flex gap-1 border-b border-border">
          {SUB_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSubTab(t.key)}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                subTab === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {IMAGE_FIELDS[subTab].length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              {IMAGE_FIELDS[subTab].map((f) => {
                const value = (form[f.key] as string) ?? "";
                const uploading = uploadingKey === f.key;
                return (
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <Label htmlFor={f.key}>{f.label}</Label>
                    <label
                      htmlFor={f.key}
                      className="group relative flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                    >
                      {value ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={value}
                            alt={`Xem trước ${f.label}`}
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
                        id={f.key}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(f.key, e)}
                        disabled={uploading}
                        className="sr-only"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {TEXT_FIELDS[subTab].map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  value={(form[f.key] as string) ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setForm((prev) => (prev ? { ...prev, [f.key]: e.target.value } : prev))}
                />
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && <p className="text-sm text-primary">Đã lưu cài đặt.</p>}
          <Button type="submit" className="w-fit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
