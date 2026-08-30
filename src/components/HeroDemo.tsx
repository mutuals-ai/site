"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
type GsapLib = typeof import("@/lib/gsap");
import { waveform } from "@/lib/waveform";

// Isomorphic layout effect: real useLayoutEffect on the client (so initial
// GSAP `set()` calls land before first paint, avoiding a flash of the
// server-rendered final state), a no-op-equivalent useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** mulberry32 — tiny, deterministic PRNG. Same seed → same pattern, always,
 * so the waveform never differs between server and client, or one load and
 * the next. No `Math.random()`. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A deterministic, high-variance "speech-like" bar pattern: bursts of 6-14
 * bars (occasionally peaking at 1.0) separated by quiet pauses of 3-8 bars
 * near 0.06, textured by the base 48-value waveform.ts shape and seeded
 * per-bar jitter (±25%). Spans the full 0.05-1.0 range with visible loud and
 * quiet sections rather than a flat, uniform silhouette.
 */
function buildSpeechPattern(count: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const out = new Array<number>(count).fill(0.06);
  let i = 0;
  while (i < count) {
    const burstLen = 6 + Math.floor(rand() * 9); // 6..14
    const peak = rand() < 0.14 ? 1.0 : 0.4 + rand() * 0.55;
    for (let k = 0; k < burstLen && i < count; k++, i++) {
      const mid = (burstLen - 1) / 2;
      const half = mid || 1;
      const d = Math.abs(k - mid) / half;
      const shape = Math.cos((Math.min(d, 1) * Math.PI) / 2); // 1 at center, 0 at edges
      const texture = waveform[i % waveform.length];
      const jitter = 1 + (rand() * 2 - 1) * 0.25;
      let v = peak * shape * (0.55 + 0.45 * texture) * jitter;
      if (rand() < 0.02) v = 1.0; // rare full spike
      out[i] = Math.min(1, Math.max(0.05, v));
    }
    const pauseLen = 3 + Math.floor(rand() * 6); // 3..8
    for (let k = 0; k < pauseLen && i < count; k++, i++) {
      const jitter = 1 + (rand() * 2 - 1) * 0.25;
      out[i] = Math.min(0.12, Math.max(0.05, 0.06 * jitter));
    }
  }
  return out;
}

type Layout = { width: number; height: number; barWidth: number; gap: number; pitch: number; count: number; maxBarHeight: number };

/** Pick a bar count from the measured band size so bars stay crisp (3px
 * desktop / 2px mobile) and the row fills the width edge to edge. */
function computeLayout(width: number, height: number): Layout {
  const isMobile = width < 640;
  const barWidth = isMobile ? 2 : 3;
  const gapTarget = isMobile ? 2 : 3;
  const count = Math.max(24, Math.floor(width / (barWidth + gapTarget)));
  const pitch = width / count;
  return { width, height, barWidth, gap: pitch - barWidth, pitch, count, maxBarHeight: height * 0.6 };
}

/** Linear-interpolated read into a looping array at a fractional index. */
function sampleLooped(arr: readonly number[], idx: number): number {
  const len = arr.length;
  const i0 = Math.floor(idx);
  const frac = idx - i0;
  const a = arr[((i0 % len) + len) % len];
  const b = arr[(((i0 + 1) % len) + len) % len];
  return a + (b - a) * frac;
}

const PATTERN_SEED_A = 0xc0ffee;
const PATTERN_SEED_B = 0x5eed5eed;

/** Ambient, full-bleed waveform. Nothing but bars: no transcript, no
 * receipt, no chips, no labels. Just a living signal under the headline,
 * scrubbed by scroll and reactive to the mouse. */
export function HeroDemo() {
  const bandRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [layout, setLayout] = useState<Layout>(() => computeLayout(1200, 320));
  // Rendered (SSR-safe) resting pattern: deterministic, identical on server
  // and client. The second pattern used for the crossfade only exists
  // client-side, inside the animation loop below.
  const heights = useMemo(() => buildSpeechPattern(layout.count, PATTERN_SEED_A), [layout.count]);

  // Measure the band once mounted, before paint, and again on resize. Only
  // commits a new layout when the numbers actually changed, so this doesn't
  // thrash the GSAP effect below on sub-pixel resize noise.
  useIsomorphicLayoutEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const measure = () => {
      const rect = band.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const next = computeLayout(rect.width, rect.height);
      setLayout((prev) =>
        prev.count === next.count && prev.width === next.width && prev.height === next.height ? prev : next,
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(band);
    return () => ro.disconnect();
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!bandRef.current || !svgRef.current) return;
    // Non-null asserted once, up front (the guard above already proved it at
    // runtime): read inside nested closures (event handlers, the rAF loop)
    // past where TypeScript's control-flow narrowing still applies.
    const band = bandRef.current!;
    const svg = svgRef.current!;

    const run = (lib: GsapLib, reduceMotion: boolean): (() => void) | undefined => {
      const { gsap, ScrollTrigger } = lib;
      const bars = Array.from(band.querySelectorAll<SVGRectElement>("[data-bar]"));

      if (reduceMotion) {
        // Static: the DOM already renders the resting waveform. No loop, no
        // scroll scrub, no mouse reactivity.
        gsap.set(band, { opacity: 0.85 });
        gsap.to(band, { opacity: 1, duration: 0.4, ease: "power1.out" });
        return;
      }

      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      const mouseXRef = { current: null as number | null };
      const bandRectRef = { current: band.getBoundingClientRect() };

      function onPointerMove(e: PointerEvent) {
        mouseXRef.current = e.clientX - bandRectRef.current.left;
      }
      function onPointerLeave() {
        mouseXRef.current = null;
      }
      function onResizeForMouse() {
        bandRectRef.current = band.getBoundingClientRect();
      }
      if (!isTouch) {
        band.addEventListener("pointermove", onPointerMove);
        band.addEventListener("pointerleave", onPointerLeave);
        window.addEventListener("resize", onResizeForMouse);
      }

      // ── bars rise in from collapsed on load ──
      // GSAP owns SVG transform origins; pin them to the bar centre so bars grow symmetrically.
      gsap.set(bars, { transformOrigin: "50% 50%", scaleY: (i: number) => heights[i] * 0.08 });
      gsap.to(bars, {
        scaleY: (i: number) => heights[i],
        duration: 0.9,
        ease: "power2.out",
        stagger: { amount: 0.6, from: "center" },
        delay: 0.6,
      });

      // ── scroll: advance the "playhead" through the pattern, and let the
      // band drift up slightly, so it reads as attached to the scroll ──
      const scrollRef = { current: 0 };
      const heroSection = band.closest("section") ?? band;
      const st = ScrollTrigger.create({
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: 0.4,
        onUpdate: (self) => {
          scrollRef.current = self.progress * 2 * bars.length;
          gsap.set(svg, { yPercent: -20 * self.progress });
        },
      });

      // ── endless "speech" loop: crossfades between two seeded patterns
      // every ~2.5s (sine ease), sampled with a fractional index that
      // advances with time and with the scroll-driven playhead, so the
      // shape keeps changing rather than just sliding sideways. A soft
      // breathing layer and mouse-x reactivity ride on top. One rAF loop
      // writes every bar's transform; no per-frame layout reads. ──
      const patternA = heights;
      const patternB = buildSpeechPattern(bars.length, PATTERN_SEED_B);
      let raf = 0;
      const current = heights.map((h) => h * 0.08);
      const timeSpeed = 3.2; // bars of pattern scrubbed per second
      const crossfadeSeconds = 2.5;
      const start = performance.now();

      function step(now: number) {
        const t = (now - start) / 1000;
        const idxBase = t * timeSpeed + scrollRef.current;
        const blend = (1 - Math.cos((Math.PI * t) / crossfadeSeconds)) / 2;
        const mx = mouseXRef.current;
        for (let i = 0; i < bars.length; i++) {
          const idx = i + idxBase;
          const a = sampleLooped(patternA, idx);
          const b = sampleLooped(patternB, idx);
          const base = a + (b - a) * blend;
          const breathing = 1 + Math.sin(t * 0.7 + i * 0.22) * 0.04;
          let boost = 0;
          if (mx != null) {
            const barX = i * layout.pitch + layout.barWidth / 2;
            const dx = Math.abs(barX - mx);
            if (dx < 140) boost = (1 - dx / 140) * 0.35;
          }
          const target = Math.min(1, base * breathing * (1 + boost));
          current[i] += (target - current[i]) * 0.12;
          bars[i].style.transform = `scaleY(${current[i]})`;
        }
        raf = requestAnimationFrame(step);
      }
      // GSAP bakes SVG origins into its matrix and sets transform-origin: 0 0;
      // restore a centre origin before hand-written transforms take over.
      for (const bar of bars) {
        bar.style.transformOrigin = "center";
        bar.style.transformBox = "fill-box";
        bar.removeAttribute("transform");
      }
      raf = requestAnimationFrame(step);

      return () => {
        cancelAnimationFrame(raf);
        st.kill();
        if (!isTouch) {
          band.removeEventListener("pointermove", onPointerMove);
          band.removeEventListener("pointerleave", onPointerLeave);
          window.removeEventListener("resize", onResizeForMouse);
        }
      };
    };

    let disposed = false;
    let cleanup: (() => void) | undefined;
    // GSAP is loaded after hydration so it never sits on the critical path;
    // the DOM already holds the resting waveform, so nothing visible waits on it.
    import("@/lib/gsap").then((lib) => {
      if (disposed) return;
      cleanup = run(lib, lib.prefersReducedMotion());
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [layout.count, layout.pitch, layout.barWidth, heights]);

  return (
    <div
      ref={bandRef}
      className="relative left-1/2 h-[260px] w-screen -translate-x-1/2 overflow-hidden border-y border-paper-2 lg:h-[38dvh] lg:min-h-[300px]"
    >
      {/* Waveform: full-bleed, bar count derived from measured width so bars stay crisp.
          `svgRef` (not the outer band) carries the scroll-driven yPercent drift, so it
          never fights the band's own translateX(-50%) full-bleed transform. */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        preserveAspectRatio="none"
        className="absolute inset-0"
        aria-hidden="true"
      >
        {heights.map((h, i) => (
          <rect
            key={i}
            data-bar
            data-index={i}
            x={(i * layout.pitch).toFixed(3)}
            y={((layout.height - layout.maxBarHeight) / 2).toFixed(3)}
            width={layout.barWidth}
            height={layout.maxBarHeight.toFixed(3)}
            rx={1}
            className="fill-signal"
            style={{ transformOrigin: "center", transformBox: "fill-box", transform: `scaleY(${h.toFixed(4)})` }}
          />
        ))}
      </svg>
    </div>
  );
}
