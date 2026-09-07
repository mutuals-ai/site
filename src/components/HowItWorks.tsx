"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { copy } from "@/lib/copy";
import { waveform } from "@/lib/waveform";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ────────────────────────────────────────────────────────────────────────────
   Scene 1 · You talk.
   The voice note, and its transcript appearing word by word as if live.
   ──────────────────────────────────────────────────────────────────────────── */

const VOICE_BARS = waveform.slice(0, 40);

function MicGlyph({ size = 12, color = "#8696A0" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="4.5" y="1" width="3" height="6" rx="1.5" stroke={color} strokeWidth="0.9" />
      <path d="M2.5 6.5a3.5 3.5 0 0 0 7 0" stroke={color} strokeWidth="0.9" strokeLinecap="round" />
      <path d="M6 10v1.2" stroke={color} strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

function VoiceBubble() {
  return (
    <div
      data-bubble
      className="inline-flex items-center gap-3 rounded-2xl rounded-tr-sm bg-[#005C4B] py-2.5 pl-3 pr-4 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.8)]"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.12)]">
        <MicGlyph size={13} />
      </span>
      <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0 text-[#E9EDEF]" aria-hidden="true">
        <path d="M1 0.5 L9 5 L1 9.5 Z" fill="currentColor" />
      </svg>
      <div className="flex h-[20px] items-center gap-[2px]" aria-hidden="true">
        {VOICE_BARS.map((h, i) => (
          <span key={i} data-bar className="w-[2px] shrink-0 rounded-full bg-signal" style={{ height: `${Math.max(3, h * 20)}px` }} />
        ))}
      </div>
      <span data-timer className="min-w-[3ch] font-mono text-[12px] tabular-nums text-[#E9EDEF]/85">
        0:0{copy.how.voice.duration}
      </span>
      <span className="ml-1 flex items-center gap-1 font-mono text-[11px] text-[#8696A0]">
        {copy.how.voice.time}
        <span className="text-[#53BDEB]">✓✓</span>
      </span>
    </div>
  );
}

type Token = { text: string; entity: boolean; trailing: string };

/** Words of the transcript; entities stay whole and keep any punctuation that follows them. */
function tokenize(): Token[] {
  const out: Token[] = [];
  const runs: Array<string | { entity: string }> = copy.how.transcript.map((r) => (typeof r === "string" ? r : { ...r }));
  runs.forEach((run, i) => {
    if (typeof run === "string") {
      run.split(/\s+/).forEach((w) => {
        if (w) out.push({ text: w, entity: false, trailing: "" });
      });
      return;
    }
    let trailing = "";
    const next = runs[i + 1];
    if (typeof next === "string") {
      const m = next.match(/^[,.;:!?]+/);
      if (m) {
        trailing = m[0];
        runs[i + 1] = next.slice(m[0].length);
      }
    }
    out.push({ text: run.entity, entity: true, trailing });
  });
  return out;
}

function Transcript() {
  const tokens = tokenize();
  return (
    <p className="font-display mx-auto max-w-[19ch] text-balance text-[clamp(30px,4.4vw,64px)] leading-[1.08] text-ink" style={{ letterSpacing: "-0.015em" }}>
      {tokens.map((t, i) => (
        <span key={i}>
          {t.entity ? (
            <span data-word data-entity className="inline-block whitespace-nowrap text-ink">
              <span className="relative inline-block">
                {t.text}
                <i data-underline aria-hidden="true" className="absolute inset-x-0 -bottom-[0.02em] h-[0.06em] origin-left rounded-full bg-signal" />
              </span>
              {t.trailing}
            </span>
          ) : (
            <span data-word className="inline-block">
              {t.text}
            </span>
          )}
          {i < tokens.length - 1 ? " " : null}
        </span>
      ))}
    </p>
  );
}

function VoiceScene() {
  return (
    <div className="flex w-full max-w-[960px] flex-col items-center px-6 text-center">
      <VoiceBubble />
      <div className="mt-10 lg:mt-14">
        <Transcript />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Scene 2 · It remembers.
   The record that assembles from the note. Two ghost records drift behind it.
   ──────────────────────────────────────────────────────────────────────────── */

function Avatar({ src, size, className = "" }: { src: string; size: number; className?: string }) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size, border: "1px solid rgba(242,237,228,0.18)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </span>
  );
}

const SURFACE: CSSProperties = {
  background: "linear-gradient(180deg, rgba(38,33,30,0.92), rgba(22,19,17,0.96))",
  border: "1px solid rgba(242,237,228,0.1)",
  boxShadow: "0 40px 90px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(242,237,228,0.06)",
};

function RecordCard() {
  const r = copy.how.record;
  return (
    <div data-card className="relative w-[min(92vw,460px)] rounded-[22px] p-6 backdrop-blur-md lg:p-7" style={SURFACE}>
      <p className="flex items-center gap-2 font-mono text-[12px] text-signal">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6.5 4.8 9.2 10 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {r.saved}
      </p>
      <div className="mt-5 flex items-center gap-4">
        <Avatar src={r.avatar} size={56} />
        <div className="min-w-0">
          <p className="font-display text-[30px] leading-none text-ink">{r.name}</p>
          <p className="mt-1.5 text-[14px] text-ink-soft">{r.role}</p>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-[84px_1fr] gap-x-4 border-t border-[rgba(242,237,228,0.08)]">
        {r.fields.map((f) => (
          <div key={f.k} data-field className="col-span-2 grid grid-cols-subgrid items-baseline border-b border-[rgba(242,237,228,0.08)] py-3">
            <dt className="font-mono text-[12px] text-ink-faint">{f.k}</dt>
            <dd className="text-[15px] text-ink">{f.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function GhostCard({ name, role, avatar }: { name: string; role: string; avatar: string }) {
  return (
    <div className="flex w-[280px] items-center gap-3 rounded-[16px] p-4" style={SURFACE}>
      <Avatar src={avatar} size={36} />
      <div className="min-w-0">
        <p className="font-display text-[19px] leading-none text-ink">{name}</p>
        <p className="mt-1 truncate text-[12.5px] text-ink-soft">{role}</p>
      </div>
    </div>
  );
}

function RecordScene({ ghosts = true }: { ghosts?: boolean }) {
  const [g1, g2] = copy.how.record.ghosts;
  return (
    <div className="relative flex w-full items-center justify-center" style={{ perspective: "1400px" }}>
      {ghosts ? (
        <>
          <div data-ghost className="absolute left-[8%] top-[6%] hidden opacity-0 lg:block xl:left-[16%]">
            <GhostCard {...g1} />
          </div>
          <div data-ghost className="absolute bottom-[4%] right-[8%] hidden opacity-0 lg:block xl:right-[16%]">
            <GhostCard {...g2} />
          </div>
        </>
      ) : null}
      <div data-card-wrap className="relative" style={{ transformStyle: "preserve-3d" }}>
        <RecordCard />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Scene 3 · It connects.
   A constellation of everyone you know, a question, three answers.
   ──────────────────────────────────────────────────────────────────────────── */

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

type GNode = { fx: number; fy: number; name?: string; key?: string };
type GEdge = { a: number; b: number };

/** Fixed positions for the people the scene names, as fractions of the layer. */
const PINNED: Record<string, { fx: number; fy: number }> = {
  you: { fx: 0.5, fy: 0.5 },
  sarah: { fx: 0.41, fy: 0.42 },
  ben: { fx: 0.33, fy: 0.33 },
  hit0: { fx: 0.71, fy: 0.34 },
  hit1: { fx: 0.24, fy: 0.62 },
  hit2: { fx: 0.66, fy: 0.68 },
};

function buildConstellation(seed: number, count: number, compact: boolean): { nodes: GNode[]; edges: GEdge[] } {
  const rand = mulberry32(seed);
  const nodes: GNode[] = [
    { ...PINNED.you, key: "you", name: "you" },
    { ...PINNED.sarah, key: "sarah", name: "Sarah Lin" },
    { ...PINNED.ben, key: "ben", name: "Ben Roth" },
    { ...PINNED.hit0, key: "hit0", name: copy.how.hits[0].name },
    { ...PINNED.hit1, key: "hit1", name: copy.how.hits[1].name },
    { ...PINNED.hit2, key: "hit2", name: copy.how.hits[2].name },
  ];
  const labels = copy.network.names.filter((n) => !nodes.some((m) => m.name === n));
  const yMin = compact ? 0.06 : 0.17;
  const yMax = compact ? 0.94 : 0.8;
  const minDist = compact ? 0.11 : 0.085;
  const clear = (fx: number, fy: number) => nodes.every((n) => Math.hypot(n.fx - fx, (n.fy - fy) * 0.7) >= minDist);
  // Keep the question pill's band and the HUD corners free of nodes.
  const inPill = (fx: number, fy: number) => fx > 0.28 && fx < 0.72 && fy < (compact ? 0.22 : 0.32);
  const inHud = (fx: number, fy: number) => !compact && fy < 0.26 && (fx < 0.34 || fx > 0.74);
  for (let i = 0; i < count; i += 1) {
    let fx = 0;
    let fy = 0;
    let tries = 0;
    do {
      fx = 0.04 + rand() * 0.86;
      fy = yMin + rand() * (yMax - yMin);
      tries += 1;
    } while ((!clear(fx, fy) || inPill(fx, fy) || inHud(fx, fy)) && tries < 80);
    nodes.push({ fx, fy, name: i < 14 ? labels[i] : undefined });
  }
  const edgeMap = new Map<string, GEdge>();
  const put = (i: number, j: number) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (!edgeMap.has(key)) edgeMap.set(key, { a: Math.min(i, j), b: Math.max(i, j) });
  };
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => ({ j, d: i === j ? Infinity : Math.hypot(n.fx - m.fx, n.fy - m.fy) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => put(i, j));
  });
  put(1, 2); // Sarah ↔ Ben: the intro from scene 1
  return { nodes, edges: Array.from(edgeMap.values()) };
}

function Constellation({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1440, h: 900 });
  const { nodes, edges } = useMemo(() => buildConstellation(17, compact ? 18 : 44, compact), [compact]);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry?.contentRect;
      if (r && r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const px = (n: GNode) => ({ x: n.fx * size.w, y: n.fy * size.h });
  const you = px(nodes[0]);

  return (
    <div ref={ref} data-graph className="absolute inset-0" aria-hidden="true">
      <svg width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none" className="absolute inset-0">
        <g data-edges>
          {edges.map((e) => {
            const a = px(nodes[e.a]);
            const b = px(nodes[e.b]);
            return <line key={`${e.a}-${e.b}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--ink)" strokeOpacity={0.12} strokeWidth={1} />;
          })}
        </g>
        {copy.how.hits.map((h, i) => {
          const t = px(nodes[3 + i]);
          return (
            <line
              key={h.name}
              data-hit-edge
              x1={you.x}
              y1={you.y}
              x2={t.x}
              y2={t.y}
              pathLength={1}
              stroke="var(--signal)"
              strokeWidth={1.5}
              strokeDasharray={1}
              strokeDashoffset={0}
              style={{ filter: "drop-shadow(0 0 6px rgba(95,168,247,0.6))" }}
            />
          );
        })}
        <g>
          {nodes.map((n, i) => {
            const p = px(n);
            const isYou = n.key === "you";
            return (
              <g key={i} data-node>
                {isYou ? <circle cx={p.x} cy={p.y} r={14} fill="var(--signal)" fillOpacity={0.18} /> : null}
                <circle cx={p.x} cy={p.y} r={isYou ? 4 : 2.5} fill={isYou || n.key === "sarah" ? "var(--signal)" : "var(--ink)"} fillOpacity={isYou ? 1 : 0.45} />
              </g>
            );
          })}
        </g>
      </svg>
      {nodes.map((n, i) =>
        n.name && !n.key?.startsWith("hit") ? (
          <span
            key={`l${i}`}
            data-node-label
            className="absolute whitespace-nowrap font-mono text-[11px] text-ink"
            style={{ left: `${n.fx * 100}%`, top: `${n.fy * 100}%`, transform: "translate(9px, -55%)", opacity: n.key === "you" || n.key === "sarah" ? 0.9 : 0.42 }}
          >
            {n.name}
          </span>
        ) : null,
      )}
      {copy.how.hits.map((h, i) => {
        const n = nodes[3 + i];
        if (compact) {
          return (
            <span
              key={h.name}
              data-hit
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.fx * 100}%`, top: `${n.fy * 100}%` }}
            >
              <span className="absolute inset-[-6px] rounded-full bg-signal/30 blur-[6px]" />
              <Avatar src={h.avatar} size={34} className="ring-2 ring-signal" />
            </span>
          );
        }
        return (
          <div
            key={h.name}
            data-hit
            className="absolute flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4"
            style={{ ...SURFACE, left: `${n.fx * 100}%`, top: `${n.fy * 100}%`, transform: "translate(-22px, -50%)" }}
          >
            <span className="absolute left-[5px] top-1/2 h-[34px] w-[34px] -translate-y-1/2 rounded-full bg-signal/30 blur-[6px]" />
            <Avatar src={h.avatar} size={32} className="ring-2 ring-signal" />
            <span className="whitespace-nowrap">
              <span className="block text-[14px] leading-tight text-ink">{h.name}</span>
              <span className="block text-[12px] leading-tight text-ink-soft">{h.why}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function QueryPill() {
  return (
    <div data-pill className="inline-flex max-w-[92vw] items-center gap-3 rounded-full py-2.5 pl-4 pr-5" style={SURFACE}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-signal">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-display text-[clamp(17px,1.5vw,22px)] leading-none text-ink" style={{ letterSpacing: "-0.01em" }}>
        {Array.from(copy.how.query).map((ch, i) => (
          <span key={i} data-char className="inline-block whitespace-pre">
            {ch}
          </span>
        ))}
        <span data-caret aria-hidden="true" className="ml-[2px] inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-signal" />
      </span>
    </div>
  );
}

function DigestCard() {
  return (
    <div data-digest className="w-[min(92vw,440px)] rounded-[22px] p-6" style={SURFACE}>
      <p className="flex items-center justify-between font-mono text-[12px] text-ink-faint">
        <span>Tomorrow, 08:30</span>
        <span className="text-signal">{copy.digest.header}</span>
      </p>
      <ol className="mt-4 space-y-3.5">
        {copy.digest.items.map((item) => (
          <li key={item.n} className="grid grid-cols-[18px_1fr] gap-2 text-[14.5px] leading-snug">
            <span className="font-mono text-[12px] text-ink-faint">{item.n}</span>
            <span className="text-ink-soft">
              <span className="text-ink">{item.who}</span> · {item.why}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function HitList() {
  return (
    <ul className="w-full divide-y divide-[rgba(242,237,228,0.08)] rounded-[18px] px-4" style={SURFACE}>
      {copy.how.hits.map((h) => (
        <li key={h.name} className="flex items-center gap-3 py-3">
          <Avatar src={h.avatar} size={32} className="ring-2 ring-signal" />
          <span>
            <span className="block text-[14.5px] leading-tight text-ink">{h.name}</span>
            <span className="block text-[12.5px] leading-tight text-ink-soft">{h.why}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function NetworkScene({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative h-full w-full">
      <Constellation compact={compact} />
      <div className="absolute inset-x-0 top-[5%] flex justify-center px-3 lg:top-[17%]">
        <QueryPill />
      </div>
      {compact ? null : (
        <div className="absolute inset-0 flex items-center justify-center">
          <DigestCard />
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   The HUD: scene titles (kinetic), bodies, and the progress rail.
   ──────────────────────────────────────────────────────────────────────────── */

function KineticTitle({ words, index }: { words: readonly string[]; index: number }) {
  return (
    <h3
      data-title={index}
      className="font-display absolute bottom-0 left-0 flex flex-nowrap gap-x-[0.22em] whitespace-nowrap text-[clamp(40px,5.6vw,84px)] leading-[0.95] text-ink"
      aria-hidden={index !== 0}
    >
      {words.map((w) => (
        <span key={w} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span data-title-word className="block">
            {w}
          </span>
        </span>
      ))}
    </h3>
  );
}

function Rail() {
  return (
    <div className="flex items-start gap-4" aria-hidden="true">
      <div className="flex flex-col gap-5 pt-[2px] text-right font-mono text-[12px]">
        {copy.how.scenes.map((s) => (
          <span key={s.n} data-rail-label className="text-ink" style={{ opacity: 0.35 }}>
            {s.n}
          </span>
        ))}
      </div>
      <div className="relative h-[124px] w-px bg-[rgba(242,237,228,0.14)]">
        <span data-rail-fill className="absolute inset-x-0 top-0 h-full origin-top bg-signal" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Timeline beats, as fractions of the pinned scroll distance.
   Scene 1 owns 0 to 0.34, scene 2 0.34 to 0.64, scene 3 the rest.
   ──────────────────────────────────────────────────────────────────────────── */

const BEAT = {
  s1Exit: 0.29,
  s2Enter: 0.34,
  s2Exit: 0.6,
  s3Enter: 0.63,
  query: 0.69,
  hits: 0.76,
  digest: 0.87,
} as const;

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const q = gsap.utils.selector(stage);
        const scene = (n: number) => q(`[data-scene="${n}"]`)[0] as HTMLElement | undefined;
        const s1 = scene(1);
        const s2 = scene(2);
        const s3 = scene(3);
        if (!s1 || !s2 || !s3) return;

        const words = q("[data-scene='1'] [data-word]");
        const underlines = q("[data-scene='1'] [data-underline]");
        const bars = q("[data-scene='1'] [data-bar]");
        const timer = q("[data-scene='1'] [data-timer]")[0];
        const bubble = q("[data-scene='1'] [data-bubble]")[0];

        const cardWrap = q("[data-scene='2'] [data-card-wrap]")[0];
        const fields = q("[data-scene='2'] [data-field]");
        const ghosts = q("[data-scene='2'] [data-ghost]");

        const graph = q("[data-scene='3'] [data-graph]")[0];
        const nodes = q("[data-scene='3'] [data-node]");
        const labels = q("[data-scene='3'] [data-node-label]");
        const edges = q("[data-scene='3'] [data-edges]")[0];
        const hitEdges = q("[data-scene='3'] [data-hit-edge]");
        const hits = q("[data-scene='3'] [data-hit]");
        const pill = q("[data-scene='3'] [data-pill]")[0];
        const chars = q("[data-scene='3'] [data-char]");
        const caret = q("[data-scene='3'] [data-caret]")[0];
        const digest = q("[data-scene='3'] [data-digest]")[0];

        const titleWords = [0, 1, 2].map((i) => q(`[data-title="${i}"] [data-title-word]`));
        const bodies = [0, 1, 2].map((i) => q(`[data-body="${i}"]`)[0]);
        const railLabels = q("[data-rail-label]");
        const railFill = q("[data-rail-fill]")[0];
        const glow = q("[data-glow]")[0];

        // Initial states. The markup renders the finished story (SSR, no JS,
        // reduced motion); this rewinds it before first paint.
        gsap.set(words, { opacity: 0.14, y: 6 });
        gsap.set(underlines, { scaleX: 0 });
        gsap.set(bars, { backgroundColor: "rgba(233,237,239,0.55)" });
        gsap.set(bubble, { y: 10, opacity: 0 });
        gsap.set(s2, { opacity: 0 });
        gsap.set(cardWrap, { opacity: 0, scale: 0.84, y: 70, rotateX: 14 });
        gsap.set(fields, { opacity: 0, y: 12 });
        gsap.set(s3, { opacity: 0 });
        gsap.set(nodes, { opacity: 0 });
        gsap.set(labels, { opacity: 0 });
        gsap.set(edges, { opacity: 0 });
        gsap.set(hitEdges, { strokeDashoffset: 1 });
        gsap.set(hits, { opacity: 0, scale: 0.9, transformOrigin: "22px 50%" });
        gsap.set(pill, { opacity: 0, y: -14 });
        gsap.set(chars, { opacity: 0 });
        gsap.set(caret, { opacity: 0 });
        gsap.set(digest, { opacity: 0, y: 40, scale: 0.96 });
        gsap.set(titleWords[0], { yPercent: 110 });
        gsap.set([titleWords[1], titleWords[2]], { yPercent: 110 });
        gsap.set(bodies[0], { opacity: 0, y: 10 });
        gsap.set([bodies[1], bodies[2]], { opacity: 0, y: 10 });
        gsap.set(railFill, { scaleY: 0 });
        gsap.set(railLabels[0], { opacity: 1 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            pin: stage,
            start: "top top",
            end: "+=450%",
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // A hard end marker so every position below reads as a scroll fraction.
        tl.to({}, { duration: 0.001 }, 0.999);

        // ── HUD: titles rise through masks, exit upward with a blur.
        const titleIn = (i: number, at: number) =>
          tl.to(titleWords[i], { yPercent: 0, duration: 0.06, stagger: 0.015, ease: "power3.out" }, at);
        const titleOut = (i: number, at: number) =>
          tl.to(titleWords[i], { yPercent: -110, duration: 0.05, stagger: 0.01, ease: "power2.in" }, at);
        const bodyIn = (i: number, at: number) => tl.to(bodies[i], { opacity: 1, y: 0, duration: 0.05, ease: "power2.out" }, at);
        const bodyOut = (i: number, at: number) => tl.to(bodies[i], { opacity: 0, y: -10, duration: 0.04, ease: "power2.in" }, at);

        titleIn(0, 0.005);
        bodyIn(0, 0.03);
        titleOut(0, BEAT.s1Exit);
        bodyOut(0, BEAT.s1Exit);
        titleIn(1, BEAT.s2Enter + 0.01);
        bodyIn(1, BEAT.s2Enter + 0.04);
        titleOut(1, BEAT.s2Exit);
        bodyOut(1, BEAT.s2Exit);
        titleIn(2, BEAT.s3Enter + 0.01);
        bodyIn(2, BEAT.s3Enter + 0.04);

        tl.to(railFill, { scaleY: 1, duration: 0.999, ease: "none" }, 0);
        tl.to(railLabels[0], { opacity: 0.35, duration: 0.03 }, BEAT.s2Enter);
        tl.to(railLabels[1], { opacity: 1, duration: 0.03 }, BEAT.s2Enter);
        tl.to(railLabels[1], { opacity: 0.35, duration: 0.03 }, BEAT.s3Enter);
        tl.to(railLabels[2], { opacity: 1, duration: 0.03 }, BEAT.s3Enter);

        // ── The glow drifts with the story: left, right, then centre and wide.
        gsap.set(glow, { xPercent: -50, yPercent: -50, left: "38%", top: "60%", scale: 1 });
        tl.to(glow, { left: "62%", top: "45%", scale: 1.15, duration: 0.3, ease: "sine.inOut" }, BEAT.s1Exit);
        tl.to(glow, { left: "50%", top: "50%", scale: 1.6, opacity: 0.6, duration: 0.3, ease: "sine.inOut" }, BEAT.s2Exit);

        // ── Scene 1: the note plays, the words arrive, the entities get marked.
        tl.to(bubble, { y: 0, opacity: 1, duration: 0.04, ease: "power2.out" }, 0.01);
        tl.to(words, { opacity: 1, y: 0, duration: 0.03, stagger: { each: 0.19 / Math.max(1, words.length) }, ease: "power1.out" }, 0.04);
        tl.to(bars, { backgroundColor: "#5fa8f7", duration: 0.01, stagger: { each: 0.19 / bars.length } }, 0.04);
        const clock = { t: 0 };
        tl.to(
          clock,
          {
            t: copy.how.voice.duration,
            duration: 0.2,
            ease: "none",
            onUpdate: () => {
              if (timer) timer.textContent = `0:0${Math.round(clock.t)}`;
            },
          },
          0.04,
        );
        tl.to(underlines, { scaleX: 1, duration: 0.03, stagger: 0.035, ease: "power2.out" }, 0.1);
        tl.to(s1, { opacity: 0, scale: 1.12, filter: "blur(14px)", duration: 0.06, ease: "power2.in" }, BEAT.s1Exit);

        // ── Scene 2: the record assembles; ghosts move at a different depth.
        tl.to(s2, { opacity: 1, duration: 0.02 }, BEAT.s2Enter);
        tl.to(cardWrap, { opacity: 1, scale: 1, y: 0, rotateX: 0, duration: 0.08, ease: "power3.out" }, BEAT.s2Enter);
        tl.to(fields, { opacity: 1, y: 0, duration: 0.04, stagger: 0.025, ease: "power2.out" }, BEAT.s2Enter + 0.06);
        tl.fromTo(ghosts, { y: 90, opacity: 0 }, { y: -90, opacity: 0.55, duration: 0.3, ease: "none", stagger: 0.02 }, BEAT.s2Enter);
        // The card recedes to where Sarah sits in the constellation.
        tl.to(
          cardWrap,
          {
            scale: 0.12,
            opacity: 0,
            x: () => (PINNED.sarah.fx - 0.5) * stage.clientWidth,
            y: () => (PINNED.sarah.fy - 0.5) * stage.clientHeight * 0.9,
            duration: 0.07,
            ease: "power2.in",
          },
          BEAT.s2Exit,
        );
        tl.to(s2, { opacity: 0, duration: 0.03 }, BEAT.s2Exit + 0.04);

        // ── Scene 3: the constellation, the question, the answers, the morning.
        tl.to(s3, { opacity: 1, duration: 0.02 }, BEAT.s3Enter - 0.02);
        tl.to(nodes, { opacity: 1, duration: 0.04, stagger: { each: 0.08 / nodes.length, from: "center" } }, BEAT.s3Enter - 0.02);
        tl.to(edges, { opacity: 1, duration: 0.08 }, BEAT.s3Enter + 0.02);
        tl.to(labels, { opacity: 1, duration: 0.05, stagger: { each: 0.05 / Math.max(1, labels.length), from: "random" } }, BEAT.s3Enter + 0.04);
        tl.to(pill, { opacity: 1, y: 0, duration: 0.04, ease: "power2.out" }, BEAT.query);
        tl.to(caret, { opacity: 1, duration: 0.005 }, BEAT.query);
        tl.to(chars, { opacity: 1, duration: 0.004, stagger: 0.06 / chars.length }, BEAT.query + 0.02);
        tl.to(caret, { opacity: 0, duration: 0.005 }, BEAT.hits);
        hits.forEach((hit, i) => {
          const at = BEAT.hits + i * 0.03;
          tl.to(hitEdges[i], { strokeDashoffset: 0, duration: 0.04, ease: "power2.out" }, at);
          tl.to(hit, { opacity: 1, scale: 1, duration: 0.04, ease: "back.out(1.6)" }, at + 0.02);
        });
        tl.to([graph, pill], { opacity: 0.22, duration: 0.05 }, BEAT.digest);
        tl.to(hits, { opacity: 0, duration: 0.03 }, BEAT.digest);
        tl.to(digest, { opacity: 1, y: 0, scale: 1, duration: 0.06, ease: "power3.out" }, BEAT.digest + 0.02);

        // ── Depth: the card tilts and the constellation shifts with the pointer.
        const tiltX = gsap.quickTo(cardWrap, "rotationY", { duration: 0.8, ease: "power3.out" });
        const tiltY = gsap.quickTo(cardWrap, "rotationX", { duration: 0.8, ease: "power3.out" });
        const shiftX = gsap.quickTo(graph, "x", { duration: 1.2, ease: "power3.out" });
        const shiftY = gsap.quickTo(graph, "y", { duration: 1.2, ease: "power3.out" });
        const onMove = (e: MouseEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          tiltX(nx * 10);
          tiltY(-ny * 8);
          shiftX(-nx * 24);
          shiftY(-ny * 18);
        };
        window.addEventListener("mousemove", onMove, { passive: true });

        const onFonts = () => ScrollTrigger.refresh();
        document.fonts?.ready.then(onFonts);

        return () => {
          window.removeEventListener("mousemove", onMove);
        };
      });

      mm.add("(max-width: 1023.98px)", () => {
        const blocks = gsap.utils.toArray<HTMLElement>("[data-m-block]", sectionRef.current ?? undefined);
        blocks.forEach((b) => {
          gsap.from(b, { opacity: 0, y: 28, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: b, start: "top 85%", once: true } });
        });
      });
    }, stage);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how" ref={sectionRef} className="relative mt-[8vh] lg:mt-0">
      {/* Desktop: one pinned, full-bleed stage; three scenes; the HUD on top. */}
      <div ref={stageRef} className="relative hidden h-[100svh] w-full overflow-hidden bg-paper lg:motion-safe:block">
        <div
          data-glow
          aria-hidden="true"
          className="pointer-events-none absolute h-[70vmin] w-[70vmin] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(95,168,247,0.22), rgba(95,168,247,0.06) 55%, transparent 72%)", filter: "blur(10px)" }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(14,12,11,0.75) 100%)" }} />

        <div data-scene="1" className="absolute inset-x-0 bottom-[26%] top-[14%] flex items-center justify-center will-change-transform">
          <VoiceScene />
        </div>
        <div data-scene="2" className="absolute inset-x-0 bottom-[22%] top-[12%] flex items-center justify-center">
          <RecordScene />
        </div>
        <div data-scene="3" className="absolute inset-0">
          <NetworkScene />
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="relative mx-auto h-full max-w-[1120px] px-5 sm:px-8">
            <p className="label absolute left-5 top-[104px] sm:left-8">§ 01 · {copy.how.label}</p>
            <div className="absolute right-5 top-[104px] sm:right-8">
              <Rail />
            </div>
            <div className="absolute bottom-[56px] left-5 h-[1.1em] w-[58%] text-[clamp(40px,5.6vw,84px)] sm:left-8">
              {copy.how.scenes.map((s, i) => (
                <KineticTitle key={s.n} words={s.title} index={i} />
              ))}
            </div>
            <div className="absolute bottom-[56px] right-5 w-[340px] sm:right-8">
              <div className="grid">
                {copy.how.scenes.map((s, i) => (
                  <p key={s.n} data-body={i} className="col-start-1 row-start-1 self-end text-[17px] leading-[1.5] text-ink-soft">
                    {s.body}
                  </p>
                ))}
              </div>
              <p className="mt-4 font-mono text-[12px] text-ink-faint">{copy.how.channels}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile and reduced motion: the same three scenes, stacked. */}
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8 lg:motion-safe:hidden">
        <p className="label">§ 01 · {copy.how.label}</p>
        <div className="mt-10 flex flex-col gap-20">
          {copy.how.scenes.map((s, i) => (
            <div key={s.n} data-m-block>
              <p className="font-mono text-[12px] text-signal">{s.n}</p>
              <h3 className="font-display mt-2 text-[clamp(40px,10vw,64px)] leading-[0.95] text-ink">{s.title.join(" ")}</h3>
              <p className="mt-4 max-w-[36ch] text-[17px] text-ink-soft">{s.body}</p>
              <div className="relative mt-8 -mx-5 sm:mx-0">
                {i === 0 ? (
                  <div className="py-6">
                    <VoiceScene />
                  </div>
                ) : null}
                {i === 1 ? (
                  <div className="py-6">
                    <RecordScene ghosts={false} />
                  </div>
                ) : null}
                {i === 2 ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative h-[380px] w-full overflow-hidden rounded-[22px] bg-paper-2/40">
                      <NetworkScene compact />
                    </div>
                    <HitList />
                    <p className="mt-6 font-mono text-[12px] text-ink-faint">Then, every morning</p>
                    <DigestCard />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 font-mono text-[12px] text-ink-faint">{copy.how.channels}</p>
      </div>
    </section>
  );
}
