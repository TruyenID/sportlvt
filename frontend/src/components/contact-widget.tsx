"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone, Mail, X, AtSign } from "lucide-react";
import { getSiteSettings } from "@/lib/endpoints";
import type { SiteSettings } from "@/lib/types";

export function ContactWidget() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch(() => { });
  }, []);

  const items = [
    settings?.hotline && {
      key: "phone",
      label: "Gọi điện",
      href: `tel:${settings.hotline.replace(/\s+/g, "")}`,
      icon: Phone,
      accent: "bg-emerald-500 text-white",
    },
    settings?.zalo_url && {
      key: "zalo",
      label: "Zalo",
      href: settings.zalo_url,
      icon: AtSign,
      accent: "bg-sky-500 text-white",
    },
    settings?.messenger_url && {
      key: "messenger",
      label: "Messenger",
      href: settings.messenger_url,
      icon: MessageCircle,
      accent: "bg-violet-500 text-white",
    },
    settings?.email && {
      key: "email",
      label: "Email",
      href: `mailto:${settings.email}`,
      icon: Mail,
      accent: "bg-amber-500 text-white",
    },
  ].filter(Boolean) as { key: string; label: string; href: string; icon: typeof Phone; accent: string }[];

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 ease-out ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          }`}
      >
        {items.map((item, i) => (
          <a
            key={item.key}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noreferrer" : undefined}
            className="group flex items-center gap-2.5 transition-transform duration-300 ease-out"
            style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
          >
            <span className="rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              {item.label}
            </span>
            <span
              className={`flex size-12 items-center justify-center rounded-full shadow-lg ring-4 ring-background transition-transform duration-200 group-hover:scale-110 group-hover:shadow-xl ${item.accent}`}
            >
              <item.icon className="size-5" />
            </span>
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng liên hệ" : "Mở liên hệ"}
        aria-expanded={open}
        className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform duration-200 hover:scale-110 active:scale-95"
      >
        {!open && (
          <>
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/60" />
            <span className="absolute inset-0 -z-10 rounded-full bg-primary/30 blur-md" />
          </>
        )}
        {open ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6 animate-contact-wiggle" />
        )}
      </button>
    </div>
  );
}
