/**
 * Deterministic 48-bar waveform, shaped like real speech: short bursts
 * (words / phrases) separated by brief pauses, with light per-bar texture
 * so it doesn't look like a synth LFO. Values are clamped to [0.12, 1.0]
 * and used as GSAP `scaleY` targets for the hero waveform bars.
 *
 * Deterministic on purpose (seeded PRNG): the animation must look identical
 * on every load/build, in tests, and in SSR/CSR — no `Math.random()`.
 */

const BAR_COUNT = 48;

/** mulberry32 — tiny, fast, deterministic PRNG for a fixed seed. */
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
 * Word-like envelope humps: [startBar, endBar, peak]. Gaps between entries
 * read as the pauses between spoken words/phrases in the waveform.
 */
const BURSTS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 4, 0.55],
  [6, 13, 0.92],
  [15, 18, 0.48],
  [20, 28, 1.0],
  [30, 33, 0.6],
  [35, 43, 0.85],
  [45, 47, 0.42],
];

function envelopeAt(i: number): number {
  for (const [start, end, peak] of BURSTS) {
    if (i < start || i > end) continue;
    const mid = (start + end) / 2;
    const half = (end - start) / 2 || 1;
    const d = Math.abs(i - mid) / half; // 0 at hump center, 1 at its edges
    const shape = Math.cos((Math.min(d, 1) * Math.PI) / 2); // 1 → 0
    return peak * shape;
  }
  return 0;
}

const random = mulberry32(0xc0ffee);

/** 48 deterministic bar heights in [0.12, 1.0], shaped like speech. */
export const waveform: readonly number[] = Array.from({ length: BAR_COUNT }, (_, i) => {
  const base = envelopeAt(i);
  const texture = (random() - 0.5) * 0.16;
  return Math.min(1, Math.max(0.12, base + texture));
});
