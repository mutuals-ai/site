/**
 * Canonical site URL. Until getmutuals.ai is live, falls back to the Vercel
 * production URL so OG images, sitemap, and referral links resolve.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "https://getmutuals.ai";
}

/** Host without protocol, for human-readable referral links. */
export function siteHost(): string {
  return siteUrl().replace(/^https?:\/\//, "");
}
