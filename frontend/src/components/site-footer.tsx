"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AtSign, Globe, Mail, MapPin, Phone } from "lucide-react";
import { getPages, getSiteSettings } from "@/lib/endpoints";
import type { Page, SiteSettings } from "@/lib/types";

const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Sản phẩm",
    links: [
      { label: "Tất cả sản phẩm", href: "/products" },
      { label: "Sản phẩm nổi bật", href: "/products?featured=true" },
      { label: "Liên hệ", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch(() => { });
    getPages()
      .then(setPages)
      .catch(() => { });
  }, []);

  const siteName = settings?.site_name || "LevanTruyen Sport";

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-3 sm:col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            {settings?.logo_footer ? (
              <Image
                src={settings.logo_footer}
                alt={siteName}
                width={32}
                height={32}
                unoptimized
                className="size-8 rounded-lg object-contain"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                LT
              </span>
            )}
            <span className="text-lg font-bold tracking-tight">{siteName}</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            {settings?.footer_note || "Đồ thể thao chính hãng — khám phá các mẫu sản phẩm mới nhất."}
          </p>
          <div className="flex gap-3 text-muted-foreground">
            {settings?.facebook_url ? (
              <a href={settings.facebook_url} target="_blank" rel="noreferrer">
                <Globe className="size-4 transition-colors hover:text-primary" />
              </a>
            ) : (
              <Globe className="size-4 transition-colors hover:text-primary" />
            )}
            {settings?.zalo_url ? (
              <a href={settings.zalo_url} target="_blank" rel="noreferrer">
                <AtSign className="size-4 transition-colors hover:text-primary" />
              </a>
            ) : (
              <AtSign className="size-4 transition-colors hover:text-primary" />
            )}
          </div>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}

        {pages.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-foreground">Thông tin</h3>
            {pages.map((p) => (
              <Link
                key={p.slug}
                href={`/pages/${p.slug}`}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {p.title}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Liên hệ</h3>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" /> {settings?.address || "123 Đường Thể Thao, TP.HCM"}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" /> {settings?.hotline || "1900 1234"}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" /> {settings?.email || "support@levantruyen.sport"}
          </p>
        </div>
      </div>

      <div className="border-t border-border py-4">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
