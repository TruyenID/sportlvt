"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

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
            // Use the clamped delta (not the raw/unclamped one) for rotation
            // too. Scrolling fast through several panels used to keep growing
            // the raw `d` without bound (e.g. 2, 3, 4 steps away), so an
            // offscreen paddle's rotateY kept climbing to huge angles (450deg,
            // 600deg...) and the browser had to animate through all of that
            // the moment it came back into range — extra work that made the
            // visible transition feel less smooth. Clamping to the same
            // [-1, 1] range as translateX/scale keeps every paddle's angle
            // bounded to a single flip's worth of rotation at all times.
            const rotateY = dClamped * 150 * directionSign;
            const scale = 1 - Math.abs(dClamped) * 0.15;
            // Compensate for the source images not sharing the same aspect
            // ratio. The wrapper box below is a fixed size (same box for
            // every paddle, needed for a consistent rotation pivot/translateX
            // reference), so with object-contain a squarer/wider image (e.g.
            // vuot3D-3.webp ~1206x1305, vuot3D-4.webp 500x500) ends up
            // width-bound inside that box and renders shorter than a taller,
            // narrower image like img-vuot.webp/vuot3D-2.webp (1024x1536),
            // which are height-bound and fill the box's full height. Boosting
            // the image's own scale (not the wrapper's, so the flip pivot is
            // unaffected) brings all four paddles back to a matching visual
            // size.
            const paddleAspectBoost = [1, 1, 1.22, 1.32][i] ?? 1;
            const visible = Math.abs(d) <= 1;
            return (
              // Fixed-size wrapper (same box for every paddle image) instead of
              // sizing each <img> by its own natural aspect ratio ("w-auto").
              // The 4 source images don't all share the same crop/aspect ratio
              // (img-vuot.webp in particular is an older asset, framed
              // differently from the vuot3D-* set), so letting width follow
              // each image's own ratio gave every image a different rendered
              // size/pivot point — the flip looked smooth between two
              // similarly-framed images (vuot3D-2/3) but "off" whenever
              // img-vuot.webp was one side of the transition. object-contain
              // inside an identical box keeps size and rotation anchor
              // consistent for every pair, regardless of source aspect ratio.
              <div
                key={i}
                className="absolute flex h-[80%] w-[min(70vw,480px)] items-center justify-center transition-all duration-700 ease-in-out"
                style={{
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                  opacity: visible ? 1 : 0,
                  transform: `translateX(${translateX}%) rotateY(${rotateY}deg) rotate(${Math.sin(progress * Math.PI * 2) * 4}deg) scale(${scale})`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.paddleImage ?? "/img-vuot.webp"}
                  alt="Vợt pickleball"
                  className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-700 ease-in-out"
                  style={{ transform: `scale(${paddleAspectBoost})` }}
                />
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
