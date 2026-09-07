# Mutuals — Waitlist Site Brief

**URL:** getmutuals.ai  
**Single job of the page:** make a founder/investor who lands here feel, within 5 seconds, that this is a serious, beautifully made product — and get their email (or WhatsApp number) into the waitlist.  
**Audience:** founders, investors, operators. Design-literate, impatient, allergic to generic SaaS pages. They judge products by their landing page.  
**Deliverable:** a production-deployed, single-page site with a waitlist form, animated, fast, and accessible.

This brief is written for an autonomous coding agent. Go above and beyond on craft, but stay inside the constraints. Where this brief pins a decision, follow it. Where it leaves room, make a specific, defensible choice and write it in `docs/design-decisions.md`.

---

## 1. What Mutuals is (for copy and visuals)

A personal relationship memory that lives in WhatsApp/Telegram. You send it a voice note — "met Sarah at the Sequoia dinner, she's building drones, intro her to Ben" — and it files that to the right person, remembers everything, and sends one message a day: who to reconnect with, which intro you promised, who might help whom. No app to install. No dashboard you have to open. Your network, remembered.

Three ideas the page must land, in this order:
1. **You talk, it remembers.** (voice note → structured memory)
2. **It connects the dots.** (intros, reconnects, "who do I know in X")
3. **It lives where you already are.** (WhatsApp/Telegram, one message a day)

Words to use: remember, network, mutuals, voice note, one message a day, intro, reconnect.  
Words to avoid: CRM, AI-powered, supercharge, seamless, 10x, revolutionize, leverage.

---

## 2. Design direction

### 2.1 Concept: "the ledger that listens"
The product is a quiet, precise record that you speak into. The visual language should feel like a beautifully bound notebook crossed with a live audio instrument. Warm, physical, exact. Not a "futuristic AI" page, not a dark neon dashboard, not a cream-and-serif template.

### 2.2 Palette (tokens) **[DECISION]**
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#14110F` | primary text, dark surfaces |
| `--paper` | `#EFE9DF` | page background (warm, slightly grey, *not* cream-yellow) |
| `--paper-2` | `#E3DCD0` | cards, dividers |
| `--signal` | `#1F5C4A` | the single accent: deep green, used for the voice waveform, links, CTA |
| `--signal-2` | `#8FB8A6` | accent tint for highlights, focus rings |
| `--ember` | `#B8452B` | used *once* on the page, for the live "recording" dot only |

Do not introduce gradients as decoration. No purple. No acid green. No terracotta/clay accent. The deep green is the one color that moves.

### 2.3 Typography **[DECISION]**
- **Display:** a characterful high-contrast serif with a slightly editorial, humanist feel — e.g. *GT Sectra*, *Tiempos Headline*, or the free *Instrument Serif* / *Fraunces* (use Fraunces with `opsz` and a low `SOFT` axis if you need a free option). Used only for the headline and section openers, set large, tight tracking (−0.02em), with true italics for emphasis words.
- **Body:** a neutral grotesk with real character at small sizes — *Söhne*, *Inter* (fallback), or free *Geist*. 16–18px, generous line-height (1.55).
- **Utility/mono:** *JetBrains Mono* or *Geist Mono* for timestamps, the "receipt" UI, and labels. This face carries the "ledger" feeling; use it for anything that looks like a record.

Type scale (desktop): 96 / 56 / 32 / 20 / 17 / 14. Mobile: 48 / 36 / 26 / 18 / 16 / 13.

### 2.4 Layout
Single column, max width 1120px, big vertical rhythm (section padding 160px desktop / 96px mobile). Left-aligned everything; no centered hero text. A thin 1px `--paper-2` rule runs down the left margin from the hero to the footer, like a notebook margin, and the section labels sit in that margin in mono.

```
|  MUTUALS                                     [Join the waitlist]
|
|  Your network,
|  remembered.                <- display serif, 2 lines, 96px
|
|  Send it a voice note. It files the person,
|  the context, and the intro you promised.
|  One message a day. No app to open.
|
|  [ email or WhatsApp number        ] [Join]
|  mono: "Private beta · autumn 2026 · Vienna → everywhere"
|
|  ┌────────────────────────────────────────────┐
|  │  SIGNATURE ELEMENT (see 2.5)               │
|  └────────────────────────────────────────────┘
|
|  01  You talk.        (this IS a sequence, so numbering is honest)
|  02  It remembers.
|  03  It connects.
|
|  The daily message  (sample digest, rendered as a real chat bubble)
|
|  Who it's for / Why now (short)
|
|  [ waitlist form again ]
|  footer: mono, tiny: privacy · imprint · hello@getmutuals.ai
```

### 2.5 Signature element **[DECISION]**: the voice note that becomes a record
One orchestrated animation, in the hero, that explains the whole product without words. It plays once on load (≈6s), then loops gently, and can be replayed by clicking.

Sequence:
1. A WhatsApp-style voice-note bubble appears, right-aligned, with a live waveform in `--signal`. The ember dot pulses (recording). A mono caption types out the transcript underneath as if being spoken: *"Met Sarah at the Sequoia dinner, she's building autonomous drones, I want to intro her to Ben."*
2. The waveform's bars detach and drift left, re-forming into three mono lines that snap into a card (the "receipt"):
   ```
   ✓ Saved to Sarah Lin
     Sequoia dinner · Aug 28
     + autonomous drones
     + intro → Ben Roth
   ```
3. From the card, a single hairline draws outward to two small name chips ("Sarah Lin", "Ben Roth") and a thin arc connects them, labeled in mono: *intro · pending*.
4. The card settles; a small line in mono fades in below: *"Tomorrow 08:30 — reminder to make the intro."*

Implementation: real DOM + SVG, animated with GSAP timelines (or Motion One). The waveform is an SVG of ~48 bars whose heights are driven by a precomputed array (deterministic, looks like real speech). Bar-to-text morph is a coordinated position/opacity choreography, not a true morph. Respect `prefers-reduced-motion`: show the final state statically with a subtle fade.

This is the one place to spend all the boldness. Everything else on the page is quiet.

### 2.6 Motion elsewhere (restraint)
- Scroll-triggered reveals: opacity + 12px translate, 500ms, ease-out, staggered by 60ms. Nothing else moves on scroll.
- Hover on the CTA: background darkens 8%, arrow icon shifts 3px. No scale.
- Waitlist submit: the button morphs into the receipt style — `✓ You're on the list · #0421` in mono — with the position number from the backend. This echoes the product's own receipt language.
- No parallax, no cursor followers, no floating blobs, no particle fields, no 3D.

### 2.7 Generated imagery (GPT Image / other image models)
Use image generation for **texture and illustration only**, never for UI or text.

Generate:
- **Paper texture**: a very subtle warm paper grain, tileable, low contrast. Use at 3–5% opacity as a multiply layer over `--paper`. Prompt: *"seamless tileable fine paper grain texture, warm off-white, very subtle, high resolution, no visible pattern repetition, photographic"*. Verify it tiles; fix seams in code if needed.
- **One illustration** for the "Who it's for" section: a small, restrained line illustration in the palette (ink lines on paper, a single green element) of people at a dinner table seen from above, with a few faint hairline arcs between them. Prompt in the style of *"minimal editorial line illustration, ink on warm paper, overhead view of six people at a long dinner table, thin lines, one element in deep green, lots of negative space, no text"*. Generate 6 variants, pick one, post-process to exact palette (recolor to `--ink` / `--signal`), export as SVG-traced or high-res PNG with transparent background.
- **Optional**: a favicon/wordmark exploration — but the final logo must be set in the display serif by you, not generated.

Do not generate: screenshots, fake app UIs, charts with numbers, anything with text, faces in close-up, logos of WhatsApp/Telegram/LinkedIn (use the official brand assets per their guidelines, or a plain word).

All generated assets go in `public/generated/` with a `SOURCES.md` listing the prompt, model, date, and any post-processing.

### 2.8 The "graphs" request
The page should feel data-rich without fake data. Two honest data-like elements:
- The **receipt card** (real product format).
- A **sample digest** rendered as a chat bubble with three real-looking items (use the Mutuals digest format: name — reason — date). Rendered in HTML with the mono face, not an image.

No bar charts, no "10,000 users" counters, no dashboard mockups. We don't have a dashboard yet and the audience will smell it.

---

## 3. Copy (use as-is unless you have a strictly better line; log changes)

**Nav:** `Mutuals` · `Join the waitlist`

**Hero headline:** *Your network, remembered.*  
**Hero sub:** Send it a voice note after you meet someone. It files the person, the context, and the intro you promised — then sends you one message a day. No app to open.  
**Form placeholder:** `email or WhatsApp number`  **Button:** `Join the waitlist`  
**Under form (mono):** `Private beta · autumn 2026 · Vienna → everywhere`

**Section 01 — You talk.**  
"Met Sarah at the Sequoia dinner. She's building drones. Intro her to Ben." That's the whole input. Voice note, text, or a forwarded contact.

**Section 02 — It remembers.**  
Every note is filed to the right person. Five Sarahs? It asks once, then never again. Nothing is lost in a chat history; everything lives in one record you can open any time.

**Section 03 — It connects.**  
Ask it anything: *who do I know in real estate in Vienna?* It answers with names and reasons. And every morning, one message: who to reconnect with, which intro you promised, who might help whom.

**The daily message (label):** `08:30 · every day · that's it`  
Sample digest bubble:
```
Mutuals · Tue Sep 2

1  Sarah Lin — you promised an intro to Ben 9 days ago.
2  Markus Hofer — 7 weeks quiet; you usually talk monthly.
3  Anna Weiss ↔ Tom Adler — Anna is raising for climate
   hardware; Tom said in June he's looking at exactly that.
```

**Who it's for:**  
Built for people whose network is the job — founders, investors, operators — who meet twenty new people a week and refuse to adopt another tool. It lives in WhatsApp and Telegram, reads only your calendar and contacts, and never sends anything on your behalf.

**Privacy line (mono, small):** `EU-hosted · reads calendar & contacts only · drafts, never sends · delete everything in one tap`

**Footer:** `hello@getmutuals.ai` · `Privacy` · `Imprint`

---

## 4. Waitlist mechanics

- Accept **email or phone number** in one field. Detect which (regex), normalize phone to E.164 with `libphonenumber-js`. Store both raw and normalized.
- Backend **[DECISION]**: Next.js route handler → Postgres (Neon) table `waitlist(id, email, phone, source, referrer, utm jsonb, position serial, created_at, confirmed_at)`. Alternatively Supabase if already used. No third-party waitlist SaaS.
- Return the position number; render it in the receipt-style success state.
- Send a confirmation email via Resend (plain, mono-styled, from `hello@getmutuals.ai`): "You're #0421 on the Mutuals list. We'll message you when your spot opens." For phone signups, no SMS in v1; just the on-page receipt.
- Referral: after signup, show a shareable link `getmutuals.ai/?r=<short-id>` and "Move up the list: each friend who joins moves you up 10 spots." Store `referred_by`. Keep it understated, one line.
- Spam protection: Cloudflare Turnstile (invisible), rate limit by IP (5/hour), honeypot field.
- Duplicate submissions return the existing position, not an error.

---

## 5. Tech stack **[DECISION]**

- **Next.js 15** (App Router), static page + one route handler. Or Astro if you prefer; keep interactivity islands minimal either way.
- **Tailwind** with the tokens above defined as CSS variables (`@theme`), no default Tailwind palette used anywhere.
- **GSAP** (with ScrollTrigger) for the signature animation and reveals; or **Motion** (motion.dev) if you'd rather stay in React idiom. One library, not both.
- **Lenis** for smooth scroll is optional; skip if it hurts INP.
- Fonts self-hosted, `font-display: swap`, subset to Latin + German diacritics. Preload the display face.
- **Vercel** deploy (EU region `fra1`), custom domain `getmutuals.ai`, `www` redirects to apex, `getmutuals.com` (if owned) 301s to `.ai`.
- Analytics: **Plausible** or **PostHog** (EU cloud), cookieless. Events: `view`, `waitlist_submit`, `waitlist_success`, `replay_hero`, `share_link_copied`.
- OG image: generate at build time with `@vercel/og` — the headline in the display serif on `--paper`, with a static frame of the receipt card. Test it in the WhatsApp link preview (this page will mostly be shared on WhatsApp).

---

## 6. Quality bar

**Performance (Lighthouse mobile, throttled):** Performance ≥ 95, LCP < 1.8s, CLS < 0.02, INP < 150ms, total JS < 120KB gzipped on first load. The hero animation must not block LCP: render the final-state DOM immediately, then animate from it.

**Accessibility:** WCAG AA contrast (check `--signal` on `--paper`: 7.6:1, fine; `--signal-2` is decorative only). Visible focus rings (2px `--signal-2` outer). The animation is `aria-hidden`; its meaning is conveyed by the section copy. `prefers-reduced-motion` respected everywhere. Form has a real `<label>`, error messages inline, success announced via `aria-live`.

**Responsive:** design at 390px first, then 768, 1280, 1600. The signature animation reflows to a vertical composition on mobile (bubble on top, card below, chips below that). Test on real iOS Safari; check the 100vh trap and font rendering.

**Content honesty:** no fake testimonials, no logo walls, no invented metrics. If a section needs social proof and we have none, cut the section.

**Browser matrix:** latest Chrome, Safari, Firefox, iOS Safari 17+, Android Chrome.

---

## 7. Process for the agent

1. **Plan first.** Write `docs/design-decisions.md`: restate the tokens, pick the exact fonts (with license/source), sketch the hero timeline in a table (t, element, property, from → to, easing), and list generated-asset prompts. Check the plan against §2 — if any part could have come from a generic "AI startup landing page," change it and say why.
2. **Build the static page** with final copy and final-state hero (no animation yet). Screenshot at 390 and 1280. Critique: spacing rhythm, type hierarchy, margin rule alignment.
3. **Build the signature animation.** Screenshot or record at 0s / 2s / 4s / 6s. Critique: does it read without the caption? Is anything moving that doesn't need to?
4. **Generate and integrate assets** per §2.7. Document in `public/generated/SOURCES.md`.
5. **Wire the waitlist**, confirmation email, referral link, Turnstile.
6. **Run Lighthouse, axe, and a reduced-motion pass.** Fix everything below the bar in §6.
7. **Deploy**, verify the OG preview in WhatsApp and iMessage, verify the domain redirects.
8. **Final mirror check:** remove one thing. Then ship.

**Definition of done:** deployed at getmutuals.ai; Lighthouse and a11y bars met; waitlist writes to DB and sends the email; `docs/design-decisions.md` and `SOURCES.md` complete; a 20-second screen recording of the hero on mobile and desktop attached to the PR.

