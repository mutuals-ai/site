"use client";
import { useEffect } from "react";
import { ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Scroll setup. Scrolling itself is native (no JS smoothing) so scrollbar
 * drags, trackpads, wheels, keyboards, and touch all behave identically.
 * ScrollTrigger scrubs provide the easing on the animations instead.
 */
export function SmoothScroll() {
  useEffect(() => {
    // iOS/Android address-bar show/hide fires resize events; ignoring them
    // stops pinned sections from recalculating (and jumping) mid-scroll.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const target = document.querySelector<HTMLElement>(a.getAttribute("href")!);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - Math.max(96, (window.innerHeight - target.offsetHeight) / 2);
      window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      window.setTimeout(() => target.querySelector<HTMLInputElement>("input:not([type=hidden])")?.focus({ preventScroll: true }), 700);
    };
    document.addEventListener("click", onClick);
    // Fonts change layout heights; refresh triggers once they are in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
