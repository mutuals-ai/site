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
- **Headline: Geist, weight 500** (2026-09-07, user decision). Fraunces kept reading as italic or weird to the user at both the default cut (opsz 144, SOFT 30) and a calm cut (opsz 72, SOFT 0, WONK 0); they asked for a "normal font". `clamp(36px, 6.9vw, 100px)`, leading 1.02, tracking -0.04em, two lines "A second brain for" / "your relationships.". Geist is preloaded because the headline is the LCP. The OG image still sets the headline in Fraunces (it reads the local `Fraunces.woff`); swap it if the mismatch ever matters. The preloaded Fraunces subset `Fraunces-hero-calm.woff2` (opsz 72 / SOFT 0 / WONK 0, text "Perfect memory for everyone you meet.Mutuals") now only serves the wordmark.
- **Display: Fraunces** (variable, `opsz` + `SOFT` + `WONK`) at opsz 144 / SOFT 30 for the section titles and the transcript in "How it works"; the italic face loads lazily.
- Latin subset only; one tiny preloaded subset carries the headline and wordmark glyphs: `Fraunces-hero-calm.woff2` (upright, opsz 72 / SOFT 0 / WONK 0, text "Perfect memory for everyone you meet.Mutuals"). The full faces load lazily. If the headline or wordmark changes, refetch it with a full Chrome user agent (a short UA returns TTF instead of woff2): `curl -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,144,400&text=<headline chars>Mutuals"` (add `,SOFT,WONK` to the axis list and `,0,0` to the values to get the calm cut), then download the woff2 URL from that CSS to `src/app/fonts/Fraunces-hero-calm.woff2`.
- **Body: Geist. Mono: Geist Mono** (labels, receipts, digest).
- Latin subset only; two tiny preloaded subsets carry the above-the-fold glyphs: `Fraunces-hero-calm.woff2` (upright, text "Your people,Mutals") and `FrauncesItalic-remembered.woff2`. The full faces load lazily. Regenerate the upright subset the same way with `text=<headline chars>` if the headline or wordmark changes. Previously: the upright display face plus a 2KB italic subset containing only the headline word ("remembered.") are preloaded. The full italic face loads lazily. If the italic headline word changes, refetch the subset: `curl -A "Chrome" "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,144,400&text=<word>"` and download the woff2 to `src/app/fonts/FrauncesItalic-remembered.woff2`.

## Motion
- Native scrolling (Lenis was removed on 2026-08-30: JS smoothing fought scrollbar drags and mobile flicks); **GSAP ScrollTrigger + SplitText** with `scrub` easing, `ignoreMobileResize`, `anticipatePin`.
- Hero: headline masked line reveal on load; sub/form fade+rise at 0.5s.
- Waveform: SSR-rendered resting pattern; on mount a single rAF loop drives every bar's scaleY from two seeded speech patterns (bursts, pauses, jitter, spikes) crossfaded every 2.5s, advanced by time and by scroll (ScrollTrigger scrub through the hero), plus mouse-x proximity boost. Reduced motion: static.
- How it works (rebuilt 2026-09-06, `HowItWorks.tsx`): one full-bleed stage pinned for 450vh, one scrubbed timeline, three scenes that replace each other like camera cuts. Scene 1 (0 to 0.29): a WhatsApp voice bubble whose played bars and timer advance with the scroll while the transcript arrives word by word in display serif; the four extracted entities get a signal underline. Scene 2 (0.34 to 0.60): the record card for Sarah assembles field by field with a slight 3D tilt that follows the pointer; two ghost records drift behind it at a different parallax rate; on exit the card shrinks toward Sarah's node in the constellation. Scene 3 (0.63 to 1): a 50-node constellation fades in, the question types itself into a pill, three answers draw in from "you" as avatar chips, then the graph dims and the morning digest rises. The HUD is fixed: section label top-left, a three-step progress rail top-right, the scene title bottom-left (words rise through masks, exit upward), the body bottom-right. A signal-blue radial glow moves with the story. Below 1024px, and under reduced motion, the same three scenes stack with their finished state and a simple fade-in per block; the answers become a list under a shorter graph. The phone mockup is gone: the product artifacts (bubble, record, digest) stand on their own.
- GSAP is imported after hydration only.

## Waitlist
Unchanged: `POST /api/waitlist`, Neon or JSONL fallback, E.164 phone, referral, Resend, Turnstile, honeypot, rate limit. Single form in the hero with the reassurance line "We only message you once, when your spot opens. No newsletter, no spam."

## Headline (2026-09-06)
"Your people, remembered." read oddly to the user (the comma construction). Replaced (2026-09-07, user's own wording) with **"A second brain for / your relationships."**; before that **"Perfect memory / for everyone you meet."** ("A perfect memory for your network." was close, the user liked "perfect memory", but it did not read smoothly) (two earlier tries, "Meet people. Forget nothing." and "Never forget who you met.", were rejected as too on the nose; the user wanted it bigger and more ambitious), no italic (the user found the italic line odd, so the italic subset is gone). One preloaded subset carries the whole headline and the wordmark: `Fraunces-hero-calm.woff2` (text "Perfect memory for everyone you meet.Mutuals"), fetched from the Google Fonts css2 endpoint with a Chrome user agent so it serves woff2. The `<title>`, OG/Twitter alt and the OG image copy follow.

## Footer wordmark (2026-09-06)
The closing "Mutuals" wordmark was clipped to its top 60% on purpose; the user read it as cut off. It is now shown whole (`clamp(88px, 19vw, 300px)`, leading 0.9).

## Copy changes vs brief
- Em dashes removed everywhere ("promised. Then it sends").
- Meta line and privacy line removed from the page (user request).
- Added: reassurance line under the form; "Lives in WhatsApp and Telegram. No app to install." under the scene body.
- How it works bodies shortened to one or two sentences each (2026-09-06): "One voice note after you meet someone. That's the whole input." / "Every note is filed to the right person. Nothing gets lost in a chat history." / "Ask it anything about your network. Every morning, one message about who matters today."

## Generated assets
See `public/generated/SOURCES.md`. The dinner-table illustration is no longer on the page (section cut) but is kept for later use.

## Hosting (2026-08-30)
- **Vercel** project `mutuals` (team kyrillus-projects), region `fra1` via `vercel.json`. Production domain: **https://getmutuals.ai** (added 2026-08-30; `www` redirects 308 to apex). Deployment protection: "prod deployment URLs and all previews" (production domain public, previews gated). The site URL follows `VERCEL_PROJECT_PRODUCTION_URL` automatically; `NEXT_PUBLIC_SITE_URL` overrides it if ever needed.
- **Neon** project `mutuals` (`aws-eu-central-1`, Postgres 17). Schema from `db/schema.sql` applied. `DATABASE_URL` is set for production/preview/development on Vercel and in `site/.env.local` (gitignored).
- Still unset (optional): `RESEND_API_KEY` (confirmation email), `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (bot protection; honeypot + IP rate limit are active regardless), `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (analytics).
- Deploy (2026-09-07): the site lives in its own public repository, `mutuals-ai/site`, and the Vercel project is linked to it with no Root Directory, so every push to `main` deploys to production. For a manual deploy run `vercel deploy --prod` from this repository's root. The Hobby plan refuses to link a private organization-owned repository, which is why the repository is public.
