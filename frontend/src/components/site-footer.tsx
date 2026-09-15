import Link from "next/link";
import { AtSign, Globe, Mail, MapPin, Phone } from "lucide-react";

const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Sản phẩm",
    links: [
      { label: "Tất cả sản phẩm", href: "/products" },
      { label: "Sản phẩm nổi bật", href: "/products?featured=true" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-3 sm:col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              LT
            </span>
            <span className="text-lg font-bold tracking-tight">
              LevanTruyen <span className="text-primary">Sport</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Đồ thể thao chính hãng — khám phá các mẫu sản phẩm mới nhất.
          </p>
          <div className="flex gap-3 text-muted-foreground">
            <Globe className="size-4 transition-colors hover:text-primary" />
            <AtSign className="size-4 transition-colors hover:text-primary" />
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

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Liên hệ</h3>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" /> 123 Đường Thể Thao, TP.HCM
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" /> 1900 1234
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" /> support@levantruyen.sport
          </p>
        </div>
      </div>

      <div className="border-t border-border py-4">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} LevanTruyen Sport. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
