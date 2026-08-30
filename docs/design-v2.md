# Mutuals site v2: "paper pages, ink pages"

Supersedes the section layout in design-decisions.md. Tokens, type, and copy rules still apply, with two changes:
1. `--ink` is now used as a full-bleed section background (an "ink page"). Text on ink is `--paper`; accent stays `--signal-2` (mint) on ink because deep green is too dark there.
2. **No em dashes anywhere.** Use periods, commas, colons, or " · ".

Vibe reference: top YC AI landing pages / Awwwards sites of 2025-26: full-viewport hero with a single live element, kinetic masked type, pinned scroll-storytelling, one inverted section, a marquee, oversized type moments, smooth scroll. Still: no gradients, no blobs, no 3D, no purple. The material is paper, ink, one green.

## Motion infrastructure
- `lenis` smooth scroll (via `<SmoothScroll/>` client provider in layout, `lerp: 0.1`, disabled if reduced motion), synced to GSAP ticker (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`).
- GSAP `ScrollTrigger` + `SplitText` (free since 3.13). Register once in `src/lib/gsap.ts`: `export { gsap, ScrollTrigger, SplitText }`. Everything imports from there.
- `<Reveal as="h2" lines>` component: SplitText into lines, each line wrapped in an overflow-hidden mask; on enter (start "top 85%") yPercent 110 → 0, duration 0.9, ease `expo.out`, stagger 0.08. Words variant for short lines. Reduced motion: no split, just show.
- Section labels in mono get a `counter` feel: `§ 02 / 07`.

## Page order (desktop)
0. **Nav**: fixed; "Mutuals" wordmark left; right: mono time "Vienna 08:30" (live clock, Europe/Vienna) and a pill CTA. On ink sections nav inverts (mix-blend-mode: difference on the nav, simplest).
1. **Hero (100dvh, paper)**: headline at `clamp(56px, 11vw, 168px)`, two lines, masked line reveal on load; "remembered." italic. Sub + form right-aligned bottom-left. The bottom ~40% of the viewport is THE INSTRUMENT: a full-bleed waveform of 120 bars (edge to edge, no card), heights from waveform.ts tiled, bars in `--signal`. It "records" (ember dot + mono transcript typing at the left above the bars), then the bars collapse toward a receipt card that lands at right ("✓ Saved to Sarah Lin ..."), then chips + arc + "Tomorrow 08:30" line. Same choreography as HeroDemo, but full-bleed and larger. Mouse-x over the waveform nudges bar heights near the cursor (gentle, +30%, radius 120px) so it feels alive. Replay on click.
2. **Ticker (ink strip, 56px)**: mono 14px, paper text, infinite marquee of real queries: `who do I know in climate hardware?` · `which investor did I meet at Slush?` · `who promised me an intro?` · `who's building in Vienna?` · `who did I meet at the Sequoia dinner?` · `who should meet Anna?` · duplicate for seamless loop, 40s linear, pause on hover.
3. **Story (paper, pinned 300vh)**: `§ 01 / 03`. Left column: three display headings "You talk." / "It remembers." / "It connects." stacked; the active one is ink, others `--ink-faint`, crossfade on scrub with body text under active. Right column: a phone-shaped chat panel (paper-2 border, 380×720, rounded 40px, sticky) whose messages appear as scroll progresses: (a) outgoing voice-note bubble + transcript; (b) incoming receipt "✓ Saved to Sarah Lin ..."; (c) outgoing text "who do I know in real estate in Vienna?"; (d) incoming answer list of 3 names + reasons; (e) incoming daily digest. Mobile: not pinned; headings above, phone below, messages reveal on enter.
4. **Network (ink page, 100vh+)**: `§ 02 / 03` "It connects the dots." in paper. Full-bleed SVG: 28 name chips (mono, paper text on ink, 1px paper-faint border) placed on a deterministic scatter (seeded), hairline arcs between ~30 pairs drawn on scroll (dashoffset scrub). Then a mono query types itself: `who do I know in real estate in Vienna?` and 3 chips light up `--signal-2` with a small reason line under each ("bought two buildings in the 2nd", "ex-Immofinanz", "raised for proptech in May"). Others dim. Sequence scrubbed by ScrollTrigger (pin, 200vh). Mobile: static simplified with 12 chips.
5. **Daily (paper)**: display line "One message a day." at `clamp(48px, 12vw, 200px)` masked-reveal, then below the digest as a real WhatsApp-style bubble (mono) with time 08:30, plus the three ghost actions. Mono label: `08:30 · every day · that's it`.
6. **Who (paper)**: "Who it's for" + body + illustration; then a two-column mono ledger: LEFT "It reads": calendar, contacts, what you tell it. RIGHT "It never": sends on your behalf, scrapes LinkedIn, keeps a copy after you delete. EU-hosted line.
7. **Join (ink page)**: "Get on the list." in paper display type, form (inverted styles: input border paper-faint, button bg paper text ink), meta line. Footer inside the same ink page: giant wordmark "Mutuals" at `clamp(80px, 20vw, 320px)` bleeding off the bottom (overflow hidden, translateY 30%), mono links row above it.

## Copy (no em dashes)
- Hero sub: "Send it a voice note after you meet someone. It files the person, the context, and the intro you promised. Then it sends you one message a day. No app to open."
- Story 01: "Met Sarah at the Sequoia dinner. She's building drones. Intro her to Ben. That's the whole input: voice note, text, or a forwarded contact."
- Story 02: "Every note is filed to the right person. Five Sarahs? It asks once, then never again. Nothing is lost in a chat history. Everything lives in one record you can open any time."
- Story 03: "Ask it anything: who do I know in real estate in Vienna? It answers with names and reasons. Every morning, one message: who to reconnect with, which intro you promised, who might help whom."
- Digest items: "Sarah Lin · you promised an intro to Ben 9 days ago." / "Markus Hofer · 7 weeks quiet, you usually talk monthly." / "Anna Weiss ↔ Tom Adler · Anna is raising for climate hardware. Tom said in June he's looking at exactly that."
- Who: "Built for people whose network is the job: founders, investors, operators. People who meet twenty new people a week and refuse to adopt another tool. It lives in WhatsApp and Telegram, reads only your calendar and contacts, and never sends anything on your behalf."
