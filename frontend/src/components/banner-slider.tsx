"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BANNERS = [
  { src: "/banner-1.webp", alt: "Khuyến mãi 1" },
  { src: "/banner-2.webp", alt: "Khuyến mãi 2" },
  { src: "/banner-3.webp", alt: "Khuyến mãi 3" },
  { src: "/banner-4.webp", alt: "Khuyến mãi 4" },
  { src: "/banner-5.webp", alt: "Khuyến mãi 5" },
  { src: "/banner-6.webp", alt: "Khuyến mãi 6" },
  { src: "/banner-7.webp", alt: "Khuyến mãi 7" },
  { src: "/banner-8.webp", alt: "Khuyến mãi 8" },
];

const AUTOPLAY_MS = 5000;

export function BannerSlider() {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    setIndex((i + BANNERS.length) % BANNERS.length);
  }, []);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % BANNERS.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/9] w-full">
        {BANNERS.map((banner, i) => (
          <Image
            key={banner.src}
            src={banner.src}
            alt={banner.alt}
            fill
            priority={i === 0}
            className={cn(
              "absolute inset-0 object-cover transition-opacity duration-1000 ease-in-out",
              i === index ? "opacity-100 animate-ken-burns" : "opacity-0 pointer-events-none",
            )}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="Ảnh trước"
        className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-background"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Ảnh tiếp theo"
        className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground shadow-sm backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-background"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {BANNERS.map((banner, i) => (
          <button
            key={banner.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Chuyển tới ảnh ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-primary" : "w-2 bg-background/70 hover:bg-background",
            )}
          />
        ))}
      </div>
    </section>
  );
}
