"use client";

import Link from "next/link";
import { TextReveal } from "@/components/text-reveal";
import { Reveal } from "@/components/reveal";
import { formatVnd, productPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface EntertainmentGalleryProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

/**
 * Basic product grid: ảnh + tên + giá, không hiệu ứng card-deck/3D phức tạp.
 */
export function EntertainmentGallery({ title, subtitle, products }: EntertainmentGalleryProps) {
  if (!products.length) return null;

  return (
    <section className="w-full">
      <Reveal>
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Sản phẩm nổi bật
          </p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-5xl">
            <TextReveal as="span">{title}</TextReveal>
          </h2>
          {subtitle && (
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </Reveal>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-2 gap-4 px-4 sm:mt-14 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {products.map((p, i) => {
          const price = productPrice(p);
          return (
            <Reveal key={p.id} delay={i * 60} className="h-full">
              <Link
                href={`/products/${p.slug}`}
                className="group relative flex aspect-[4/5] w-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-2xl"
              >
                {p.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : null}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"
                />
                {/* Soft primary-tinted glow on hover, matching category showcase */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(70% 60% at 50% 100%, color-mix(in oklch, var(--color-primary) 35%, transparent), transparent 70%)",
                  }}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
                  <p className="line-clamp-1 text-sm font-bold text-white drop-shadow-sm sm:text-base">
                    {p.name}
                  </p>
                  <span className="text-xs font-semibold text-white/85">{formatVnd(price)}</span>
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/0 transition-all duration-500 group-hover:ring-white/10"
                />
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
