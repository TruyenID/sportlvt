"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight custom cursor inspired by lusion.co's "reactive cursor":
 * a small dot tracks the pointer instantly, a larger ring trails behind it
 * with lerped easing, and both grow/invert over interactive elements.
 *
 * Desktop (fine pointer) only — leaves touch devices untouched, and respects
 * prefers-reduced-motion by disabling the trailing easing.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: mouse.x, y: mouse.y };
    let hovering = false;
    let rafId = 0;

    function onMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
      }
    }

    function onPointerOver(e: PointerEvent) {
      const target = e.target as HTMLElement;
      hovering = !!target.closest("a, button, [data-cursor='link']");
    }

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });

    function tick() {
      const ease = reduceMotion ? 1 : 0.18;
      ring.x += (mouse.x - ring.x) * ease;
      ring.y += (mouse.y - ring.y) * ease;
      if (ringRef.current) {
        const scale = hovering ? 2.2 : 1;
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    document.body.classList.add("has-custom-cursor");

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerover", onPointerOver);
      cancelAnimationFrame(rafId);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      <div
        ref={ringRef}
        className="fixed left-0 top-0 size-8 rounded-full border border-foreground/70 mix-blend-difference transition-[width,height] duration-300 will-change-transform"
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 size-1.5 rounded-full bg-foreground mix-blend-difference will-change-transform"
      />
    </div>
  );
}
