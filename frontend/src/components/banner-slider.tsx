"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getBanners } from "@/lib/endpoints";
import type { Banner } from "@/lib/types";

const DEFAULT_RECT_BANNERS = [
  { src: "/banner-1.webp", alt: "Khuyến mãi 1" },
  { src: "/banner-3.webp", alt: "Khuyến mãi 3" },
  { src: "/banner-cn.webp", alt: "Khuyến mãi" },
  { src: "/banner-cn-1.webp", alt: "Khuyến mãi" },
];

const DEFAULT_SQUARE_BANNERS = [
  { src: "/banner-2.webp", alt: "Khuyến mãi 2" },
  { src: "/banner-4.webp", alt: "Khuyến mãi 4" },
  { src: "/banner-5.webp", alt: "Khuyến mãi 5" },
  { src: "/banner-6.webp", alt: "Khuyến mãi 6" },
  { src: "/banner-7.webp", alt: "Khuyến mãi 7" },
  { src: "/banner-8.webp", alt: "Khuyến mãi 8" },
];

/**
 * Pinned scroll-driven horizontal banner gallery — same mechanic as Apple's
 * "Endless entertainment" section: the section stays pinned to the viewport
 * while scrolling down, and that vertical scroll progress is translated 1:1
 * into horizontal movement of the banner tracks (no autoplay/drag/snap).
 * Two rows move together: top row uses rectangle (16:9) cards, bottom row
 * uses square (1:1) cards.
 */
export function BannerSlider() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rectTrackRef = useRef<HTMLDivElement>(null);
  const squareTrackRef = useRef<HTMLDivElement>(null);
  const lastIndexRef = useRef(-1);
  const [rectBanners, setRectBanners] = useState<{ src: string; alt: string; link: string | null }[]>(
    DEFAULT_RECT_BANNERS.map((b) => ({ ...b, link: null })),
  );
  const [squareBanners, setSquareBanners] = useState<{ src: string; alt: string; link: string | null }[]>(
    DEFAULT_SQUARE_BANNERS.map((b) => ({ ...b, link: null })),
  );

  useEffect(() => {
    getBanners()
      .then((banners: Banner[]) => {
        const rect = banners
          .filter((b) => b.shape === "rect")
          .map((b) => ({ src: b.image, alt: b.title ?? "", link: b.link }));
        const square = banners
          .filter((b) => b.shape === "square")
          .map((b) => ({ src: b.image, alt: b.title ?? "", link: b.link }));
        if (rect.length > 0) setRectBanners(rect);
        if (square.length > 0) setSquareBanners(square);
      })
      .catch(() => { });
  }, []);

  const stepCount = Math.max(rectBanners.length, squareBanners.length);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // direction "right": track starts fully shifted left (hidden) and moves
    // towards its natural position as progress increases → visually slides
    // to the right. direction "left": normal, slides to the left.
    function moveTrack(
      track: HTMLDivElement | null,
      progress: number,
      direction: "left" | "right",
    ) {
      if (!track) return;
      const shift = Math.max(0, track.scrollWidth - window.innerWidth);
      // Continuous 1:1 mapping — both tracks move together in real time as
      // you scroll (no per-step snapping/waiting), and both still finish
      // together because they share the same 0..1 progress value.
      const magnitude = progress * shift;
      const targetX = reduceMotion ? 0 : direction === "left" ? -magnitude : magnitude - shift;
      track.style.transform = `translateX(${targetX}px)`;
    }

    let rafId = 0;
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
        if (scrollableHeight <= 0) return;
        const progress = Math.min(1, Math.max(0, -rect.top / scrollableHeight));

        moveTrack(rectTrackRef.current, progress, "right");
        moveTrack(squareTrackRef.current, progress, "left");

        const stepIndex = Math.round(progress * (stepCount - 1));
        if (stepIndex !== lastIndexRef.current) {
          lastIndexRef.current = stepIndex;
        }
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
  }, [stepCount]);

  return (
    <section
      id="banner-slider"
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: `${stepCount * 60}vh` }}
    >
      <div className="sticky top-0 flex h-dvh flex-col gap-2 overflow-hidden sm:gap-4">
        <div
          ref={rectTrackRef}
          className="flex h-[42%] gap-2 pl-3 will-change-transform transition-transform duration-500 ease-out sm:h-1/2 sm:gap-4 sm:pl-4"
        >
          {rectBanners.map((banner, i) => (
            <div
              key={banner.src}
              className="relative h-full w-auto shrink-0 aspect-[16/9] overflow-hidden"
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                unoptimized
                priority={i === 0}
                sizes="(max-width: 640px) 70vw, 40vw"
                className="object-cover"
              />
            </div>
          ))}
          <div aria-hidden className="w-3 shrink-0 sm:w-4" />
        </div>

        <div
          ref={squareTrackRef}
          className="flex h-[42%] gap-2 pl-3 will-change-transform transition-transform duration-500 ease-out sm:h-1/2 sm:gap-4 sm:pl-4"
        >
          {squareBanners.map((banner) => (
            <div
              key={banner.src}
              className="relative h-full w-auto shrink-0 aspect-square overflow-hidden bg-muted"
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                unoptimized
                sizes="(max-width: 640px) 42vw, 25vw"
                className="object-contain"
              />
            </div>
          ))}
          <div aria-hidden className="w-3 shrink-0 sm:w-4" />
        </div>
      </div>
    </section>
  );
}
