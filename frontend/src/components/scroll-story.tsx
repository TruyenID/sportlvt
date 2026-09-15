"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Paddle3DModel from "./paddle-3d-model";

export type StoryPanel = {
  icon: ReactNode;
  title: string;
  desc: string;
  image: string;
  overlay?: string;
  align?: "start" | "end";
  /** Paddle artwork shown alongside this panel (defaults to /img-vuot.webp). */
  paddleImage?: string;
};

export function ScrollStory({ panels }: { panels: StoryPanel[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = wrapper.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        if (total <= 0) return;
        const p = Math.min(1, Math.max(0, -rect.top / total));
        const idx = Math.min(panels.length - 1, Math.floor(p * panels.length));
        setProgress(p);
        setActive(idx);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [panels.length]);

  // Signed distance from panel i to the *active* (stepped) panel index — not
  // the continuous scroll position. This makes the paddle stay perfectly
  // still while scrolling within a panel, and only animate (via the CSS
  // transition below) the instant `active` flips to the next panel, exactly
  // in sync with when the text content switches.
  //
  // Important: this is intentionally NOT clamped to [-1, 1]. Clamping made
  // "waiting" panels rest at a fixed +150deg (before becoming active) or
  // -150deg (after being active) — two different, non-equivalent angles — so
  // a panel flipping in and a panel flipping out rotated through opposite
  // signs and looked like they spun in opposite directions. Using the raw
  // (unclamped) difference makes every panel's angle keep decreasing by a
  // constant -150deg per step, so all paddles always spin the same way,
  // however far forward/back the user scrolls.
  const flipDeltaFor = (i: number) => active - i;

  return (
    <div ref={wrapperRef} className="relative" style={{ height: `${panels.length * 100}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {panels.map((p, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
            style={{
              backgroundImage: `${p.overlay ?? "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.65))"}, url(${p.image})`,
              // Stepped on `active` (not the continuous scroll position), so the
              // background only crossfades the instant the panel switches — in
              // sync with the text and paddle flip — instead of fading gradually
              // throughout the whole scroll of a panel.
              opacity: i === active ? 1 : 0,
              willChange: "opacity",
            }}
          />
        ))}

        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          style={{ perspective: "1600px" }}
        >
          {panels.map((p, i) => {
            const d = flipDeltaFor(i); // unclamped: ...,-1, 0, 1, 2,...
            const dClamped = Math.max(-1, Math.min(1, d)); // for slide/scale only
            const baseX = p.align === "end" ? -28 : 28;
            // Alternate each paddle's own flip direction: paddle 1 (i=0) spins
            // left, paddle 2 (i=1) spins right, paddle 3 (i=2) spins left, and
            // so on — a fixed direction per paddle (not per transition), so it
            // reads as a consistent left/right/left fan rather than every
            // paddle spinning the same way. Scrolling back up automatically
            // reverses each paddle's motion since it's just `d` flipping sign.
            // Direction alternates per TRANSITION (the boundary between two
            // adjacent panels), not per paddle's own index. This way both
            // paddles involved in the same transition always slide the same
            // way (no crossing paths / collision in the middle of the
            // screen — which is what caused the earlier jank), while
            // consecutive transitions still alternate left/right so each
            // paddle's entrance and exit reads as a left/right/left fan.
            //
            // IMPORTANT: the boundary must stay constant for the whole time
            // THIS paddle is mid-flip — it must not depend on the live
            // `active` value. `Math.min(i, active)` broke that: for the
            // paddle becoming active (i === new active), it evaluated to the
            // *old* active while incoming and to `i` itself right after,
            // flipping sign partway through a single flip (this is exactly
            // what made "vợt 3" swing through an unexpected front-facing
            // angle and peek through mid-rotation). Deriving the boundary
            // only from `i` and the sign of `d` (i - 1 while incoming/behind,
            // i while active/exiting) keeps the direction fixed for a
            // paddle's whole incoming or outgoing flip.
            const boundary = d <= 0 ? i - 1 : i;
            const directionSign = ((boundary % 2) + 2) % 2 === 0 ? 1 : -1;
            const translateX = baseX - dClamped * 55 * directionSign;
            const scale = 1 - Math.abs(dClamped) * 0.15;
            const visible = Math.abs(d) <= 1;
            // Real procedural Three.js model (see paddle-3d-model.tsx +
            // public/models/paddle.glb) replaces the flat paddle photos — it
            // does its own yaw/pitch/roll spin driven by `progress` (offset
            // per paddle index/direction so each still reads as flipping the
            // same way the old CSS rotateY did), so this wrapper only needs
            // to handle the left/right fan-out slide, scale and crossfade.
            return (
              <div
                key={i}
                className="absolute flex h-[80%] w-[min(70vw,480px)] items-center justify-center transition-all duration-700 ease-in-out"
                style={{
                  willChange: "transform, opacity",
                  opacity: visible ? 1 : 0,
                  transform: `translateX(${translateX}%) scale(${scale})`,
                }}
              >
                <Paddle3DModel progress={progress + i * directionSign} />
              </div>
            );
          })}
        </div>

        {panels.map((p, i) => {
          const isActive = i === active;
          const alignClass = p.align === "end" ? "items-end text-right" : "items-start text-left";
          return (
            <div
              key={i}
              className={`absolute inset-0 z-20 flex flex-col justify-center px-8 transition-all duration-700 ease-in-out sm:px-16 ${alignClass}`}
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0)" : "translateY(24px)",
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <div
                className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur transition-transform duration-700"
                style={{ transform: isActive ? "perspective(1000px) rotateY(0deg)" : "perspective(1000px) rotateY(-30deg)" }}
              >
                {p.icon}
              </div>
              <h3 className="max-w-md text-3xl font-bold text-white sm:text-4xl">
                {p.title.split(" ").map((w, wi) => (
                  <span
                    key={wi}
                    className="mr-2 inline-block transition-all duration-500"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateY(0)" : "translateY(8px)",
                      transitionDelay: isActive ? `${wi * 60}ms` : "0ms",
                    }}
                  >
                    {w}
                  </span>
                ))}
              </h3>
              <p className="mt-3 max-w-sm text-sm text-white/80 sm:text-base">{p.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
