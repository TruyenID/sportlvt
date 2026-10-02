"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/magnetic";
import { getHeroSlides } from "@/lib/endpoints";
import type { HeroSlide } from "@/lib/types";

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: -1,
    image: "/banner-1.webp",
    eyebrow: "Nhận in tên, số áo theo yêu cầu",
    heading: "Đồ thể thao chính hãng.\nCho mọi cuộc chơi.",
    description:
      "Khám phá bộ sưu tập giày, áo và dụng cụ thể thao được chọn lọc kỹ càng — kèm dịch vụ in tên, số theo yêu cầu.",
    cta_label: "Mua sắm ngay",
    cta_link: "/products",
    sort_order: 0,
    is_active: true,
  },
  {
    id: -2,
    image: "/banner-2.webp",
    eyebrow: "Bộ sưu tập mới",
    heading: "Phong cách thể thao.\nĐẳng cấp riêng biệt.",
    description:
      "Cập nhật những mẫu mới nhất từ các thương hiệu hàng đầu, tối ưu cho hiệu suất và phong cách.",
    cta_label: "Khám phá ngay",
    cta_link: "/products",
    sort_order: 1,
    is_active: true,
  },
  {
    id: -3,
    image: "/banner-3.webp",
    eyebrow: "Ưu đãi đặc biệt",
    heading: "Sẵn sàng cho\nmùa giải mới.",
    description:
      "Trang bị đầy đủ dụng cụ, trang phục thi đấu với mức giá tốt nhất chỉ có tại đây.",
    cta_label: "Xem ưu đãi",
    cta_link: "/products",
    sort_order: 2,
    is_active: true,
  },
];

const AUTOPLAY_MS = 6000;

export function HeroBanner() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getHeroSlides()
      .then((data) => {
        if (data.length > 0) setSlides(data);
      })
      .catch(() => { });
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    if (slides.length < 2) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
  }, [slides.length, stop]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  function goTo(next: number) {
    setIndex((next + slides.length) % slides.length);
    start();
  }

  const dragX = useRef(0);
  const dragging = useRef(false);

  function onDragStart(clientX: number) {
    dragging.current = true;
    dragX.current = clientX;
    stop();
  }

  function onDragEnd(clientX: number) {
    if (!dragging.current) return;
    dragging.current = false;
    const delta = clientX - dragX.current;
    const threshold = 50;
    if (delta > threshold) {
      goTo(index - 1);
    } else if (delta < -threshold) {
      goTo(index + 1);
    } else {
      start();
    }
  }

  const slide = slides[index] ?? slides[0];
  if (!slide) return null;

  return (
    <section
      className="relative h-[26rem] w-full cursor-grab touch-pan-y overflow-hidden bg-[oklch(0.97_0.008_20)] active:cursor-grabbing sm:h-[34rem] lg:h-[38rem]"
      onMouseEnter={stop}
      onMouseLeave={start}
      onMouseDown={(e) => onDragStart(e.clientX)}
      onMouseUp={(e) => onDragEnd(e.clientX)}
      onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
      onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
    >
      {/* Ảnh nền: mobile full-bleed phía sau text (có overlay tối để chữ rõ),
          từ sm trở lên chỉ chiếm phần bên phải, chừa chỗ cho text bên trái */}
      <div
        className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)] sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[62%] sm:[mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_100%)] sm:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_100%)]"
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            aria-hidden={i !== index}
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            <Image
              src={s.image}
              alt={s.heading}
              fill
              unoptimized
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-[center_30%] sm:object-right"
            />
          </div>
        ))}
      </div>
      {/* Overlay tối dần phía dưới để chữ nổi rõ trên ảnh ở mobile, ẩn từ sm */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[oklch(0.97_0.008_20)] via-[oklch(0.97_0.008_20)]/70 to-transparent sm:hidden"
      />

      {/* Cùng width với header (max-w-6xl), text đè lên bên trái */}
      <div className="relative mx-auto h-full w-full max-w-6xl px-4">
        <div
          key={slide.id}
          className="absolute inset-x-4 bottom-6 animate-hero-slide-in text-left sm:top-0 sm:left-0 sm:right-auto sm:bottom-auto sm:w-[45%] sm:pt-12"
        >
          {slide.eyebrow && (
            <span className="block text-xs font-bold tracking-[0.18em] text-foreground uppercase">
              {slide.eyebrow}
            </span>
          )}
          <h1 className="mt-3 text-balance text-xl leading-tight font-bold tracking-tight whitespace-pre-line text-foreground sm:mt-4 sm:text-3xl lg:text-4xl">
            {slide.heading}
          </h1>
          {slide.description && (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              {slide.description}
            </p>
          )}
          {slide.cta_label && slide.cta_link && (
            <Magnetic className="mt-5 inline-block sm:mt-7">
              <Link
                href={slide.cta_link}
                className="inline-flex items-center gap-1 rounded-full bg-foreground px-6 py-3 text-xs font-bold tracking-wide text-background uppercase transition-transform duration-300 active:scale-95"
              >
                {slide.cta_label}
                <ChevronRight className="size-3.5" />
              </Link>
            </Magnetic>
          )}
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-4">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Đi tới slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30 hover:bg-foreground/60"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
