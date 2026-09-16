"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Use a subtle scale-in instead of slide-up (Apple-style product reveal). */
  variant?: "slide" | "scale";
  /** Transition duration in ms (default 1000, use a larger value for a slower reveal). */
  duration?: number;
}

/** Fades and slides content into view the first time it enters the viewport. */
export function Reveal({ children, className, delay = 0, variant = "slide", duration = 1000 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms", transitionDuration: `${duration}ms` }}
      className={cn(
        "transition-all ease-[cubic-bezier(0.22,1,0.36,1)]",
        variant === "scale"
          ? visible
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0"
          : visible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
