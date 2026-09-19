# Mutuals — Design decisions

Working log for the waitlist site. Brief: `../website-brief.md`. Where the brief pins a decision we follow it; where it leaves room, the choice and the reason are here.

## Concept

"The ledger that listens." A precise record you speak into. Warm paper, ink, one green that moves. Nothing on the page is decorative except the paper grain; every "data-like" element is a real product format (receipt, digest).

Anti-pattern check (things a generic AI landing page would do, and why we don't):

- Centered hero + gradient blob → left-aligned, notebook margin rule, no gradients.
- Logo wall / "trusted by" / counters → cut. We have no social proof; the honest page is stronger.
- Dark-mode neon dashboard mockup → we have no dashboard. The product _is_ a chat message; we render one.
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

| Token        | Hex                             | Use                                                       |
| ------------ | ------------------------------- | --------------------------------------------------------- |
| `--paper`    | #0E0C0B                         | page ground                                               |
| `--paper-2`  | #1A1715                         | surfaces, rules                                           |
| `--ink`      | #F2EDE4                         | type                                                      |
| `--signal`   | #5FA8F7 (sky blue, user choice) | the one colour that moves: waveform, CTA, lit graph nodes |
| `--signal-2` | #A9CDFF                         | focus rings, tints                                        |
| `--ember`    | #B8452B                         | reserved (recording dot), currently unused                |

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

## 2026-09-19 — Reference-led agent landing page

The owner requested the scroll-led feel of memorable.sh and maritime.sh, plus
agent selection and security sections like the supplied Agent37 screenshots.
This supersedes the earlier hero animation and palette direction for the homepage.

Use near-black #080808, white #ffffff, off-white #fafafa, gray #929296 and lavender
#c1b5ed. Geist carries headings and body; Geist Mono is reserved for commands.
The visual signature is a relationship memory connecting people to chosen agents.
The sequence is centered hero → light agent setup → dark sticky capture/recall
story → light security → early access. No scroll hijacking; mobile uses readable
stacked examples and reduced motion removes sticky presentation.

Copy leads with cross-agent continuity. Agent selection exposes setup and status,
using the catalog for named availability. OpenClaw is explicitly planned. Existing
Claude Code, Codex and Hermes entries remain owner-test beta, not general availability.
Security describes implemented consent, separate permissions, revocation and source
inspection; it also states the external-provider disclosure boundary. No certification,
anonymity, no-training or provider-isolation claims are borrowed from reference sites.

The existing waitlist API, referral behavior, privacy pages and hosted app are unchanged.
Verification: production build and TypeScript pass; ESLint has no errors and two
pre-existing warnings in HeroNetwork and Reveal. Desktop/mobile browser checks cover
agent selection, command copying, section navigation and layout overflow.

## 2026-09-19 — Dark enrichment direction replaces the monochrome section treatment

The owner's follow-up explicitly keeps the typography but rejects alternating
light sections, substitute agent symbols, and the “agents change” headline.
The homepage now leads with “A second brain for your relationships,” explaining
how notes enrich existing profiles and retain source history. The palette stays
black #08090b with blue #83b4ff for connection/recall, lavender #bc9cec for relations,
teal #79c9b3 for enrichment and muted copper #c1a395 for original notes.

Original tool logos appear in the hero and selector; their actual palettes are
preserved. The original portrait network returns with pause/resume. A native-scroll
exploded memory scene and a replayable note-to-profile vignette replace the earlier
flat card story. Mobile and reduced-motion fallbacks retain the content. Research,
media observations, provenance and adaptation are in `motion-study.md`.

No architecture, compatibility status or deployment authorization changes. Explain
the implemented enrichment/identity/history strengths rather than invent a comparative
“superior” benchmark. Production build and TypeScript pass; lint has one existing
warning in Reveal. Browser verification covers desktop/mobile rendering, loaded logos,
layer separation, replay, source disclosure, agent states and overflow.

## 2026-09-19 — Refine the hero and remove presentation scaffolding

The owner's latest direction supersedes the portrait-network treatment above.
Replace the floating avatar circles with a single projected network surface below
the headline: fine silver-blue connections, sparse raised bridges and depth-aware
lighting. The surface responds to native scrolling and resize, with no perpetual
animation loop; reduced-motion preferences disable the viewpoint movement. Original
agent logos and the current typography remain.

Remove the visible demo/fictional-example captions, pause/resume control, scroll
instructions, repeated hero label and hero status badges. Keep actual compatibility
status in the installation selector, where it informs setup. The enrichment replay
is a compact icon with an accessible name. No product permissions or security claims
change. This is a local design revision, not a deployment.

## 2026-09-19 — People and the connected memory ecosystem

Restore a small, deliberately placed set of portrait nodes to the hero's network
surface. Keep the fine rims and restrained depth, rather than returning to the
random drifting portrait field.

Merge the separate enrichment vignette and memory breakdown into one section,
“A memory built around people.” Source applications feed a three-layer Mutuals
relationship database; agents retrieve context and add observations through the
same core. Desktop scrolling expands the plates, moves connection signals and
rotates the surrounding orbital marks. Mobile stacks the sources, core and agents;
reduced motion preserves a static expanded scene. Current type and dark palette stay.

LinkedIn means imported connections, not scraping. WhatsApp means captured notes
and voice messages. Calendar and email sync remain marked planned, matching the
product brief. Grok Bot and Muse have dedicated selector entries with planned
status; vendor logos do not imply a verified connector. Muse is interpreted as
Meta's Muse, based on its official current product site.

Verification: production build/type checking pass, lint has only the existing
Reveal warning. Desktop and mobile review covers the collapsed/expanded core,
source and agent assets, overflow and the new Grok Bot/Muse selection states.

## 2026-09-19 — Portrait composition and shared controls

The latest hero replaces the projected grid and portrait pins with a deliberately
composed SVG relationship network. Seven portraits have coordinated crops and scale,
connected by fine curved paths. There are no pedestal lines, thick rings or ambient
glow. Native scroll adds restrained parallax, disabled for reduced motion.

Primary actions now use off-white pill shapes; secondary actions use transparent
fills and quiet neutral borders. Shared SVG arrows replace font-dependent glyphs.
Agent selection uses underlined navigation instead of separate boxed buttons. Remove
the setup panel's double outline and the waitlist's magnetic pointer interaction.
Signup, copy, and navigation controls share sizing, focus and hover conventions.

Production build and lint pass with the existing Reveal lint warning. Browser checks
cover desktop/mobile composition, the setup controls and local empty-form validation.
No request is sent when testing the empty signup form.

## 2026-09-19 — Dense community graph with local exploration

Replace the seven-person chain with 3,060 deterministic nodes in twelve communities,
roughly nine thousand local edges and sparse inter-community bridges. The artwork
suggests the scale and clustered organization of a relationship database; it is
synthetic visual data, not a claim that semantic clustering is shipped or that the
visitor has millions of stored relationships. Portraits are small anchor nodes.

Hovering focuses the nearest community, reveals its bridges, enlarges its portrait
and sends light along its outward connections. Canvas caches the static graph;
only the focused overlay is redrawn during interaction. Hidden/offscreen states stop
animation, reduced motion disables travelling signals, and touch scrolling remains
native. DPR is capped at two. No extra runtime dependency is added.

Verified the desktop resting/hover states and mobile composition in-browser.
Production build/type checking pass; lint retains the existing Reveal warning.

## 2026-09-19 — Volumetric, continuously moving graph

The owner found the cached network too static. Replace the flat cached rendering
with a projected depth field. Gaussian node distributions soften community edges;
each community turns and drifts independently, while depth bands control point size
and brightness. Sparse light trails travel between communities before interaction.
Hover uses interpolated focus, cluster expansion and depth-dependent pointer parallax
rather than switching opacity abruptly. Portraits follow the same projection.

The renderer precomputes community edge lists, projects each point once per rendered
frame and batches paths. Ambient rendering is limited to 30 fps and stops offscreen
or in a hidden tab. Reduced motion freezes drift, parallax and travelling signals.
This supersedes the static bitmap cache noted in the previous entry. Production
build and lint pass except for the existing Reveal warning; desktop interaction and
mobile layout were reviewed in-browser.

## 2026-09-19 — Faces throughout the graph, no hover scaling

All 3,060 graph nodes now render as circular portraits in several fixed size bands.
A generated 8×8 atlas supplies 64 fictional identities reused across those nodes;
this is artwork, not customer data or 3,060 unique identities. Larger foreground
portraits draw after the micro portraits so the important faces stay readable.
The atlas is decoded once and circular sprites are cached before rendering.

Remove cluster expansion, portrait enlargement and pointer-driven camera motion.
Hover changes only connection lighting and portrait contrast. Ambient cluster drift
and projection remain independent of pointer position, with offscreen suspension
and reduced-motion behavior preserved. The imagegen skill produced the atlas;
its workspace copy is `public/generated/portraits-atlas.png`.

Production build passes. Lint has the existing Reveal warning only. Browser review
covers desktop density, hover without scaling and mobile portrait rendering.

## 2026-09-19 — Abstract halftone replaces the portrait graph

The owner explicitly requested removing faces in favor of the supplied Maritime-like
abstract dot texture. The hero now renders one continuous folded surface as small,
screen-aligned monochrome squares. Slow projection changes give it dimension; hover
only lifts local brightness. No portraits, graph edges, cluster selection or scaling
remain in the active hero. The previous generated portrait atlas was removed from
the public assets because it is no longer used.

The new AbstractBackdrop uses precomputed surface points and a reusable typed raster
buffer, caps device-pixel ratio at two, stops offscreen/in hidden tabs, and freezes
motion under reduced-motion preferences. Desktop and mobile crops were reviewed.
Build passes; lint has the pre-existing Reveal warning. This supersedes all prior
hero portrait/network directions above.

## 2026-09-19 — Full-hero abstract motion

Expand the monochrome surface to the full hero canvas, including the space around
the headline. Increase rotational range and speed, add a travelling deformation
and a moving light sweep. A smooth reading mask lowers contrast behind the headline
and supporting copy without adding an opaque panel. Mobile uses its own horizontal
projection scale so the moving folds remain visible instead of being cropped away.
Hover remains lighting-only. The existing offscreen/reduced-motion behavior stays.

Desktop and mobile framing reviewed; production build passes and lint reports only
the existing Reveal warning.
