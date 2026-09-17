"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TextReveal } from "@/components/text-reveal";
import { formatVnd, productPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface EntertainmentGalleryProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

/**
 * "Card deck" gallery: các sản phẩm được xếp đều cạnh nhau như một bộ bài.
 * Khi hover vào thẻ nào, thẻ đó được "kéo ra" và phóng to chiếm phần lớn
 * không gian, các thẻ còn lại thu nhỏ lại — chuyển động mượt bằng transition
 * trên flex-grow (không cần JS tính toán vị trí/scroll).
 */
const EXPAND_DURATION_MS = 900;

export function EntertainmentGallery({ title, subtitle, products }: EntertainmentGalleryProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  // The card that has *finished* expanding — only this card should switch
  // its image to object-contain, so the image never looks "ahead" of the
  // card's own flex-basis transition (object-fit can't be animated/interpolated).
  const [settled, setSettled] = useState<number | null>(null);
  const [ratios, setRatios] = useState<Record<number, number>>({});
  const [trackHeight, setTrackHeight] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    if (hovered === null) {
      setSettled(null);
      return;
    }
    settleTimeoutRef.current = setTimeout(() => setSettled(hovered), EXPAND_DURATION_MS);
    return () => {
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    };
  }, [hovered]);

  useEffect(() => {
    function measure() {
      if (!trackRef.current) return;
      const style = window.getComputedStyle(trackRef.current);
      const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      setTrackHeight(trackRef.current.clientHeight - paddingY);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Debounce hover changes ("hover intent"): a card resizing under the
  // cursor can shift a neighbor beneath it, instantly re-triggering
  // mouseEnter on that neighbor and causing a flicker/disappear loop.
  // Waiting briefly before committing to a new hovered card avoids that.
  function scheduleHover(i: number | null) {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (i === null) {
      setHovered(null);
      return;
    }
    hoverTimeoutRef.current = setTimeout(() => setHovered(i), 120);
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  function handleTiltMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const x = px / rect.width - 0.5;
    const y = py / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${px}px`);
    el.style.setProperty("--my", `${py}px`);
  }

  function handleTiltLeave(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  if (!products.length) return null;

  return (
    <section className="relative w-full py-6 sm:py-8">
      <div className="flex flex-col overflow-hidden">
        <div className="w-full shrink-0 px-4 text-center sm:px-8">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            <TextReveal as="span">{title}</TextReveal>
          </h2>
          {subtitle && (
            <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="mt-4 w-full">
          <div
            ref={trackRef}
            className="flex h-[56vh] max-h-[520px] w-full gap-2 overflow-hidden rounded-none bg-white p-1.5"
            onMouseLeave={() => scheduleHover(null)}
          >
            {products.map((p, i) => {
              const price = productPrice(p);
              const isHovered = hovered === i;
              const isSettled = settled === i;
              const isDimmed = hovered !== null && !isHovered;
              const hoveredWidthPx = trackHeight * (ratios[p.id] || 1.4);
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onMouseEnter={() => scheduleHover(i)}
                  onFocus={() => scheduleHover(i)}
                  onMouseMove={isHovered ? handleTiltMove : undefined}
                  onMouseLeave={handleTiltLeave}
                  className={`group relative h-full shrink-0 overflow-hidden rounded-none [transform-style:preserve-3d] transition-[flex-grow,flex-basis,filter,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[flex-basis,filter,transform] ${isHovered ? "bg-white" : "bg-neutral-800"
                    }`}
                  style={
                    isHovered
                      ? {
                        flexGrow: 0,
                        flexShrink: 0,
                        flexBasis: `${hoveredWidthPx}px`,
                        filter: "brightness(1) saturate(1)",
                        transform:
                          "perspective(1200px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale3d(1.02, 1.02, 1.02)",
                      }
                      : {
                        flexGrow: 1,
                        flexShrink: 1,
                        flexBasis: 0,
                        filter: isDimmed ? "brightness(0.6) saturate(0.7)" : "brightness(1) saturate(1)",
                        transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
                      }
                  }
                >
                  {p.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      ref={(el) => {
                        // Cached images can finish loading before the onLoad
                        // handler is attached, so also capture dimensions
                        // synchronously on mount/update if already complete.
                        if (el && el.complete && el.naturalWidth && el.naturalHeight) {
                          const ratio = el.naturalWidth / el.naturalHeight;
                          setRatios((prev) => (prev[p.id] ? prev : { ...prev, [p.id]: ratio }));
                        }
                      }}
                      src={p.thumbnail}
                      alt={p.name}
                      onLoad={(e) => {
                        const { naturalWidth, naturalHeight } = e.currentTarget;
                        if (naturalWidth && naturalHeight) {
                          const ratio = naturalWidth / naturalHeight;
                          setRatios((prev) =>
                            prev[p.id] === ratio ? prev : { ...prev, [p.id]: ratio },
                          );
                        }
                      }}
                      style={{ transform: "translateZ(30px)" }}
                      className={`absolute inset-0 size-full transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${isHovered ? "scale-100" : "scale-105"
                        } ${isSettled ? "object-contain" : "object-cover"}`}
                    />
                  ) : null}
                  {/* Dynamic light sheen that follows the cursor, selling the 3D depth */}
                  {isHovered && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.35), transparent 60%)",
                        mixBlendMode: "overlay",
                      }}
                    />
                  )}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent transition-opacity duration-500"
                    style={{ opacity: isHovered ? 0 : 1 }}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-3 pt-8 opacity-0 transition-[opacity,transform] duration-500 ease-out"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? "translateY(0)" : "translateY(8px)",
                      transitionDelay: isHovered ? "300ms" : "0ms",
                    }}
                  >
                    <p className="line-clamp-1 text-sm font-semibold sm:text-base">{p.name}</p>
                    <span className="text-xs text-muted-foreground">{formatVnd(price)}</span>
                  </div>
                  <p
                    className="pointer-events-none absolute inset-x-3 bottom-3 line-clamp-1 text-xs font-medium text-white/90 drop-shadow transition-opacity duration-300"
                    style={{ opacity: isHovered ? 0 : 1 }}
                  >
                    {p.name}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
