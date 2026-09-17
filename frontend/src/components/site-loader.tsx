"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Full-screen intro loader shown once per browser session, the first time
 * the site is opened. Fades out shortly after the page has painted.
 */
export function SiteLoader() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let alreadyShown = true;
    try {
      alreadyShown = sessionStorage.getItem("site-loaded") === "1";
    } catch {
      // sessionStorage unavailable (e.g. private mode) — just skip the loader.
    }
    if (alreadyShown) return;

    try {
      sessionStorage.setItem("site-loaded", "1");
    } catch {
      // ignore
    }

    // Scheduled via a 0ms timer instead of calling setVisible(true)
    // synchronously in the effect body — the react-hooks/set-state-in-effect
    // rule flags same-render setState-in-effect calls since they can
    // cascade into an extra render pass. A 0ms timer still fires before the
    // next paint, so the loader appears exactly as before.
    const showTimer = window.setTimeout(() => setVisible(true), 0);
    const leaveTimer = window.setTimeout(() => setLeaving(true), 900);
    const removeTimer = window.setTimeout(() => setVisible(false), 1400);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background transition-opacity duration-500 ease-out ${leaving ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
    >
      <div className="animate-loader-pop">
        <Image
          src="/logo-header.webp"
          alt=""
          width={96}
          height={96}
          priority
          className="size-20 rounded-none object-contain"
        />
      </div>
      <div className="h-0.5 w-32 overflow-hidden rounded-none bg-muted">
        <div className="animate-loader-bar h-full w-full origin-left rounded-none bg-primary" />
      </div>
    </div>
  );
}
