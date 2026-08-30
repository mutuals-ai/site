"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { copy } from "@/lib/copy";

/** mulberry32: tiny, fast, deterministic PRNG for a fixed seed. Mirrors src/lib/waveform.ts. */
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

type StageTier = 1 | 2 | 3;
export type Stage = 0 | StageTier;

type GraphNode = {
  id: number;
  /** Fraction of container [0,1]. Base (undrifted) position. */
  fx: number;
  fy: number;
  /** Per-node phase for the ambient sine drift. */
  phase: number;
  key?: string;
  name?: string;
  /** Latest drifted position, written each rAF frame (desktop only). */
  cx?: number;
  cy?: number;
};

type GraphEdge = {
  a: number;
  b: number;
  /** Tag identifying this as one of the reactive "story" edges. */
  special?: string;
};

type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };

/** The 8 named people the story timeline lights up, plus the anchor "you" node. */
const SPECIAL_DEFS: ReadonlyArray<{ key: string; name: string; fx: number; fy: number }> = [
  { key: "you", name: "you", fx: 0.53, fy: 0.42 },
  { key: "sarah", name: "Sarah Lin", fx: 0.33, fy: 0.2 },
  { key: "ben", name: "Ben Roth", fx: 0.4, fy: 0.16 },
  { key: "lukas", name: "James Whitfield", fx: 0.49, fy: 0.6 },
  { key: "mira", name: "Amara Okafor", fx: 0.58, fy: 0.66 },
  { key: "david", name: "Daniel Levy", fx: 0.52, fy: 0.82 },
  { key: "anna", name: "Anna Weiss", fx: 0.22, fy: 0.82 },
  { key: "tom", name: "Tom Adler", fx: 0.29, fy: 0.87 },
];

/** node key -> the story stage at which it lights up. "you" is always on. */
const NODE_TIER: Record<string, StageTier> = {
  sarah: 1,
  ben: 1,
  lukas: 2,
  mira: 2,
  david: 2,
  anna: 3,
  tom: 3,
};

/** [fromKey, toKey, edge tag, tier]: the edges the story timeline draws in. */
const SPECIAL_EDGES: ReadonlyArray<readonly [string, string, string, StageTier]> = [
  ["sarah", "ben", "sarah-ben", 1],
  ["you", "lukas", "you-lukas", 2],
  ["you", "mira", "you-mira", 2],
  ["you", "david", "you-david", 2],
  ["anna", "tom", "anna-tom", 3],
];

function keyOf(i: number, j: number): string {
  return i < j ? `${i}-${j}` : `${j}-${i}`;
}

function buildGraph(count: number, seed: number, maxX: number, labelCount: number): Graph {
  const rand = mulberry32(seed);
  const nodes: GraphNode[] = [];
  let nextId = 0;

  for (const s of SPECIAL_DEFS) {
    nodes.push({ id: nextId++, key: s.key, name: s.name, fx: Math.min(s.fx, maxX), fy: s.fy, phase: rand() * Math.PI * 2 });
  }

  const minDist = 0.05;
  // Keep random nodes out of the heading column so labels never sit on the type.
  const inHeadingZone = (fx: number, fy: number) => maxX < 0.8 && fx > 0.12 && fx < 0.48 && fy > 0.24 && fy < 0.78;
  const farEnough = (fx: number, fy: number) =>
    !inHeadingZone(fx, fy) && nodes.every((n) => Math.hypot(n.fx - fx, n.fy - fy) >= minDist);

  const extraLabelCount = Math.max(0, labelCount - SPECIAL_DEFS.length);
  const extraLabelNames = copy.network.names.slice(8, 8 + extraLabelCount);

  const place = (): { fx: number; fy: number } => {
    let fx = 0;
    let fy = 0;
    let tries = 0;
    do {
      fx = Math.pow(rand(), 1.4) * maxX;
      fy = 0.05 + rand() * 0.9;
      tries += 1;
    } while (!farEnough(fx, fy) && tries < 80);
    return { fx, fy };
  };

  for (const name of extraLabelNames) {
    const { fx, fy } = place();
    nodes.push({ id: nextId++, name, fx, fy, phase: rand() * Math.PI * 2 });
  }

  const unlabeledCount = Math.max(0, count - nodes.length);
  for (let i = 0; i < unlabeledCount; i += 1) {
    const { fx, fy } = place();
    nodes.push({ id: nextId++, fx, fy, phase: rand() * Math.PI * 2 });
  }

  const byKey = new Map<string, number>();
  nodes.forEach((n, i) => {
    if (n.key) byKey.set(n.key, i);
  });

  const edgeMap = new Map<string, GraphEdge>();
  const k = 2;
  nodes.forEach((n, i) => {
    const nearest = nodes
      .map((m, j) => ({ j, d: i === j ? Infinity : Math.hypot(n.fx - m.fx, n.fy - m.fy) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, k);
    nearest.forEach(({ j }) => {
      const key = keyOf(i, j);
      if (!edgeMap.has(key)) edgeMap.set(key, { a: Math.min(i, j), b: Math.max(i, j) });
    });
  });

  for (const [fromKey, toKey, tag] of SPECIAL_EDGES) {
    const i = byKey.get(fromKey);
    const j = byKey.get(toKey);
    if (i === undefined || j === undefined) continue;
    edgeMap.set(keyOf(i, j), { a: Math.min(i, j), b: Math.max(i, j), special: tag });
  }

  return { nodes, edges: Array.from(edgeMap.values()) };
}

const EDGE_TIER: Record<string, StageTier> = Object.fromEntries(SPECIAL_EDGES.map(([, , tag, tier]) => [tag, tier]));

export type StoryGraphHandle = { setStage: (stage: Stage) => void };

type StoryGraphProps = {
  variant?: "desktop" | "mobile";
  className?: string;
};

/**
 * Faint people-graph rendered behind the Story stage: a seeded, roughly
 * force-spread node field with hairline nearest-neighbour edges. On desktop
 * it drifts ambiently and reacts to the chat timeline via `setStage` (called
 * through the ref); on mobile it renders once, statically.
 */
export const StoryGraph = forwardRef<StoryGraphHandle, StoryGraphProps>(function StoryGraph(
  { variant = "desktop", className },
  ref,
) {
  const isDesktop = variant === "desktop";
  const nodeCount = isDesktop ? 40 : 20;
  const labelCount = isDesktop ? 14 : 10;
  const maxX = isDesktop ? 0.62 : 0.92;

  const graph = useMemo(() => buildGraph(nodeCount, 11, maxX, labelCount), [nodeCount, maxX, labelCount]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const circleRefs = useRef<Array<SVGCircleElement | null>>([]);
  const labelRefs = useRef<Array<SVGTextElement | null>>([]);
  const haloRefs = useRef<Map<string, SVGCircleElement>>(new Map());
  const edgeRefs = useRef<Array<SVGLineElement | null>>([]);
  const specialEdgeRefs = useRef<Map<string, SVGLineElement>>(new Map());

  const [size, setSize] = useState(() => (isDesktop ? { w: 1440, h: 900 } : { w: 390, h: 520 }));
  const stageRef = useRef<Stage>(0);

  const applyStage = (stage: Stage) => {
    graph.nodes.forEach((node, idx) => {
      if (!node.key) return;
      const tier = NODE_TIER[node.key];
      if (!tier) return; // "you" has no tier: stays always-on, set once at mount
      const active = stage >= tier;
      const circle = circleRefs.current[idx];
      if (circle) {
        circle.setAttribute("fill", active ? "var(--signal)" : "var(--ink)");
        circle.setAttribute("fill-opacity", active ? "1" : "0.35");
      }
      const label = labelRefs.current[idx];
      if (label) label.setAttribute("fill-opacity", active ? "1" : "0.35");
      const halo = haloRefs.current.get(node.key);
      if (halo) halo.style.opacity = active ? "1" : "0";
    });

    specialEdgeRefs.current.forEach((line, tag) => {
      const tier = EDGE_TIER[tag];
      const active = tier !== undefined && stage >= tier;
      line.style.strokeDashoffset = active ? "0" : (line.dataset.len ?? "0");
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      setStage(stage: Stage) {
        if (stageRef.current === stage) return;
        stageRef.current = stage;
        applyStage(stage);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph],
  );

  // Mobile is otherwise fully static; reduced motion (shown for any viewport
  // via the `lg:motion-safe:hidden` fallback block) shows the finished graph.
  useEffect(() => {
    if (isDesktop) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stageRef.current = 3;
      applyStage(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, graph]);

  // "you" is always lit, independent of stage.
  useEffect(() => {
    const idx = graph.nodes.findIndex((n) => n.key === "you");
    if (idx === -1) return;
    const circle = circleRefs.current[idx];
    if (circle) {
      circle.setAttribute("fill", "var(--signal)");
      circle.setAttribute("fill-opacity", "0.7");
    }
    const label = labelRefs.current[idx];
    if (label) label.setAttribute("fill-opacity", "0.6");
  }, [graph]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0 && rect.height > 0) setSize({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const el = containerRef.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = true;

    const tick = (t: number) => {
      graph.nodes.forEach((n, i) => {
        const cx = n.fx * size.w + Math.sin(t * 0.0006 + n.phase) * 6;
        const cy = n.fy * size.h + Math.cos(t * 0.0008 + n.phase * 1.3) * 6;
        const circle = circleRefs.current[i];
        if (circle) {
          circle.setAttribute("cx", String(cx));
          circle.setAttribute("cy", String(cy));
        }
        if (n.key) {
          const halo = haloRefs.current.get(n.key);
          if (halo) {
            halo.setAttribute("cx", String(cx));
            halo.setAttribute("cy", String(cy));
          }
        }
        const label = labelRefs.current[i];
        if (label) label.setAttribute("transform", `translate(${cx + 8}, ${cy + 3})`);
        n.cx = cx;
        n.cy = cy;
      });

      graph.edges.forEach((edge, i) => {
        const a = graph.nodes[edge.a];
        const b = graph.nodes[edge.b];
        const line = edgeRefs.current[i];
        if (line && a.cx !== undefined && a.cy !== undefined && b.cx !== undefined && b.cy !== undefined) {
          line.setAttribute("x1", String(a.cx));
          line.setAttribute("y1", String(a.cy));
          line.setAttribute("x2", String(b.cx));
          line.setAttribute("y2", String(b.cy));
        }
        if (edge.special) {
          const special = specialEdgeRefs.current.get(edge.special);
          if (special && a.cx !== undefined && a.cy !== undefined && b.cx !== undefined && b.cy !== undefined) {
            special.setAttribute("x1", String(a.cx));
            special.setAttribute("y1", String(a.cy));
            special.setAttribute("x2", String(b.cx));
            special.setAttribute("y2", String(b.cy));
          }
        }
      });

      if (visible) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible && !raf) raf = requestAnimationFrame(tick);
        if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(el);

    raf = requestAnimationFrame(tick);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isDesktop, graph, size]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2 overflow-hidden ${className ?? ""}`}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">
        <g>
          {graph.edges.map((edge, i) => {
            const a = graph.nodes[edge.a];
            const b = graph.nodes[edge.b];
            return (
              <line
                key={`e${a.id}-${b.id}`}
                ref={(el) => {
                  edgeRefs.current[i] = el;
                }}
                x1={a.fx * size.w}
                y1={a.fy * size.h}
                x2={b.fx * size.w}
                y2={b.fy * size.h}
                stroke="var(--ink)"
                strokeOpacity={0.1}
                strokeWidth={1}
              />
            );
          })}
          {SPECIAL_EDGES.map(([fromKey, toKey, tag]) => {
            const ai = graph.nodes.findIndex((n) => n.key === fromKey);
            const bi = graph.nodes.findIndex((n) => n.key === toKey);
            if (ai === -1 || bi === -1) return null;
            const a = graph.nodes[ai];
            const b = graph.nodes[bi];
            const len = Math.hypot((b.fx - a.fx) * size.w, (b.fy - a.fy) * size.h);
            return (
              <line
                key={tag}
                ref={(el) => {
                  if (el) specialEdgeRefs.current.set(tag, el);
                }}
                data-len={len}
                x1={a.fx * size.w}
                y1={a.fy * size.h}
                x2={b.fx * size.w}
                y2={b.fy * size.h}
                stroke="var(--signal)"
                strokeWidth={1.4}
                strokeDasharray={len}
                style={{ strokeDashoffset: len, transition: "stroke-dashoffset 700ms var(--ease-out-quart)" }}
              />
            );
          })}
        </g>
        <g>
          {graph.nodes.map((n, i) => (
            <g key={n.id}>
              {n.key ? (
                <circle
                  ref={(el) => {
                    if (el) haloRefs.current.set(n.key!, el);
                  }}
                  cx={n.fx * size.w}
                  cy={n.fy * size.h}
                  r={10}
                  fill="var(--signal)"
                  fillOpacity={0.25}
                  style={{ opacity: 0, transition: "opacity 500ms var(--ease-out-quart)" }}
                />
              ) : null}
              <circle
                ref={(el) => {
                  circleRefs.current[i] = el;
                }}
                cx={n.fx * size.w}
                cy={n.fy * size.h}
                r={3}
                fill="var(--ink)"
                fillOpacity={0.35}
                style={{ transition: "fill 500ms var(--ease-out-quart), fill-opacity 500ms var(--ease-out-quart)" }}
              />
            </g>
          ))}
        </g>
        <g className="font-mono" fontSize={11}>
          {graph.nodes.map((n, i) => {
            if (!n.name) return null;
            return (
              <text
                key={n.id}
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                transform={`translate(${n.fx * size.w + 8}, ${n.fy * size.h + 3})`}
                fill="var(--ink)"
                fillOpacity={0.35}
                style={{ transition: "fill-opacity 500ms var(--ease-out-quart)" }}
              >
                {n.name}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
});
