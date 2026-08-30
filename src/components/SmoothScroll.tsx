"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/** Lenis smooth scroll synced to the GSAP ticker. No-op under reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // anchor links
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const el = document.querySelector(a.getAttribute("href")!);
      if (!el) return;
      e.preventDefault();
      const target = el as HTMLElement;
      // Centre the target in the viewport (keeps it clear of the fixed nav), then focus its field.
      const offset = -Math.max(96, (window.innerHeight - target.offsetHeight) / 2);
      lenis.scrollTo(target, {
        offset,
        duration: 1.1,
        onComplete: () => target.querySelector<HTMLInputElement>("input:not([type=hidden])")?.focus({ preventScroll: true }),
      });
    };
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("click", onClick); gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);
  return null;
}
