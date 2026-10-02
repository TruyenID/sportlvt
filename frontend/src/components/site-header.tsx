"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { getSiteSettings } from "@/lib/endpoints";

export function SiteHeader() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logo, setLogo] = useState("/logo-header.webp");
  const [siteName, setSiteName] = useState("LevanTruyen Sport");

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        if (s.logo_header) setLogo(s.logo_header);
        if (s.site_name) setSiteName(s.site_name);
      })
      .catch(() => { });
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setMenuOpen(false);
    router.push(`/products${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  }

  useEffect(() => {
    let rafId = 0;
    // Hide the header only while the pinned full-height banner slider
    // section is actively covering the viewport, and bring it back right
    // after that section is scrolled past. Whenever the header hides, also
    // close the mobile menu so it never stays open off-screen.
    function applyHidden(next: boolean) {
      setHidden(next);
      if (next) setMenuOpen(false);
    }

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const section = document.getElementById("banner-slider");
        if (!section) {
          applyHidden(false);
          return;
        }
        const rect = section.getBoundingClientRect();
        applyHidden(rect.top <= 0 && rect.bottom > 0);
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
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:h-20 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center whitespace-nowrap">
          <Image
            src={logo}
            alt={siteName}
            width={96}
            height={96}
            className="size-14 shrink-0 rounded-md object-contain sm:size-24"
            priority
          />
        </Link>

        <nav className="hidden gap-8 text-base font-medium text-muted-foreground md:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            Trang chủ
          </Link>
          <Link href="/products" className="transition-colors hover:text-foreground">
            Sản phẩm
          </Link>
          <Link href="/products?featured=true" className="transition-colors hover:text-foreground">
            Nổi bật
          </Link>
          <Link href="/contact" className="transition-colors hover:text-foreground">
            Liên hệ
          </Link>
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden flex-1 max-w-xs items-center gap-2 sm:flex">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm"
              className="h-10 w-full rounded-full border-none bg-muted/60 pl-9 pr-3 text-[15px] outline-none transition-colors focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40"
              suppressHydrationWarning
            />
          </div>
        </form>

        {/* Mobile: hamburger toggle replaces the inline nav/search that only
            fit on wider screens. */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
          className="ml-auto flex size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted sm:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile dropdown panel — search + nav links, only rendered on small
          screens where the header row above hides them. */}
      <div
        className={`overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl transition-[grid-template-rows] duration-300 ease-out sm:hidden ${menuOpen ? "grid grid-rows-[1fr]" : "grid grid-rows-[0fr]"
          }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-4 px-4 py-4">
            <form onSubmit={onSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm"
                  className="h-10 w-full rounded-full border-none bg-muted/60 pl-9 pr-3 text-[15px] outline-none transition-colors focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40"
                  suppressHydrationWarning
                />
              </div>
            </form>
            <nav className="flex flex-col gap-1 text-base font-medium text-muted-foreground">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-2 transition-colors hover:bg-muted hover:text-foreground"
              >
                Trang chủ
              </Link>
              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-2 transition-colors hover:bg-muted hover:text-foreground"
              >
                Sản phẩm
              </Link>
              <Link
                href="/products?featured=true"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-2 transition-colors hover:bg-muted hover:text-foreground"
              >
                Nổi bật
              </Link>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-2 transition-colors hover:bg-muted hover:text-foreground"
              >
                Liên hệ
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
