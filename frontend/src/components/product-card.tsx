"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, ShoppingBag } from "lucide-react";
import { useRef } from "react";
import { formatVnd, productPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const price = productPrice(product);
  const hasDiscount = product.sale_price != null && product.sale_price < product.base_price;
  const secondImage = product.images?.find((img) => img.url && img.url !== product.thumbnail)?.url;
  const cardRef = useRef<HTMLAnchorElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const x = px / rect.width - 0.5;
    const y = py / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${px}px`);
    el.style.setProperty("--my", `${py}px`);
  }

  function handleMouseLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <Link
      ref={cardRef}
      href={`/products/${product.slug}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:
          "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(0)",
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[transform,box-shadow] duration-300 ease-out [transform-style:preserve-3d] will-change-transform hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20"
    >
      {/* Border glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-primary) 35%, transparent), transparent 70%)",
          padding: 1,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {/* Glow spotlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 70%)",
        }}
      />

      <div
        className="relative aspect-square w-full overflow-hidden bg-muted [clip-path:inset(0)]"
        style={{ viewTransitionName: `product-image-${product.id}` } as React.CSSProperties}
      >
        {product.thumbnail ? (
          <>
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              unoptimized
              className={`object-cover transition-all duration-500 ease-out scale-100 group-hover:scale-110 ${secondImage ? "group-hover:opacity-0" : ""}`}
            />
            {secondImage && (
              <Image
                src={secondImage}
                alt={product.name}
                fill
                unoptimized
                className="object-cover opacity-0 scale-110 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Không có ảnh
          </div>
        )}

        {hasDiscount && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            -{Math.round((1 - product.sale_price! / product.base_price) * 100)}%
          </span>
        )}

        {/* Dark overlay + quick actions */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="mb-3 flex translate-y-3 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm">
              <Eye className="size-4" />
            </span>
            <span className="flex size-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm">
              <ShoppingBag className="size-4" />
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-1 p-3.5" style={{ transform: "translateZ(20px)" }}>
        {product.brand?.name && (
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-1.5">
          <span className="font-bold text-primary">{formatVnd(price)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatVnd(product.base_price)}
            </span>
          )}
        </div>
        {/* Content reveal */}
        <div className="grid grid-rows-[0fr] transition-all duration-300 ease-out group-hover:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <p className="pt-2 text-xs font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Xem chi tiết sản phẩm →
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
