"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SiteHeader() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/products${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-backdrop-blur:bg-background/70"
      style={{ viewTransitionName: "site-header" } as React.CSSProperties}
    >
      <div className="mx-auto flex h-24 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center whitespace-nowrap">
          <Image
            src="/logo-header.webp"
            alt="LevanTruyen Sport"
            width={96}
            height={96}
            className="size-24 rounded-lg object-contain"
            preload
          />
        </Link>

        <nav className="hidden gap-6 text-base font-medium md:flex">
          <Link href="/products" className="transition-colors hover:text-primary">
            Sản phẩm
          </Link>
          <Link href="/products?featured=true" className="transition-colors hover:text-primary">
            Nổi bật
          </Link>
        </nav>

        <form onSubmit={onSearch} className="ml-auto flex flex-1 max-w-sm items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm sản phẩm thể thao..."
              className="h-9 w-full rounded-full border border-border bg-muted/50 pl-9 pr-3 text-sm outline-none transition-colors focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
