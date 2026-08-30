/**
 * In-memory sliding-window rate limit: 5 requests per hour per IP.
 * Good enough for a single-region serverless deploy at this stage;
 * swap for Upstash/Redis if traffic outgrows one instance.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

function prune(now: number): void {
  for (const [ip, timestamps] of hits) {
    const kept = timestamps.filter((t) => now - t < WINDOW_MS);
    if (kept.length === 0) {
      hits.delete(ip);
    } else {
      hits.set(ip, kept);
    }
  }
}

/** Returns true if the IP is still within its rate limit; records the attempt. */
export function allow(ip: string): boolean {
  const now = Date.now();
  prune(now);

  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_PER_WINDOW) {
    hits.set(ip, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(ip, timestamps);
  return true;
}
