"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatVnd, productPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface EntertainmentGalleryProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

/**
 * Pinned scroll-driven horizontal gallery, styled after Apple.com's
 * "section-endless-entertainment-gallery": the section stays pinned to the
 * viewport while the user scrolls down, and that vertical scroll progress is
 * translated 1:1 into horizontal movement of the poster track — exactly like
 * Apple's product feature scroll sections (no drag/snap, pure scroll-driven).
 */
export function EntertainmentGallery({ title, subtitle, products }: EntertainmentGalleryProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxShift, setMaxShift] = useState(0);

  useEffect(() => {
    if (!products.length) return;

    function measure() {
      const sticky = stickyRef.current;
      const track = trackRef.current;
      if (!sticky || !track) return;
      const shift = Math.max(0, track.scrollWidth - sticky.clientWidth);
      setMaxShift(shift);
    }

    measure();
    window.addEventListener("resize", measure);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rafId = 0;
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const wrapper = wrapperRef.current;
        const track = trackRef.current;
        if (!wrapper || !track) return;
        const rect = wrapper.getBoundingClientRect();
        const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
        if (scrollableHeight <= 0) return;
        const progress = Math.min(1, Math.max(0, -rect.top / scrollableHeight));
        const shift = Math.max(0, track.scrollWidth - window.innerWidth);
        track.style.transform = reduceMotion
          ? "translateX(0)"
          : `translateX(-${progress * shift}px)`;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [products.length]);

  if (!products.length) return null;

  // Pin duration scales with how much horizontal distance needs to be covered.
  const pinVh = Math.min(320, Math.max(160, 100 + maxShift / 8));

  return (
    <section
      ref={wrapperRef}
      className="relative w-full bg-black text-white"
      style={{ height: `${pinVh}vh` }}
    >
      <div ref={stickyRef} className="sticky top-0 flex h-screen flex-col overflow-hidden py-8 sm:py-10">
        <div className="w-full shrink-0 px-4 sm:px-8">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 max-w-xl text-[15px] text-white/60 sm:text-base">{subtitle}</p>
          )}
        </div>

        <div className="relative mt-6 flex flex-1 items-center overflow-hidden">
          <div ref={trackRef} className="flex h-full gap-2 will-change-transform">
            {products.map((p) => {
              const price = productPrice(p);
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group relative h-full w-auto aspect-[4/3] shrink-0 overflow-hidden bg-neutral-900"
                >
                  {p.thumbnail ? (
                    <Image
                      src={p.thumbnail}
                      alt={p.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : null}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/0"
                  />
                  {p.brand?.name && (
                    <span className="absolute left-4 top-4 text-xs font-semibold uppercase tracking-wide text-white/90">
                      {p.brand.name}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="line-clamp-2 text-base font-bold sm:text-lg">{p.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                        Xem ngay
                      </span>
                      <span className="text-xs text-white/70">{formatVnd(price)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
