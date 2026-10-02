"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import type { Category } from "@/lib/types";

interface CategoryShowcaseProps {
  categories: Category[];
}

/**
 * Standard e-commerce category grid: each top-level category is a clean
 * image card linking straight to its product list, with child categories
 * shown as small chips underneath. No experimental orbit/solar effects.
 */
export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  const roots = categories.filter((c) => !c.parent_id);
  const childrenOf = (id: number) => categories.filter((c) => c.parent_id === id);

  if (!roots.length) return null;

  return (
    <section className="mt-16 w-full sm:mt-24 lg:mt-32">
      <Reveal>
        <p className="mx-auto max-w-6xl px-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Danh mục sản phẩm
        </p>
        <h2 className="mx-auto mt-2 max-w-6xl px-4 text-center text-balance text-2xl font-bold tracking-tight sm:text-5xl">
          Mua sắm theo danh mục
        </h2>
      </Reveal>

      <div className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-3 px-4 sm:mt-14 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {roots.map((c, i) => {
          const children = childrenOf(c.id);
          const shown = children.slice(0, 3);
          const extra = children.length - shown.length;
          // First card reads as a "featured" category — spans two columns/rows
          // on larger screens so the grid isn't a flat, repetitive wall of tiles.
          const featured = i === 0;

          return (
            <Reveal
              key={c.id}
              delay={i * 60}
              className={featured ? "col-span-2 h-full sm:row-span-2" : "h-full"}
            >
              <Link
                href={`/products?category=${c.slug}`}
                className={`group relative flex w-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-2xl ${featured ? "aspect-[16/10] sm:aspect-auto sm:h-full" : "aspect-[4/5]"
                  }`}
              >
                <div className="relative flex-1 overflow-hidden bg-muted">
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : null}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"
                  />
                  {/* Soft primary-tinted glow sweeping up on hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(70% 60% at 50% 100%, color-mix(in oklch, var(--color-primary) 35%, transparent), transparent 70%)",
                    }}
                  />
                </div>

                <div
                  className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 ${featured ? "sm:p-6" : ""
                    }`}
                >
                  <span
                    className={`font-bold text-white drop-shadow-sm ${featured ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
                      }`}
                  >
                    {c.name}
                  </span>

                  {shown.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {shown.map((child) => (
                        <span
                          key={child.id}
                          className="rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm transition-colors duration-300 group-hover:border-white/40 group-hover:bg-white/20"
                        >
                          {child.name}
                        </span>
                      ))}
                      {extra > 0 && (
                        <span className="rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                          +{extra}
                        </span>
                      )}
                    </div>
                  )}

                  <span className="flex items-center gap-1 text-xs font-semibold text-white transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary-foreground">
                    Xem sản phẩm <ArrowRight className="size-3.5" />
                  </span>
                </div>

                {/* Hover ring accent */}
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
