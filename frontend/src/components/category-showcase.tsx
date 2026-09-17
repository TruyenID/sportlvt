"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import type { Category } from "@/lib/types";

interface CategoryShowcaseProps {
  categories: Category[];
}

/**
 * "Solar system" style category showcase: a glowing sun at the center reads
 * "Danh mục sản phẩm", and each top-level category orbits around it as a
 * planet. Hovering a planet reveals its subcategories as small moons.
 */
// Vibrant per-planet color palette (border, glow shadow, chip accent).
const PLANET_COLORS = [
  { hue: "oklch(0.68 0.19 25)", ring: "oklch(0.68 0.19 25 / 0.5)" }, // red-orange
  { hue: "oklch(0.75 0.18 85)", ring: "oklch(0.75 0.18 85 / 0.5)" }, // amber
  { hue: "oklch(0.72 0.19 145)", ring: "oklch(0.72 0.19 145 / 0.5)" }, // green
  { hue: "oklch(0.68 0.16 220)", ring: "oklch(0.68 0.16 220 / 0.5)" }, // blue
  { hue: "oklch(0.62 0.2 300)", ring: "oklch(0.62 0.2 300 / 0.5)" }, // violet
  { hue: "oklch(0.7 0.19 350)", ring: "oklch(0.7 0.19 350 / 0.5)" }, // pink
];

// Fixed star positions/sizes/delays so the twinkling background doesn't
// reshuffle on every re-render.
const STARS = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 2 + (i % 3),
  delay: (i % 5) * 0.5,
}));

// Visual "looking down at a solar system" feel, done with plain 2D math
// instead of a real rotateX/perspective tilt: rings and planet orbit paths
// are both flattened vertically by SQUISH, so every planet traces the exact
// same ellipse as its ring with zero 3D projection involved. A true
// rotateX(...) billboard was tried before, but perspective keystones any
// object that isn't centered on the vanishing point — every off-center
// planet rendered as a distorted oval instead of a circle. Plain 2D
// scaling has no such distortion: circles stay perfectly round everywhere.
const SQUISH = 0.55;
const RING_RADIUS = [44, 34]; // % from center, matches the two dashed rings below

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  const roots = categories.filter((c) => !c.parent_id);
  const childrenOf = (id: number) => categories.filter((c) => c.parent_id === id);
  const [hovered, setHovered] = useState<number | null>(null);
  const hoveredRef = useRef<number | null>(null);
  // Mirrors whether a flight (click-to-zoom) transition is in progress, read
  // by the orbit rAF loop below. Without this, all planets kept recalculating
  // and writing `left`/`top` (layout properties) every frame WHILE the flight
  // clone and sun were also transitioning — the resulting reflow competed
  // with the compositor for main-thread time and read as a stutter right at
  // the moment of clicking, even though the flight animation itself only
  // ever animated `transform`. Freezing the orbit during the flight removes
  // that competition.
  const flightRef = useRef(false);
  const planetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const depthRefs = useRef<(HTMLDivElement | null)[]>([]);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Drill-down stack: clicking a planet that has subcategories "zooms" into
  // it — it becomes the new center sun, and its children become the
  // orbiting planets. `path` holds the trail of categories drilled into so
  // far (empty = the virtual root "Danh mục sản phẩm").
  const [path, setPath] = useState<Category[]>([]);
  const current = path[path.length - 1] ?? null;
  const orbiting = current ? childrenOf(current.id) : roots;

  const orbitPlaneRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLButtonElement>(null);

  // Two-stage "camera flight" transition (activetheory.net-style): clicking
  // a planet does NOT instantly swap content. Instead a clone of the exact
  // planet clicked flies from its orbit position to the sun's position/size
  // at scene center (stage 1, ~550ms) while the rest of the orbiting ring
  // fades out; only once it has visually "docked" at the center does the
  // data actually swap and the new children fade/scale in around it
  // (stage 2, handled by the .animate-orbit-zoom-in class below).
  const [flight, setFlight] = useState<null | {
    category: Category;
    image?: string | null;
    color: { hue: string; ring: string };
    from: { left: number; top: number; size: number };
    to: { left: number; top: number; size: number };
  }>(null);
  const [docked, setDocked] = useState(false);
  const flightTimeouts = useRef<number[]>([]);

  // The clone's box (left/top/width/height) is set ONCE to the source
  // planet's rect and never changes again — only a `transform`
  // (translate + scale) animates it to the sun's position/size. Animating
  // left/top/width/height directly (the previous approach) forces the
  // browser to recompute layout on every frame of the 600ms transition,
  // which is what produced the visible stutter ("khựng") especially on
  // lower-end devices; transform is compositor-only and stays smooth.
  const flightDx = flight ? flight.to.left + flight.to.size / 2 - (flight.from.left + flight.from.size / 2) : 0;
  const flightDy = flight ? flight.to.top + flight.to.size / 2 - (flight.from.top + flight.from.size / 2) : 0;
  const flightScale = flight ? flight.to.size / flight.from.size : 1;

  function zoomInto(c: Category, sourceEl: HTMLElement | null, color: { hue: string; ring: string }) {
    setHovered(null);
    if (!sourceEl || !sceneRef.current || !sunRef.current) {
      setPath((p) => [...p, c]);
      return;
    }
    flightTimeouts.current.forEach((t) => clearTimeout(t));
    flightTimeouts.current = [];

    const sceneRect = sceneRef.current.getBoundingClientRect();
    const elRect = sourceEl.getBoundingClientRect();
    const sunRect = sunRef.current.getBoundingClientRect();

    setFlight({
      category: c,
      image: c.image,
      color,
      from: { left: elRect.left - sceneRect.left, top: elRect.top - sceneRect.top, size: elRect.width },
      to: { left: sunRect.left - sceneRect.left, top: sunRect.top - sceneRect.top, size: sunRect.width },
    });
    setDocked(false);

    // Sequence the handoff instead of overlapping it: first let the old sun
    // finish its ~200ms fade-out (see the sun's own transition below), THEN
    // start flying the clone to dock at center. Docking sooner made the
    // clone arrive on top of a sun that hadn't visually left yet, which read
    // as an abrupt pop rather than "old center leaves, new one arrives".
    const SUN_EXIT_MS = 220;
    const FLIGHT_MS = 600;
    const dockTimer = window.setTimeout(() => setDocked(true), SUN_EXIT_MS);
    const commit = window.setTimeout(() => {
      setPath((p) => [...p, c]);
      setFlight(null);
      setDocked(false);
    }, SUN_EXIT_MS + FLIGHT_MS);
    flightTimeouts.current.push(dockTimer, commit);
  }
  function zoomToDepth(depth: number) {
    setHovered(null);
    flightTimeouts.current.forEach((t) => clearTimeout(t));
    flightTimeouts.current = [];
    setFlight(null);
    setDocked(false);
    setPath((p) => p.slice(0, depth));
  }

  // Cursor-driven 3D tilt (luxury-motion "Tilt Card" pattern): each planet
  // reads the pointer position relative to itself and sets --rx/--ry/--gx/--gy
  // custom properties directly on the DOM node (no re-render), so the sphere
  // tilts toward the cursor like a real reflective object and a light sheen
  // sweeps across its surface.
  const handlePlanetMouseMove = (i: number, e: React.MouseEvent) => {
    const el = linkRefs.current[i];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${x * 22}deg`);
    el.style.setProperty("--rx", `${-y * 22}deg`);
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  };
  const handlePlanetMouseLeave = (i: number) => {
    const el = linkRefs.current[i];
    if (el) {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    }
    setHovered(null);
  };

  const n = orbiting.length;
  const radius = RING_RADIUS[0]; // planets travel exactly along the outer ring

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    flightRef.current = !!flight;
  }, [flight]);

  // Drives the orbit with requestAnimationFrame instead of stacking CSS
  // transform animations (which would fight each other on the same
  // property) — one clock updates every planet's position directly so they
  // travel exactly along the ring path and pause cleanly on hover.
  useEffect(() => {
    if (!n) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const degPerMs = 360 / (50 * 1000); // full revolution every 50s
    let angle = 0;
    let last = performance.now();
    let frame = 0;

    function tick(now: number) {
      const dt = now - last;
      last = now;
      if (hoveredRef.current === null && !flightRef.current) {
        angle = (angle + degPerMs * dt) % 360;
        for (let i = 0; i < n; i++) {
          const el = planetRefs.current[i];
          const depthEl = depthRefs.current[i];
          if (!el) continue;
          const a = ((i / n) * 360 + angle) * (Math.PI / 180);
          const x = 50 + radius * Math.cos(a);
          const y = 50 + radius * SQUISH * Math.sin(a);
          el.style.left = `${x}%`;
          el.style.top = `${y}%`;

          // Depth cue: planets on the near half of the ellipse (bottom of
          // screen, closer to viewer) render larger/brighter/in front of the
          // sun; planets on the far half shrink, dim, and tuck behind the
          // sun — mimicking a real orbit viewed at an angle instead of a
          // flat carousel where every planet looks identical.
          const depth = (Math.sin(a) + 1) / 2; // 0 = farthest, 1 = nearest
          el.style.zIndex = `${Math.round(depth * 30) + 5}`;
          if (depthEl) {
            depthEl.style.transform = `scale(${(0.85 + depth * 0.3).toFixed(3)})`;
            depthEl.style.opacity = `${(0.82 + depth * 0.18).toFixed(3)}`;
          }
        }
      }
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [n, radius]);

  if (!roots.length) return null;

  return (
    <section className="mt-24 w-full sm:mt-32">
      <Reveal>
        <p className="mx-auto max-w-6xl px-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Vũ trụ sản phẩm
        </p>
        <h2 className="mx-auto mt-2 max-w-6xl px-4 text-center text-balance bg-gradient-to-r from-primary via-[oklch(0.65_0.2_300)] to-[oklch(0.7_0.19_25)] bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-5xl">
          Khám phá theo danh mục
        </h2>
      </Reveal>

      {/* Breadcrumb / zoom trail — appears once the user has drilled into a
          category, letting them jump back to any ancestor level or the
          virtual root. */}
      <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-center gap-1.5 px-4 text-xs font-medium text-muted-foreground">
        <button
          type="button"
          onClick={() => zoomToDepth(0)}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${path.length === 0 ? "text-primary" : "hover:text-foreground"
            }`}
          // `fdprocessedid` is injected onto clickable elements by password-
          // manager browser extensions (LastPass/Dashlane-style form-fill
          // detection) directly on the DOM node BEFORE React hydrates —
          // React's own hydration-mismatch message explicitly lists this as
          // a cause. It's not something this code produces or can prevent;
          // suppressing here just stops the false-positive warning.
          suppressHydrationWarning
        >
          <Sparkles className="size-3" /> Danh mục sản phẩm
        </button>
        {path.map((c, i) => (
          <span key={c.id} className="flex items-center gap-1.5">
            <span className="text-muted-foreground/40">/</span>
            <button
              type="button"
              onClick={() => zoomToDepth(i + 1)}
              className={`rounded-full px-2.5 py-1 transition-colors ${i === path.length - 1 ? "text-primary" : "hover:text-foreground"
                }`}
            >
              {c.name}
            </button>
          </span>
        ))}
      </div>

      <Reveal
        variant="scale"
        delay={120}
        duration={800}
        className="relative mx-auto mt-6 flex h-[70vh] min-h-[420px] w-full items-center justify-center overflow-hidden [perspective:1200px] sm:mt-10 sm:h-[80vh] sm:max-h-[720px]"
      >
        {/* Scene wrapper — plain (no positioning of its own) so absolutely
            positioned descendants still resolve against the Reveal div
            above; exists purely to give the flight clone a stable
            coordinate space to measure "from" (clicked planet) and "to"
            (sun) rects against. */}
        {/* `perspective` must live on the DIRECT parent of whatever gets
            rotateX/rotateY/translateZ for the 3D depth to actually render —
            it was previously only on the Reveal div (a grandparent), which
            does nothing for translateZ on this div's children (the flight
            clone, the orbit plane): CSS perspective only projects one level
            down. Moving it here is what makes the flight/recede motion
            genuinely look like it has depth instead of a flat 2D slide. */}
        <div
          ref={sceneRef}
          className="relative flex h-full w-full items-center justify-center"
          style={{ perspective: "1200px" }}
        >
          {/* Deep-space backdrop wrapper — during a flight this whole layer
            (nebula glow + starfield) pushes forward with the camera, like
            hyperspace: it scales up and brightens slightly in sync with the
            flight clone's dock motion, so the zoom reads as "the whole scene
            rushes toward you" instead of just one clone growing on a static
            background. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              // Base zoom permanently increases one notch per drill-down
              // depth (path.length) and never resets/overshoots — while a
              // flight is docking, jump straight to the *final* depth's zoom
              // (path.length + 1) so the background eases in to exactly
              // where it will stay, with no extra transient push that would
              // then have to ease back down (that dip was reading as the
              // background "bung ra" / bouncing back out right after
              // zooming in).
              transform: `scale(${1 + (flight && docked ? path.length + 1 : path.length) * 0.12})`,
              filter: flight && docked ? "brightness(1.2)" : "brightness(1)",
              transitionProperty: "transform, filter",
            }}
          >
            {/* Near-black gradient with a faint nebula glow, so the orbit
              reads like real space instead of floating on white. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 45%, oklch(0.22 0.05 280) 0%, oklch(0.12 0.03 260) 55%, oklch(0.06 0.02 260) 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(40% 35% at 30% 70%, color-mix(in oklch, oklch(0.62 0.2 300) 25%, transparent), transparent 70%), radial-gradient(35% 30% at 75% 25%, color-mix(in oklch, var(--color-primary) 22%, transparent), transparent 70%)",
              }}
            />

            {/* Starfield background */}
            {STARS.map((s, i) => (
              <span
                key={i}
                className="animate-star-twinkle absolute rounded-full bg-white"
                style={{
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: s.size,
                  height: s.size,
                  animationDelay: `${s.delay}s`,
                  boxShadow: "0 0 4px 1px rgba(255,255,255,0.6)",
                }}
              />
            ))}
          </div>

          {/* Orbit plane: rings + planets share the same plain 2D coordinate
            system (radius% + SQUISH), so planets travel exactly along the
            elliptical ring path with no 3D projection involved — every
            sphere renders perfectly round regardless of how far it sits
            from the center. Sized as a true square (not the full
            rectangular section) and re-centered, so ring/planet
            percentages resolve against equal width/height — otherwise a
            wide, short section would stretch the circles into a lopsided,
            "méo" (warped) shape. */}
          <div
            key={current?.id ?? "root"}
            ref={orbitPlaneRef}
            className={`relative aspect-square h-full shrink-0 ${flight ? "pointer-events-none opacity-0" : "animate-orbit-zoom-in opacity-100"
              }`}
            style={{
              transform: flight ? "translateZ(-520px) rotateX(18deg) scale(0.72)" : "translateZ(0) rotateX(0deg) scale(1)",
              transformStyle: "preserve-3d",
              // Transform (the "recede into the distance" motion) runs the
              // full 600ms so it's clearly visible, while opacity only
              // starts fading after a short delay and finishes quicker —
              // otherwise fading both together made the ring vanish before
              // the recede motion had a chance to read.
              transition: flight
                ? "transform 600ms cubic-bezier(0.32,0,0.67,0), opacity 350ms ease-out 150ms"
                : undefined,
            }}
          >
            {/* Centered with `inset` (no transform needed) so the spin
              animation below — which sets `transform: rotate(...)` — has no
              other transform to fight with or overwrite, unlike the earlier
              translate(-50%,-50%) centering that drifted off-center as it
              spun. The dashed border rotating around a fixed-center ellipse
              still reads clearly as "orbiting the sun" since the ellipse
              itself never moves, only its dash pattern travels. */}
            {/* Static elliptical orbit paths — must NOT be rotated as a whole
              shape: since they're squished ellipses (not perfect circles),
              spinning the entire shape tilts it off-axis and it no longer
              matches the flat horizontal ellipse the planets actually travel
              along (that was the visible "lệch viền" bug). The rings simply
              mark the fixed path; motion is conveyed by the planets alone. */}
            {/* Note: Tailwind's `rounded-full` sets a fixed huge px radius,
              which the CSS border-radius overflow algorithm clamps using a
              single uniform factor for both axes — on a non-square (squished)
              box that produces a "stadium" (flat sides, round ends) instead
              of a true ellipse. `borderRadius: "50%"` uses independent
              percentages per axis, which is what actually yields a proper
              ellipse matching the planets' elliptical path. */}
            <div
              className="pointer-events-none absolute border border-dashed"
              style={{
                inset: `${50 - RING_RADIUS[0] * SQUISH}% ${50 - RING_RADIUS[0]}%`,
                borderRadius: "50%",
                borderColor: "color-mix(in oklch, var(--color-primary) 45%, transparent)",
                filter: "drop-shadow(0 0 6px color-mix(in oklch, var(--color-primary) 55%, transparent))",
              }}
            />
            <div
              className="pointer-events-none absolute border border-dashed"
              style={{
                inset: `${50 - RING_RADIUS[1] * SQUISH}% ${50 - RING_RADIUS[1]}%`,
                borderRadius: "50%",
                borderColor: "color-mix(in oklch, oklch(0.62 0.2 300) 45%, transparent)",
                filter: "drop-shadow(0 0 6px color-mix(in oklch, oklch(0.62 0.2 300) 55%, transparent))",
              }}
            />

            {/* Planets — position (left/top) is driven by the rAF loop above so
              they travel exactly along the outer ring, always rendered as
              plain flat circles (no rotateX billboard needed). */}
            {orbiting.map((c, i) => {
              const isHovered = hovered === i;
              const anyHovered = hovered !== null;
              const children = childrenOf(c.id);
              const hasChildren = children.length > 0;
              const color = PLANET_COLORS[i % PLANET_COLORS.length];
              const initialAngle = (i / n) * Math.PI * 2;
              // Rounded to a fixed number of decimals: Math.cos/Math.sin can
              // return values that differ in their last bit between the
              // server's V8 build and the browser's (e.g. "28%" vs
              // "27.99999999999998%"), which React's hydration check treats
              // as a real mismatch even though it's visually identical.
              // Rounding both the server and client render to the same
              // precision guarantees an identical string every time.
              const initialX = (50 + radius * Math.cos(initialAngle)).toFixed(4);
              const initialY = (50 + radius * SQUISH * Math.sin(initialAngle)).toFixed(4);
              const initialDepth = (Math.sin(initialAngle) + 1) / 2;

              return (
                <div
                  key={c.id}
                  ref={(el) => {
                    planetRefs.current[i] = el;
                  }}
                  // Zero-size anchor point — deliberately has no children-driven
                  // size, so it never needs a content-dependent translate() to
                  // "re-center" itself. It marks the exact (left, top) spot on
                  // the ring and nothing else.
                  className="absolute size-0"
                  style={{
                    left: `${initialX}%`,
                    top: `${initialY}%`,
                    zIndex: Math.round(initialDepth * 30) + 5,
                  }}
                  // The orbit rAF loop (see the effect above) starts writing
                  // raw, unrounded left/top/zIndex to this exact node via
                  // `planetRefs` on the very next animation frame after
                  // mount — i.e. essentially immediately, often before
                  // React finishes verifying the hydrated attributes. That
                  // makes a transient left/top/zIndex mismatch here expected
                  // and harmless (the `.toFixed(4)` above only fixes the
                  // *server-vs-client initial render* mismatch, not this
                  // "client immediately animates it away" one) — exactly the
                  // case React's docs recommend `suppressHydrationWarning`
                  // for, instead of trying to make an inherently-animated
                  // value never differ.
                  suppressHydrationWarning
                >
                  {/* Centering layer — the ONLY place that offsets by -50%/-50%,
                    always relative to its own box regardless of how wide the
                    label text or content is, so every planet's visual circle
                    lands exactly on the anchor point above (fixes the bug
                    where longer/shorter names pulled some planets off the
                    ring by different amounts). */}
                  <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
                    {/* Depth wrapper — scaled/dimmed continuously by the rAF loop
                      based on how "near" (bottom of the tilted ellipse) or
                      "far" (top) the planet currently is, so the orbit reads
                      like a real 3D path instead of a flat ring of identical
                      icons. */}
                    <div
                      ref={(el) => {
                        depthRefs.current[i] = el;
                      }}
                      style={{
                        transform: `scale(${(0.85 + initialDepth * 0.3).toFixed(3)})`,
                        opacity: 0.82 + initialDepth * 0.18,
                      }}
                      // Same rAF loop overwrites transform/opacity here too,
                      // immediately after mount — see suppressHydrationWarning
                      // note on the anchor div above.
                      suppressHydrationWarning
                    >
                      <div
                        className={anyHovered ? "" : "animate-planet-float"}
                        style={{ animationDelay: `${i * 0.3}s` }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => handlePlanetMouseLeave(i)}
                      >
                        <div className="relative" style={{ perspective: "600px" }}>
                          <Link
                            ref={(el) => {
                              linkRefs.current[i] = el;
                            }}
                            href={`/products?category=${c.slug}`}
                            onMouseMove={(e) => handlePlanetMouseMove(i, e)}
                            onClick={(e) => {
                              if (hasChildren) {
                                e.preventDefault();
                                zoomInto(c, e.currentTarget, color);
                              }
                            }}
                            className="group relative flex size-18 items-center justify-center overflow-hidden rounded-full border text-center backdrop-blur-sm will-change-transform sm:size-24"
                            style={{
                              borderColor: `color-mix(in oklch, ${color.hue} 55%, transparent)`,
                              background:
                                "radial-gradient(circle at 35% 30%, color-mix(in oklch, white 12%, transparent), oklch(0.18 0.03 260) 70%)",
                              boxShadow: isHovered
                                ? `0 0 0 6px ${color.ring}, 0 0 32px 4px ${color.ring}, 0 10px 28px -6px ${color.ring}`
                                : `0 0 16px -2px ${color.ring}, 0 4px 14px -4px oklch(0 0 0 / 0.5)`,
                              transform: `rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(${isHovered ? 1.12 : 1})`,
                              transition: "transform 400ms cubic-bezier(.03,.98,.52,.99), box-shadow 300ms ease-out",
                            }}
                          >
                            {/* Spherical shading overlay for a subtle "planet" look */}
                            <span
                              aria-hidden
                              className="pointer-events-none absolute inset-0 z-10"
                              style={{
                                background:
                                  "radial-gradient(circle at 30% 25%, color-mix(in oklch, white 30%, transparent), transparent 45%), radial-gradient(circle at 75% 80%, color-mix(in oklch, black 35%, transparent), transparent 60%)",
                              }}
                            />
                            {/* Cursor-tracking light sheen — sweeps across the sphere
                          surface as the pointer moves, reinforcing the tilt. */}
                            <span
                              aria-hidden
                              className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
                              style={{
                                opacity: isHovered ? 1 : 0,
                                background:
                                  "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), color-mix(in oklch, white 60%, transparent) 0%, transparent 55%)",
                                mixBlendMode: "overlay",
                              }}
                            />
                            {c.image ? (
                              <Image
                                src={c.image}
                                alt={c.name}
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <span
                                className="relative z-30 line-clamp-3 px-1.5 text-center text-[10px] leading-tight font-bold text-white sm:text-xs"
                                style={{
                                  color: isHovered ? color.hue : undefined,
                                  textShadow: "0 1px 3px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9)",
                                }}
                              >
                                {c.name}
                              </span>
                            )}
                          </Link>

                          {/* Hint chip — shown on hover when a planet has
                        subcategories, telling the user a click will zoom in
                        instead of navigating straight to the product list. */}
                          {hasChildren && (
                            <div
                              className={`absolute left-1/2 top-full z-30 mt-3 w-max -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-medium text-white/70 backdrop-blur-md transition-all duration-300 ${isHovered ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
                                }`}
                              style={{
                                borderColor: `color-mix(in oklch, ${color.hue} 45%, transparent)`,
                                background: "color-mix(in oklch, oklch(0.14 0.03 260) 85%, transparent)",
                                boxShadow: `0 0 24px -4px ${color.ring}, 0 10px 30px -8px rgba(0,0,0,0.6)`,
                                transitionTimingFunction: "cubic-bezier(.16,1,.3,1)",
                              }}
                            >
                              Bấm để xem {children.length} danh mục con
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sun — center label, kept flat (not tilted) so the text stays
            perfectly readable, floating above the orbit plane. When drilled
            into a category, the sun becomes that category (clickable to zoom
            back out), keeping the same "center of its own solar system"
            metaphor at every depth. */}
          <button
            ref={sunRef}
            type="button"
            onClick={() => current && zoomToDepth(path.length - 1)}
            disabled={!current || !!flight}
            className={`absolute left-1/2 top-1/2 z-10 flex size-24 flex-col items-center justify-center rounded-full bg-gradient-to-br from-primary via-[oklch(0.65_0.2_300)] to-[oklch(0.7_0.19_25)] text-center leading-tight text-primary-foreground transition-[opacity,scale] duration-200 ease-out sm:size-32 ${flight ? "pointer-events-none" : "animate-sun-pulse-glow"
              }`}
            style={{
              boxShadow:
                "0 0 40px 8px color-mix(in oklch, var(--color-primary) 45%, transparent), 0 0 90px 20px color-mix(in oklch, oklch(0.62 0.2 300) 25%, transparent)",
              cursor: current ? "pointer" : "default",
              // Centering translate lives in its OWN native CSS `translate`
              // property (Tailwind v4's -translate-x/y utilities compile to
              // this same property, not `transform`), kept separate from
              // `scale` below — setting both via a single `transform: translate(...) scale(...)`
              // string previously double-applied the -50%/-50% offset on
              // top of Tailwind's own `translate` property and threw the
              // sun off-center.
              translate: "-50% -50%",
              // The old sun must visually vanish FIRST (quick fade+shrink,
              // ~200ms) before the flight clone finishes its longer 600ms
              // flight to the same spot — otherwise the clone lands exactly
              // on top of a still-visible sun and the "swap" reads as an
              // abrupt pop instead of "the old center disappears, then the
              // new one arrives".
              opacity: flight ? 0 : 1,
              scale: flight ? 0.7 : 1,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 32% 28%, color-mix(in oklch, white 55%, transparent), transparent 55%)",
              }}
            />
            {current ? (
              <span className="relative line-clamp-2 px-2 text-[10px] font-bold uppercase tracking-wide sm:text-xs">
                {current.name}
              </span>
            ) : (
              <>
                <span className="relative text-[10px] font-bold uppercase tracking-wide sm:text-xs">Danh mục</span>
                <span className="relative text-[10px] font-bold uppercase tracking-wide sm:text-xs">sản phẩm</span>
              </>
            )}
          </button>

          {/* Flight clone — the actual "camera flies into the clicked
              planet" stage. A standalone circle starts at the clicked
              planet's exact position/size and, one frame later, gets its
              `docked` position/size (the sun's rect) applied so the browser
              animates the move via the `transition` below. Only once this
              finishes does the data swap happen (see zoomInto's timeout),
              so children never "pop" in — they always reveal after their
              parent has visually become the new center. */}
          {flight && (
            <div
              aria-hidden
              className="pointer-events-none absolute z-20 overflow-hidden rounded-full border transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              style={{
                // Box is fixed at the source planet's rect for the clone's
                // entire lifetime; only `transform` animates below.
                left: flight.from.left,
                top: flight.from.top,
                width: flight.from.size,
                height: flight.from.size,
                // Real 3D depth: the clone starts pushed back on the Z axis,
                // then flies forward toward the camera as it docks — relies
                // on the [perspective:1200px] set on the ancestor scene. The
                // translate/scale pair (computed from the from/to rects as
                // flightDx/flightDy/flightScale) is what actually
                // moves+resizes the clone from the planet's spot to the
                // sun's spot — GPU-composited, so it stays smooth instead of
                // the previous left/top/width/height animation which
                // triggered layout reflow every frame.
                //
                // Deliberately NOT mixing rotateX/rotateY into this same
                // transition anymore: browsers interpolate transform as a
                // single matrix, not per-function, so animating rotation
                // together with translate3d+scale on a perspective element
                // made the circle visibly warp into a distorted oval
                // mid-flight ("méo hình tròn") instead of moving cleanly.
                // Plain translate+scale (still moving through Z) keeps the
                // clone a perfect circle the whole time.
                transform: docked
                  ? `translate3d(${flightDx}px, ${flightDy}px, 0) scale(${flightScale})`
                  : "translate3d(0, 0, -420px) scale(1)",
                borderColor: `color-mix(in oklch, ${flight.color.hue} 55%, transparent)`,
                background: flight.image
                  ? undefined
                  : "linear-gradient(135deg, var(--color-primary), oklch(0.65 0.2 300))",
                boxShadow: `0 0 32px 4px ${flight.color.ring}, 0 10px 28px -6px ${flight.color.ring}`,
              }}
            >
              {flight.image && (
                <Image src={flight.image} alt="" fill unoptimized className="object-cover" />
              )}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
