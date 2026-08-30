# Mutuals — Design decisions

Working log for the waitlist site. Brief: `../website-brief.md`. Where the brief pins a decision we follow it; where it leaves room, the choice and the reason are here.

## Concept
"The ledger that listens." A precise record you speak into. Warm paper, ink, one green that moves. Nothing on the page is decorative except the paper grain; every "data-like" element is a real product format (receipt, digest).

Anti-pattern check (things a generic AI landing page would do, and why we don't):
- Centered hero + gradient blob → left-aligned, notebook margin rule, no gradients.
- Logo wall / "trusted by" / counters → cut. We have no social proof; the honest page is stronger.
- Dark-mode neon dashboard mockup → we have no dashboard. The product *is* a chat message; we render one.
- Feature grid with icons → three numbered steps because the product really is a sequence.
- Fake testimonials → none.

## Direction change (2026-08-30, user feedback)
The first build followed the brief's "quiet paper" execution. The user rejected it as bland and set a new direction, which now overrides the brief where they conflict:
- **Dark theme.** Near-black ground, light type. Semantic token names are kept (`--paper` is the ground, `--ink` is the type) so components read the same on either theme.
- **Awwwards / top-YC-AI vibe.** Full-viewport centered hero, one live instrument, pinned scroll storytelling, smooth scroll, masked type reveals.
- **Two sections maximum.** Hero + "How it works". Everything else was cut (ticker, network page, daily, who-for, second form).
- **Abstract hero.** Headline, sub, form, reassurance line, and the waveform only. No receipt/chips/transcript/replay artifacts, no meta lines, no clock.
- **No em dashes anywhere.**
- The people-graph and the WhatsApp context live in the story section (background graph + WhatsApp-styled phone).

## Tokens (dark)
| Token | Hex | Use |
|---|---|---|
| `--paper` | #0E0C0B | page ground |
| `--paper-2` | #1A1715 | surfaces, rules |
| `--ink` | #F2EDE4 | type |
| `--signal` | #5FA8F7 (sky blue, user choice) | the one colour that moves: waveform, CTA, lit graph nodes |
| `--signal-2` | #A9CDFF | focus rings, tints |
| `--ember` | #B8452B | reserved (recording dot), currently unused |

Derived: `--ink-soft` 66%, `--ink-faint` 40%. Paper grain overlay at 7% `screen`.

## Type
- **Display: Fraunces** (variable, `opsz` + `SOFT`; italic loaded as a separate non-preloaded face). Headline `clamp(56px, 11vw, 168px)`, leading 0.92, tracking -0.03em.
- **Body: Geist. Mono: Geist Mono** (labels, receipts, digest).
- Latin subset only; two tiny preloaded subsets carry the above-the-fold glyphs: `Fraunces-hero.woff2` (upright, text "Your people,Mutals") and `FrauncesItalic-remembered.woff2`. The full faces load lazily. Regenerate the upright subset the same way with `text=<headline chars>` if the headline or wordmark changes. Previously: the upright display face plus a 2KB italic subset containing only the headline word ("remembered.") are preloaded. The full italic face loads lazily. If the italic headline word changes, refetch the subset: `curl -A "Chrome" "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,144,400&text=<word>"` and download the woff2 to `src/app/fonts/FrauncesItalic-remembered.woff2`.

## Motion
- **Lenis** smooth scroll synced to the GSAP ticker; **GSAP ScrollTrigger + SplitText** (free since 3.13).
- Hero: headline masked line reveal on load; sub/form fade+rise at 0.5s.
- Waveform: SSR-rendered resting pattern; on mount a single rAF loop drives every bar's scaleY from two seeded speech patterns (bursts, pauses, jitter, spikes) crossfaded every 2.5s, advanced by time and by scroll (ScrollTrigger scrub through the hero), plus mouse-x proximity boost. Reduced motion: static.
- Story: pinned 300vh stage, scrubbed timeline; headings crossfade at 0.33/0.66; chat messages at 0.05/0.2/0.4/0.52/0.75; background graph lights up nodes at those beats.
- GSAP is imported after hydration only.

## Waitlist
Unchanged: `POST /api/waitlist`, Neon or JSONL fallback, E.164 phone, referral, Resend, Turnstile, honeypot, rate limit. Single form in the hero with the reassurance line "We only message you once, when your spot opens. No newsletter, no spam."

## Copy changes vs brief
- Em dashes removed everywhere ("promised. Then it sends").
- Meta line and privacy line removed from the page (user request).
- Added: reassurance line under the form; "Works in WhatsApp and Telegram. No app to install." under the phone.

## Generated assets
See `public/generated/SOURCES.md`. The dinner-table illustration is no longer on the page (section cut) but is kept for later use.

## Hosting (2026-08-30)
- **Vercel** project `mutuals` (team kyrillus-projects), region `fra1` via `vercel.json`. Production alias: https://mutuals-theta.vercel.app. Deployment protection set to "prod deployment URLs and all previews" so the production alias is public while previews stay gated. When getmutuals.ai is bought: add the domain in Vercel, then optionally set `NEXT_PUBLIC_SITE_URL=https://getmutuals.ai` (otherwise the site URL follows `VERCEL_PROJECT_PRODUCTION_URL` automatically).
- **Neon** project `mutuals` (`aws-eu-central-1`, Postgres 17). Schema from `db/schema.sql` applied. `DATABASE_URL` is set for production/preview/development on Vercel and in `site/.env.local` (gitignored).
- Still unset (optional): `RESEND_API_KEY` (confirmation email), `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (bot protection; honeypot + IP rate limit are active regardless), `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (analytics).
- Deploy: `cd site && vercel deploy --prod` (or connect the GitHub repo in Vercel for push-to-deploy; root directory `site`).
