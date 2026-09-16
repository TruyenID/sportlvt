"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const RECT_BANNERS = [
  { src: "/banner-1.webp", alt: "Khuyến mãi 1" },
  { src: "/banner-3.webp", alt: "Khuyến mãi 3" },
  { src: "/banner-cn.webp", alt: "Khuyến mãi" },
  { src: "/banner-cn-1.webp", alt: "Khuyến mãi" },
];

const SQUARE_BANNERS = [
  { src: "/banner-2.webp", alt: "Khuyến mãi 2" },
  { src: "/banner-4.webp", alt: "Khuyến mãi 4" },
  { src: "/banner-5.webp", alt: "Khuyến mãi 5" },
  { src: "/banner-6.webp", alt: "Khuyến mãi 6" },
  { src: "/banner-7.webp", alt: "Khuyến mãi 7" },
  { src: "/banner-8.webp", alt: "Khuyến mãi 8" },
];

const STEP_COUNT = Math.max(RECT_BANNERS.length, SQUARE_BANNERS.length);

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

        const stepIndex = Math.round(progress * (STEP_COUNT - 1));
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
  }, []);

  return (
    <section
      id="banner-slider"
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: `${STEP_COUNT * 80}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col gap-px overflow-hidden">
        <div
          ref={rectTrackRef}
          className="flex h-1/2 gap-4 pl-4 will-change-transform transition-transform duration-500 ease-out"
        >
          {RECT_BANNERS.map((banner, i) => (
            <div
              key={banner.src}
              className="relative h-full w-auto shrink-0 aspect-[16/9] overflow-hidden"
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                priority={i === 0}
                className="object-contain"
              />
            </div>
          ))}
          <div aria-hidden className="w-4 shrink-0" />
        </div>

        <div
          ref={squareTrackRef}
          className="flex h-1/2 gap-4 pl-4 will-change-transform transition-transform duration-500 ease-out"
        >
          {SQUARE_BANNERS.map((banner) => (
            <div
              key={banner.src}
              className="relative h-full w-auto shrink-0 aspect-square overflow-hidden bg-muted"
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                className="object-contain"
              />
            </div>
          ))}
          <div aria-hidden className="w-4 shrink-0" />
        </div>
      </div>
    </section>
  );
}
