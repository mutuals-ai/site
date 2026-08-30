"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { copy } from "@/lib/copy";

// Isomorphic layout effect: real useLayoutEffect on the client (initial
// positions land before first paint), a no-op-equivalent useEffect on the
// server. Mirrors HeroDemo.tsx.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** mulberry32 — tiny, deterministic PRNG. Mirrors src/lib/waveform.ts and StoryGraph.tsx. */
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

type Node = {
  /** Base position, fraction of container [0,1]. */
  fx: number;
  fy: number;
  /** Ambient drift: a slow long-period wander plus a faster small wobble, per axis. */
  wanderPhaseX: number;
  wanderFreqX: number;
  wobblePhaseX: number;
  wobbleFreqX: number;
  wanderPhaseY: number;
  wanderFreqY: number;
  wobblePhaseY: number;
  wobbleFreqY: number;
  /** 0.5..1.5: scales this node's drift and mouse-parallax amplitude, so the
   * field reads as having depth rather than moving as one flat sheet. */
  depth: number;
  name: string;
  initials: string;
  /** Latest drifted+parallaxed pixel position, written each rAF frame. */
  cx?: number;
  cy?: number;
};

type Edge = { a: number; b: number; breathPhase: number; breathFreq: number };

const NODE_COUNT_DESKTOP = 12;
const NODE_COUNT_MOBILE = 8;

// Central headline/sub/form exclusion zone, as fractions of the layer.
const EXCLUDE_DESKTOP = { x0: 0.28, x1: 0.72, y0: 0.1, y1: 0.62 };
const EXCLUDE_MOBILE = { x0: 0.15, x1: 0.85, y0: 0.08, y1: 0.7 };

// Keep nodes clear of the waveform band regardless of viewport height: cap
// placement to the upper part of the hero.
const Y_MAX_DESKTOP = 0.6;
const Y_MAX_MOBILE = 0.64;
const Y_MIN = 0.04;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const chars = parts.length > 1 ? [parts[0][0], parts[parts.length - 1][0]] : [parts[0]?.[0] ?? "", parts[0]?.[1] ?? ""];
  return chars.join("").toUpperCase();
}

function keyOf(i: number, j: number): string {
  return i < j ? `${i}-${j}` : `${j}-${i}`;
}

function buildNetwork(seed: number, isMobile: boolean): { nodes: Node[]; edges: Edge[] } {
  const rand = mulberry32(seed);
  const count = isMobile ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
  const exclude = isMobile ? EXCLUDE_MOBILE : EXCLUDE_DESKTOP;
  const yMax = isMobile ? Y_MAX_MOBILE : Y_MAX_DESKTOP;
  const minDist = isMobile ? 0.16 : 0.13;
  const names = copy.network.names.slice(0, count);

  const inExclusion = (fx: number, fy: number) => fx >= exclude.x0 && fx <= exclude.x1 && fy >= exclude.y0 && fy <= exclude.y1;

  const nodes: Node[] = [];
  const farEnough = (fx: number, fy: number) => nodes.every((n) => Math.hypot(n.fx - fx, n.fy - fy) >= minDist);

  for (let i = 0; i < count; i++) {
    let fx = 0;
    let fy = 0;
    let tries = 0;
    do {
      // Keep a margin from the left/right edges so drift + mouse parallax
      // (bounded further at runtime, see the rAF loop) can't push a node's
      // base position past the viewport and cause horizontal scroll.
      fx = 0.08 + rand() * 0.84;
      fy = Y_MIN + rand() * (yMax - Y_MIN);
      tries += 1;
    } while ((inExclusion(fx, fy) || !farEnough(fx, fy)) && tries < 60);

    nodes.push({
      fx,
      fy,
      wanderPhaseX: rand() * Math.PI * 2,
      wanderFreqX: 0.03 + rand() * 0.05,
      wobblePhaseX: rand() * Math.PI * 2,
      wobbleFreqX: 0.25 + rand() * 0.2,
      wanderPhaseY: rand() * Math.PI * 2,
      wanderFreqY: 0.03 + rand() * 0.05,
      wobblePhaseY: rand() * Math.PI * 2,
      wobbleFreqY: 0.25 + rand() * 0.2,
      depth: 0.5 + rand() * 1.0,
      name: names[i] ?? `Node ${i}`,
      initials: initialsOf(names[i] ?? `N${i}`),
    });
  }

  // Nearest-neighbour edges (k=2), deduped.
  const edgeMap = new Map<string, Edge>();
  const k = 2;
  nodes.forEach((n, i) => {
    const nearest = nodes
      .map((m, j) => ({ j, d: i === j ? Infinity : Math.hypot(n.fx - m.fx, n.fy - m.fy) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, k);
    nearest.forEach(({ j }) => {
      const key = keyOf(i, j);
      if (!edgeMap.has(key)) {
        edgeMap.set(key, { a: Math.min(i, j), b: Math.max(i, j), breathPhase: rand() * Math.PI * 2, breathFreq: 0.2 + rand() * 0.3 });
      }
    });
  });

  // A few long random links so the graph reads as one connected network
  // rather than isolated clusters of neighbours.
  const longLinkCount = isMobile ? 2 : 3;
  let guard = 0;
  let placed = 0;
  while (placed < longLinkCount && guard < 40) {
    guard += 1;
    const i = Math.floor(rand() * nodes.length);
    const j = Math.floor(rand() * nodes.length);
    if (i === j) continue;
    const key = keyOf(i, j);
    if (edgeMap.has(key)) continue;
    edgeMap.set(key, { a: Math.min(i, j), b: Math.max(i, j), breathPhase: rand() * Math.PI * 2, breathFreq: 0.2 + rand() * 0.3 });
    placed += 1;
  }

  return { nodes, edges: Array.from(edgeMap.values()) };
}

const SEED = 3;
const DRIFT_PX = 28;
const MOUSE_PARALLAX_PX = 24;
const AVATAR_HALF_DESKTOP = 28; // half of 56px
const AVATAR_HALF_MOBILE = 20; // half of 40px

/**
 * Floating avatar-network background for the hero. Purely decorative
 * (aria-hidden): a seeded scatter of 12 (8 on mobile) avatar nodes, kept out
 * of the headline/sub/form zone, connected by hairline edges in the `signal`
 * token colour, drifting with per-node depth, with mouse/scroll parallax and
 * an occasional signal pulse traveling along a random edge. Portraits render
 * in their natural colour (only the lines and the pulse carry the accent
 * colour); the layer is blurred and dimmed so the headline stays the clear
 * focus. Reduced motion: static, no drift/parallax/pulse.
 */
export function HeroNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollLayerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const nodeInnerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lineRefs = useRef<Array<SVGLineElement | null>>([]);
  const pulseDotRef = useRef<SVGCircleElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [size, setSize] = useState({ w: 1440, h: 900 });

  const { nodes, edges } = useMemo(() => buildNetwork(SEED, isMobile), [isMobile]);

  // Measure the layer and the desktop/mobile breakpoint before first paint,
  // so the seeded layout never flashes from one variant to the other.
  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setIsMobile(!mq.matches);
      if (rect.width > 0 && rect.height > 0) setSize({ w: rect.width, h: rect.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    import("@/lib/gsap").then(({ gsap, ScrollTrigger, prefersReducedMotion }) => {
      if (disposed) return;
      const reduceMotion = prefersReducedMotion();
      const nodeEls = nodeRefs.current;
      const innerEls = nodeInnerRefs.current;
      const lineEls = lineRefs.current;
      const half = isMobile ? AVATAR_HALF_MOBILE : AVATAR_HALF_DESKTOP;
      const edgeMargin = 2; // px, beyond the avatar radius itself

      // Base pixel position for a node's centre, before drift/parallax.
      const basePx = (n: Node) => ({ x: n.fx * size.w, y: n.fy * size.h });

      // Clamp a centre position so the full avatar circle (radius `half`)
      // always stays inside the given box: no amount of drift or mouse
      // parallax can push a node past the viewport edge and cause
      // horizontal (or vertical) scroll.
      const clampCenter = (x: number, y: number, boxW: number, boxH: number) => ({
        x: Math.min(boxW - half - edgeMargin, Math.max(half + edgeMargin, x)),
        y: Math.min(boxH - half - edgeMargin, Math.max(half + edgeMargin, y)),
      });

      // Static (no drift/parallax) placement, used for reduced motion and as
      // the initial paint before the animated version takes over. The node
      // wrapper's transform carries both the centre position and the
      // half-avatar offset, so the inner element is left transform-free for
      // GSAP's scale/opacity load-in (and later pulse) to own exclusively.
      const writeStatic = () => {
        nodes.forEach((n, i) => {
          const base = basePx(n);
          const { x, y } = clampCenter(base.x, base.y, size.w, size.h);
          const el = nodeEls[i];
          if (el) el.style.transform = `translate3d(${(x - half).toFixed(2)}px, ${(y - half).toFixed(2)}px, 0)`;
        });
        edges.forEach((edge, i) => {
          const a = basePx(nodes[edge.a]);
          const b = basePx(nodes[edge.b]);
          const line = lineEls[i];
          if (!line) return;
          line.setAttribute("x1", a.x.toFixed(2));
          line.setAttribute("y1", a.y.toFixed(2));
          line.setAttribute("x2", b.x.toFixed(2));
          line.setAttribute("y2", b.y.toFixed(2));
        });
      };
      writeStatic();

      if (reduceMotion) {
        gsap.set(innerEls, { opacity: 1, scale: 1 });
        gsap.set(lineEls, { strokeDashoffset: 0 });
        return;
      }

      // ── load-in ──
      gsap.set(innerEls, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });
      gsap.to(innerEls, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out", stagger: 0.05, delay: 0.3 });

      lineEls.forEach((line, i) => {
        if (!line) return;
        const a = basePx(nodes[edges[i].a]);
        const b = basePx(nodes[edges[i].b]);
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        line.style.strokeDasharray = `${len}`;
        line.style.strokeDashoffset = `${len}`;
      });
      gsap.to(lineEls, {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: "power1.inOut",
        stagger: 0.03,
        delay: 0.6,
      });

      // ── gentle scale pulses (1 → 1.06), started only after load-in has
      // fully settled so this repeating tween never fights the load-in tween
      // for control of the same `scale` property on the same elements ──
      let pulseTweens: gsap.core.Tween[] = [];
      const pulseSetupDelay = 0.3 + innerEls.length * 0.05 + 0.6;
      const pulseCall = gsap.delayedCall(pulseSetupDelay, () => {
        if (disposed) return;
        pulseTweens = innerEls
          .filter((el): el is HTMLDivElement => el != null)
          .map((el) =>
            gsap.to(el, {
              scale: 1.06,
              duration: 1.3 + Math.random() * 0.6,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              repeatDelay: 3 + Math.random() * 4,
              delay: Math.random() * 3,
            }),
          );
      });

      // ── scroll parallax: whole layer drifts up slightly through the hero ──
      const heroSection = container.closest("section") ?? container;
      const st = ScrollTrigger.create({
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: 0.4,
        onUpdate: (self) => {
          gsap.set(scrollLayerRef.current, { yPercent: -15 * self.progress });
        },
      });

      // ── mouse parallax + ambient drift + a signal pulse traveling along a
      // random edge every ~2s: one rAF loop, no per-frame DOM reads ──
      const pointer = { x: size.w / 2, y: size.h / 2 };
      const rectRef = { current: container.getBoundingClientRect() };
      const onPointerMove = (e: PointerEvent) => {
        pointer.x = e.clientX - rectRef.current.left;
        pointer.y = e.clientY - rectRef.current.top;
      };
      const onResize = () => {
        rectRef.current = container.getBoundingClientRect();
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("resize", onResize);

      let parallaxX = 0;
      let parallaxY = 0;
      let raf = 0;
      let running = true;
      const start = performance.now();

      type Pulse = { edgeIdx: number; start: number; duration: number };
      let activePulse: Pulse | null = null;
      let nextPulseAt = start + 800 + Math.random() * 800;

      const step = (now: number) => {
        const t = (now - start) / 1000;

        const halfW = rectRef.current.width / 2 || 1;
        const halfH = rectRef.current.height / 2 || 1;
        const targetX = Math.max(-1, Math.min(1, (pointer.x - halfW) / halfW)) * MOUSE_PARALLAX_PX;
        const targetY = Math.max(-1, Math.min(1, (pointer.y - halfH) / halfH)) * MOUSE_PARALLAX_PX;
        parallaxX += (targetX - parallaxX) * 0.05;
        parallaxY += (targetY - parallaxY) * 0.05;

        const boxW = rectRef.current.width;
        const boxH = rectRef.current.height;
        nodes.forEach((n, i) => {
          const { x: bx, y: by } = basePx(n);
          const wander = 0.7 * DRIFT_PX * n.depth;
          const wobble = 0.3 * DRIFT_PX * n.depth;
          const dx = Math.sin(t * n.wanderFreqX + n.wanderPhaseX) * wander + Math.sin(t * n.wobbleFreqX + n.wobblePhaseX) * wobble;
          const dy = Math.cos(t * n.wanderFreqY + n.wanderPhaseY) * wander + Math.cos(t * n.wobbleFreqY + n.wobblePhaseY) * wobble;
          const clamped = clampCenter(bx + dx + parallaxX * n.depth, by + dy + parallaxY * n.depth, boxW, boxH);
          n.cx = clamped.x;
          n.cy = clamped.y;
          const el = nodeEls[i];
          if (el) el.style.transform = `translate3d(${(n.cx - half).toFixed(2)}px, ${(n.cy - half).toFixed(2)}px, 0)`;
        });

        edges.forEach((edge, i) => {
          const a = nodes[edge.a];
          const b = nodes[edge.b];
          const line = lineEls[i];
          if (line && a.cx !== undefined && b.cx !== undefined) {
            line.setAttribute("x1", a.cx.toFixed(2));
            line.setAttribute("y1", (a.cy ?? 0).toFixed(2));
            line.setAttribute("x2", b.cx.toFixed(2));
            line.setAttribute("y2", (b.cy ?? 0).toFixed(2));
            const breathe = 0.5 + 0.5 * Math.sin(t * edge.breathFreq + edge.breathPhase);
            line.setAttribute("stroke-opacity", (0.08 + breathe * 0.2).toFixed(3));
          }
        });

        // Signal pulse: a small dot traveling along a random edge, roughly
        // every 2s, to read as "the network is alive".
        if (!activePulse && now >= nextPulseAt && edges.length > 0) {
          activePulse = { edgeIdx: Math.floor(Math.random() * edges.length), start: now, duration: 700 + Math.random() * 500 };
        }
        if (activePulse) {
          const p = Math.min(1, (now - activePulse.start) / activePulse.duration);
          const edge = edges[activePulse.edgeIdx];
          const a = nodes[edge.a];
          const b = nodes[edge.b];
          const dot = pulseDotRef.current;
          if (dot && a.cx !== undefined && b.cx !== undefined) {
            const dotX = a.cx + (b.cx - a.cx) * p;
            const dotY = (a.cy ?? 0) + ((b.cy ?? 0) - (a.cy ?? 0)) * p;
            const fade = Math.sin(Math.PI * p);
            dot.setAttribute("cx", dotX.toFixed(2));
            dot.setAttribute("cy", dotY.toFixed(2));
            dot.setAttribute("opacity", (0.2 + fade * 0.8).toFixed(3));
          }
          if (p >= 1) {
            activePulse = null;
            nextPulseAt = now + 1400 + Math.random() * 1400;
            if (dot) dot.setAttribute("opacity", "0");
          }
        }

        if (running) raf = requestAnimationFrame(step);
      };

      const io = new IntersectionObserver(
        (entries) => {
          running = entries[0]?.isIntersecting ?? true;
          if (running && !raf) raf = requestAnimationFrame(step);
          if (!running && raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
          pulseTweens.forEach((tw) => (running ? tw.play() : tw.pause()));
        },
        { threshold: 0 },
      );
      io.observe(container);

      raf = requestAnimationFrame(step);

      cleanup = () => {
        running = false;
        cancelAnimationFrame(raf);
        io.disconnect();
        st.kill();
        pulseCall.kill();
        pulseTweens.forEach((tw) => tw.kill());
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", onResize);
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [nodes, edges, size.w, size.h, isMobile]);

  const avatarSizeClass = "h-10 w-10 lg:h-14 lg:w-14";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 -z-0 overflow-hidden pointer-events-none"
    >
      <div ref={scrollLayerRef} className="absolute inset-0" style={{ opacity: 0.7, filter: "blur(1.5px)" }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${size.w} ${size.h}`}
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {edges.map((edge, i) => (
            <line
              key={`e${edge.a}-${edge.b}`}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              stroke="var(--signal)"
              strokeOpacity={0.18}
              strokeWidth={1}
            />
          ))}
          <circle ref={pulseDotRef} r={3} fill="var(--signal)" opacity={0} />
        </svg>

        {nodes.map((n, i) => (
          <div
            key={i}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            className="absolute left-0 top-0"
            style={{ willChange: "transform" }}
          >
            <div
              ref={(el) => {
                nodeInnerRefs.current[i] = el;
              }}
              className={`relative overflow-hidden rounded-full ${avatarSizeClass}`}
              style={{ border: "1px solid rgba(242,237,228,0.25)" }}
            >
              <img
                src={`/generated/avatars/a${String((i % NODE_COUNT_DESKTOP) + 1).padStart(2, "0")}.webp`}
                alt=""
                width={64}
                height={64}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="absolute inset-0 hidden items-center justify-center bg-paper-2 font-mono text-[11px] text-ink-soft"
                style={{ display: "none" }}
              >
                {n.initials}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vignette: darkens nodes that would otherwise sit right behind the
          headline/sub/form. A mask, not decoration; sits above the blurred
          layer and is not itself blurred. */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,12,11,0.75)_0%,rgba(14,12,11,0.2)_45%,transparent_70%)]"
      />
    </div>
  );
}
