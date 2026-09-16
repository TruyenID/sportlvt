"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export function SiteHeader() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [hidden, setHidden] = useState(false);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/products${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  }

  useEffect(() => {
    let rafId = 0;
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        // Hide the header only while the pinned full-height banner slider
        // section is actively covering the viewport, and bring it back
        // right after that section is scrolled past.
        const section = document.getElementById("banner-slider");
        if (!section) {
          setHidden(false);
          return;
        }
        const rect = section.getBoundingClientRect();
        setHidden(rect.top <= 0 && rect.bottom > 0);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl transition-transform duration-500 ease-out supports-backdrop-blur:bg-background/50 ${hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      style={{ viewTransitionName: "site-header" } as React.CSSProperties}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center whitespace-nowrap">
          <Image
            src="/logo-header.webp"
            alt="LevanTruyen Sport"
            width={96}
            height={96}
            className="size-24 shrink-0 rounded-md object-contain"
            preload
          />
        </Link>

        <nav className="hidden gap-8 text-base font-medium text-muted-foreground md:flex">
          <Link href="/products" className="transition-colors hover:text-foreground">
            Sản phẩm
          </Link>
          <Link href="/products?featured=true" className="transition-colors hover:text-foreground">
            Nổi bật
          </Link>
        </nav>

        <form onSubmit={onSearch} className="ml-auto flex flex-1 max-w-xs items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm"
              className="h-10 w-full rounded-full border-none bg-muted/60 pl-9 pr-3 text-[15px] outline-none transition-colors focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
