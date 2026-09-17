"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  /** Plain text to reveal. Split into words (default) or kept as one line. */
  children: string;
  className?: string;
  /** "words" reveals each word from behind a mask; "line" reveals the whole string as one unit. */
  mode?: "words" | "line";
  /** Delay (ms) before the first word/line starts animating, once in view. */
  delay?: number;
  /** Gap (ms) between each word/line's start time. */
  stagger?: number;
  /** Per-word/line animation duration (ms). */
  duration?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

/**
 * Clip-mask word-by-word text reveal ("TextEngine" pattern): each word sits
 * inside an overflow-hidden box and slides up from translateY(115%)/opacity 0
 * to translateY(0)/opacity 1 the first time the text scrolls into view,
 * staggered word-by-word with an easeOutExpo-style curve. Pure CSS
 * transitions driven by an IntersectionObserver — no extra dependency.
 */
export function TextReveal({
  children,
  className,
  mode = "words",
  delay = 0,
  stagger = 60,
  duration = 900,
  as: Tag = "span",
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const units = mode === "words" ? children.split(" ") : [children];

  return (
    <Tag ref={ref as never} className="inline">
      {units.map((unit, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden pb-[0.14em] align-bottom"
        >
          {/* className (e.g. gradient bg-clip-text) is applied per-word here
              rather than on the outer wrapper — background-clip:text does
              not cascade into nested elements, so each masked word needs
              its own copy of the gradient/color classes to stay visible. */}
          <span
            className={cn(
              "inline-block transition-[transform,opacity] ease-[cubic-bezier(0.16,1,0.3,1)]",
              className,
            )}
            style={{
              transform: visible ? "translateY(0)" : "translateY(115%)",
              opacity: visible ? 1 : 0,
              transitionDuration: `${duration}ms`,
              transitionDelay: visible ? `${delay + i * stagger}ms` : "0ms",
            }}
          >
            {unit}
            {mode === "words" && i < units.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
