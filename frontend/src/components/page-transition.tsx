"use client";

import { startTransition, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Global page/route transition driver.
 *
 * Intercepts clicks on same-origin internal links and wraps the resulting
 * navigation in the native browser View Transitions API
 * (`document.startViewTransition`), producing smooth Page Fade / Page Slide
 * transitions between routes (see globals.css for the animation rules).
 * Falls back to a normal navigation when the API isn't supported.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const pendingPath = useRef<string | null>(null);

  // Trigger the transition once the target route has actually rendered.
  useEffect(() => {
    pendingPath.current = null;
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!document.startViewTransition) return;

      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const nextPath = url.pathname + url.search;
      const currentPath = window.location.pathname + window.location.search;
      if (nextPath === currentPath) return;

      e.preventDefault();
      pendingPath.current = nextPath;

      const transition = document.startViewTransition(() => {
        return new Promise<void>((resolve) => {
          startTransition(() => {
            router.push(nextPath);
            resolve();
          });
        });
      });

      transition.finished.catch(() => { });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return null;
}
