"use client";

import { useEffect, useState } from "react";
import { AtSign, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createContact, getSiteSettings } from "@/lib/endpoints";
import type { SiteSettings } from "@/lib/types";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-muted/40 px-3.5 text-[15px] outline-none transition-colors focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/40";

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch(() => { });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await createContact({
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        message: form.message,
      });
      setSent(true);
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể gửi liên hệ, vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  }

  const infoItems = [
    settings?.hotline && { icon: Phone, label: "Điện thoại", value: settings.hotline, href: `tel:${settings.hotline.replace(/\s+/g, "")}` },
    settings?.zalo_url && { icon: AtSign, label: "Zalo", value: "Nhắn tin qua Zalo", href: settings.zalo_url },
    settings?.messenger_url && { icon: MessageCircle, label: "Messenger", value: "Nhắn tin qua Messenger", href: settings.messenger_url },
    settings?.email && { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href: string }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="mb-10 sm:mb-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Liên hệ với chúng tôi</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc về sản phẩm và dịch vụ. Chọn kênh phù hợp
          hoặc gửi yêu cầu qua form bên dưới.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {infoItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/60"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{item.value}</span>
              </span>
            </a>
          ))}
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm text-muted-foreground">Địa chỉ</span>
              <span className="font-medium text-foreground">
                {settings?.address || "123 Đường Thể Thao, TP.HCM"}
              </span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Họ và tên"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
            />
            <input
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={inputClass}
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClass}
          />
          <textarea
            required
            placeholder="Nội dung cần hỗ trợ..."
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-muted/40 p-3.5 text-[15px] outline-none transition-colors focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {sent && <p className="text-sm text-primary">Đã gửi liên hệ thành công, chúng tôi sẽ phản hồi sớm nhất.</p>}
          <Button type="submit" disabled={sending} className="w-fit">
            {sending ? "Đang gửi..." : "Gửi liên hệ"}
          </Button>
        </form>
      </div>
    </div>
  );
}
