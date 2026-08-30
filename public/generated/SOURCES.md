# Generated imagery — sources & processing

All assets generated via OpenRouter chat-completions image models (`modalities: ["image","text"]`),
per website-brief.md §2.7. Texture and illustration only — no UI, no text, no faces, no logos.

---

## paper-grain.png

**Prompt:**
> seamless tileable fine paper grain texture, warm off-white, very subtle, high resolution, no visible pattern repetition, photographic

**Model attempts:**
- `google/gemini-3.1-flash-image` — failed (`finish_reason: content_filter`, `native_finish_reason: IMAGE_RECITATION`)
- `google/gemini-2.5-flash-image` — failed (same, `IMAGE_RECITATION`; $0 cost, no image billed)
- `openai/gpt-5-image-mini` — **succeeded**

**Date:** 2026-08-30
**Variant count:** 2
**Chosen:** variant 0 of 2 (both were very close — clean, even, warm cream grain with fine fiber flecks and no directional pattern; variant 0 had marginally more uniform tone, better suited as a base for FFT periodic decomposition without a directional bias).

**Post-processing (Pillow + NumPy):**
1. Convert to grayscale (`L`).
2. Center-crop to square with a 4% inset (avoid any outer vignetting from the source render).
3. Resize to 512×512 (Lanczos).
4. Make seamlessly tileable using **Moisan's periodic-plus-smooth decomposition** (FFT-based): solves for the smooth low-frequency component `s` via a discrete Poisson solve in the frequency domain from the boundary-difference image, then subtracts it (`periodic = original - s`). This yields a truly periodic tile with no visible seam and — unlike a naive "offset + blur" seam heal — does not create a locally flattened band (verified: a first attempt using roll-by-half + Gaussian-blur-the-seam did leave a faint flatter cross visible under contrast stretching; switched to the FFT method, which left no seam at all under a 2×2 mosaic even after `autocontrast`).
5. Normalized so the mean sits at 128 (mid-grey) and contrast is heavily compressed (final std. dev. ≈ 1.9 out of 255) — appropriate since it is applied at 4% opacity as a multiply layer in `.paper-grain` (see `globals.css`).
6. Quantized to 64 grey levels, saved as an 8-bit grayscale PNG with `optimize=True`.

**Verification:** composed a 2×2 tile mosaic (`background-size: 512px 512px` matches the CSS) and inspected it directly (including an artificially contrast-boosted version) — no visible seam or repeating grid.

**Output:** `paper-grain.png`, 512×512, grayscale, 65,170 bytes (~64 KB, under the 120 KB budget).

**Cost:** 2 images via `openai/gpt-5-image-mini` = $0.0410475 + $0.043203 = **$0.0842505**. (The two filtered Gemini attempts cost $0.)

---

## dinner-table.png

**Prompt style (brief):**
> minimal editorial line illustration, ink on warm paper, overhead view of six people at a long dinner table, thin lines, one element in deep green, lots of negative space, no text

**Model:** `google/gemini-3.1-flash-image` (all 6 variants succeeded on first try; no fallback needed).

**Date:** 2026-08-30
**Variant count:** 6, each the base prompt above expanded with exactly-six-people / no-faces / top-down guardrails plus one differentiator per variant:

| # | Added wording |
|---|---|
| 0 | "single continuous thin line weight" |
| 1 | "no shading, flat" |
| 2 | "background plain warm off-white #EFE9DF" |
| 3 | "one small deep green #1F5C4A accent such as one glass or one plate" |
| 4 | faint hairline arcs between people + green accent + all of the above combined |
| 5 | all of the above combined, "extremely minimal, elegant editorial spot-illustration style" |

An initial exploratory prompt without the explicit "true top-down / heads as plain circles / no faces" guardrails produced a 3/4-perspective scene with 8 people and visible facial features — rejected outright and not counted among the 6 official variants (see cost note below). The guardrails were added for all 6 kept variants and reliably produced true overhead views with faceless circular heads.

**Chosen:** **variant 2** ("background plain warm off-white #EFE9DF" — a clean top-down six-person table with a single shared green serving pot as the sole color accent). Picked over the others for being the most restrained: symmetric, perfectly flat, no extraneous elements beyond the one deep-green pot, no faces, uniform thin ink lines, plenty of negative space. Variant 4 (with faint connecting arcs) and variant 5 (with heavier black-filled heads) were also strong but read as slightly less minimal for this use.

**Post-processing (Pillow + NumPy):**
1. Classified every pixel by Euclidean RGB distance from the background color (`#EFE9DF`), which the raw render still has baked into it as a very subtle paper-grain texture (measured background noise: distance ≈ 3–11). Pixels below distance 15 were forced to full transparency; pixels between 15 and 180 got a linear alpha ramp (preserves anti-aliased line edges); anything above 180 (solid ink strokes) is fully opaque.
2. Classified non-background pixels as "green" (green channel clearly dominant) vs. "ink", and recolored: green → `#1F5C4A` (signal), ink → `#14110F` (ink) — exact site palette from `globals.css`.
3. Built a small **indexed (P-mode) palette** of 2 colors × 64 alpha levels (128 palette entries with per-index alpha via a `tRNS`-style RGBA palette) instead of full RGBA — this was the key fix for file size: a first pass at full RGBA output was 924 KB because leftover background-noise alpha values were nearly continuous (thousands of unique low alpha values ruin PNG deflate); after tightening the transparency threshold and quantizing to a small indexed palette, size dropped to 50 KB.
4. Cropped to the content bounding box (non-zero alpha) with ~6%/8% padding.
5. Resized to fit within 1440px max width (final image did not need upscaling or downscaling past that cap: content bbox was 1200×538).
6. Re-quantized once more after crop/resize back into the same indexed 2-color × 64-alpha-level palette and saved as PNG (`optimize=True`).

**Kept raw / record files:**
- `raw/dinner-table-raw.png` — the selected variant (variant 2), unprocessed, as returned by the model.
- `raw/dinner-table-variants.jpg` — a 3×2 contact sheet of all 6 variants for the record (~92.5 KB).
- The 5 non-selected variants were not copied into `public/generated/` (discarded from the working scratch directory).

**Output:** `dinner-table.png`, 1200×538, indexed-palette PNG with alpha, 50,380 bytes (~49 KB, well under the 300 KB budget).

**Cost:** 1 rejected exploratory image + 6 kept variants, all `google/gemini-3.1-flash-image`:
$0.0684705 (rejected exploratory) + $0.0684295 + $0.068393 + $0.067247 + $0.0683405 + $0.068294 + $0.0672645 = **$0.4785**.

---

## Total spend

Paper grain: $0.0842505
Dinner table (incl. one rejected exploratory generation): $0.4785
**Total: ≈ $0.563**

---

## Fallback note

No procedural fallback was required — both assets succeeded via real image-model generations within the first 1–3 model attempts (paper grain needed 3 model attempts due to two Gemini `IMAGE_RECITATION` content-filter false-positives; the dinner illustration succeeded on the first model/prompt on all 6 variants).

## avatars/a01.webp – a12.webp (hero portrait avatars) — v2

**Note:** these depict entirely synthetic (AI-generated) people — no real individual's likeness, no licensing or consent issues.

**v2 reason:** the original set (see superseded v1 spec below) read as too corporate — "founder or investor at an evening dinner event" produced blazers, business-dinner backdrops, and a stiff editorial-headshot feel. Regenerated 2026-08-30 to depict normal, everyday people in casual clothes and varied everyday settings instead, with slightly more natural (less desaturated) colour.

**Prompt template v2** (one call per person, `[description]` swapped each time to vary gender, age 22–60, ethnicity, hair, glasses, and expression; `[setting]` and `[clothing]` also vary per person):
> candid photorealistic portrait of a [description], everyday person, [setting], casual clothes ([clothing]), natural light, relaxed genuine expression, shallow depth of field, head and shoulders, looking slightly off camera, no text, no watermark, square

**The 12 people used (description — setting — clothing):**
1. Black woman, early 30s, natural curly afro, warm smile, no glasses — sitting at a kitchen table with a cup of coffee — hoodie
2. white man, mid-50s, short gray hair, thin wire glasses, calm relaxed expression — sitting on a park bench — knit sweater
3. South Asian woman, late 20s, long straight dark hair, warm smile, no glasses — standing on a balcony at golden hour — linen shirt
4. Latino man, early 40s, short trimmed beard, glasses, easygoing neutral expression — browsing in a small bookshop — denim jacket
5. East Asian woman, mid-30s, sleek chin-length bob, gentle smile, no glasses — sitting at a street cafe table — t-shirt
6. Middle Eastern man, early 30s, short dark hair, clean-shaven, no glasses, relaxed expression — standing with a bicycle by the river — hoodie
7. white woman, early 40s, shoulder-length blonde hair, stylish glasses, warm smile — sitting in a living room surrounded by houseplants — knit sweater
8. Black man, early 50s, shaved head, short gray stubble, no glasses, calm neutral expression — browsing stalls at an outdoor farmers market — denim jacket
9. East Asian man, mid-20s, short black hair, round glasses, friendly smile — standing on a rooftop at dusk — t-shirt
10. Latina woman, mid-30s, curly dark brown hair, no glasses, relaxed calm expression — standing in a small workshop with tools around — linen shirt
11. white man, early 30s, short beard, tousled brown hair, glasses, warm smile — sitting by a lake — hoodie
12. South Asian man, mid-40s, gray-flecked short hair, no glasses, relaxed neutral expression — sitting on a train looking out the window — denim jacket

**Model:** `google/gemini-3.1-flash-image` — succeeded for all 12 on the first attempt, no retries needed.

**Date:** 2026-08-30 (v2 regeneration)
**Count:** 12 images, one call per person.

**Post-processing (Pillow):**
1. Center-crop each raw render to a square (min of width/height).
2. Resize to 256×256 (Lanczos).
3. Mild desaturation only — `ImageEnhance.Color(im).enhance(0.9)` — kept close to natural colour (v1 used 0.6, which read as too flat/corporate).
4. Convert to RGBA and apply a circular alpha mask (anti-aliased via 4× supersampling then downsampled) so corners are transparent.
5. Saved as WebP, quality 82 (dropped in steps of 10 only if needed to stay under the 25 KB budget — not needed here; all 12 landed between 12.4–19.5 KB at quality 82).

**Review:** built a 4×3 contact sheet of the raw renders and inspected visually before processing — all 12 clean: no text, no watermarks, no extreme close-ups, no business attire, no heavy stylization, good diversity across gender/age/ethnicity/hair/glasses/expression, and clearly varied everyday settings (kitchen, park, balcony, bookshop, cafe, riverside, living room, market, rooftop, workshop, lake, train) — all 12 were kept on the first pass, no regeneration needed. Built a second contact sheet from the final circular-masked webp avatars for final QA (`avatars/_contact.jpg`, 800×600, ~153 KB).

**Output:** `avatars/a01.webp` … `avatars/a12.webp`, 256×256 RGBA WebP with transparent corners, 12.4–19.5 KB each (all under the 25 KB budget; total ~191 KB for all 12). `avatars/_contact.jpg` is a QA contact sheet, not used on the site.

**Cost:** 12 successful generations (no retries) via `google/gemini-3.1-flash-image`, roughly $0.07/image based on the per-image cost observed for this model elsewhere in this document → ≈ $0.84 total.

---

<details>
<summary>Superseded v1 spec (too corporate — replaced 2026-08-30, see v2 above)</summary>

**Prompt template v1** (one call per person, `[description]` swapped each time to vary gender, age 25–55, ethnicity, hair, glasses, and expression):
> photorealistic head-and-shoulders portrait of a [description], founder or investor at an evening dinner event, natural soft window light, shallow depth of field, plain dark neutral background, looking slightly off camera, candid, editorial photography, no text, no watermark, square crop

**The 12 descriptions used (v1):**
1. Black woman, early 30s, natural curly afro, warm smile, no glasses
2. white man, mid-50s, short gray hair, thin wire glasses, calm neutral expression
3. South Asian woman, late 20s, long straight dark hair, warm smile, no glasses
4. Latino man, early 40s, short trimmed beard, glasses, neutral expression
5. East Asian woman, mid-30s, sleek chin-length bob, gentle smile, no glasses
6. Middle Eastern man, early 30s, short dark hair, clean-shaven, no glasses, neutral expression
7. white woman, early 40s, shoulder-length blonde hair, stylish glasses, warm smile
8. Black man, early 50s, shaved head, short gray stubble, no glasses, neutral expression
9. East Asian man, mid-20s, short black hair, round glasses, friendly smile
10. Latina woman, mid-30s, curly dark brown hair, no glasses, neutral calm expression
11. white man, early 30s, short beard, tousled brown hair, glasses, warm smile
12. South Asian man, mid-40s, gray-flecked short hair, no glasses, neutral expression

**Model (v1):** `google/gemini-3.1-flash-image` — succeeded for all 12 on the first attempt (a04 needed one retry due to a transient response missing the `images` field). Post-processing used `ImageEnhance.Color(im).enhance(0.6)` desaturation. Date: 2026-08-30 (original generation).

</details>

---

## Logo

The Mutuals mark (`src/components/Logo.tsx`, `public/logo.svg`, `src/app/icon.svg`, `src/app/apple-icon.png`) was **concept-explored** with an image model, then **hand-built as a real SVG** — the generated renders were reference only, never traced or shipped.

**Model:** `google/gemini-3.1-flash-image` via OpenRouter chat completions (`modalities: ["image","text"]`, base64 in `choices[0].message.images[0].image_url.url`) — same pattern as the rest of this document.

**Date:** 2026-08-30

**Prompt template** (one call per concept, `[concept]` swapped each time):
> minimal vector logo mark for an app called Mutuals, [concept], flat, single colour sky blue #5FA8F7 on plain black background, geometric, no text, no letters, centered, lots of margin, crisp edges, no gradients, no shadows

**8 concepts generated** (all succeeded on the first attempt, no retries):
1. `two_circles` — two overlapping circles forming a Venn intersection, representing "mutual" connection
2. `two_nodes_arc` — two small solid dots (nodes) connected by a single curved arc line, like two people linked
3. `abstract_m_loops` — an abstract letter M formed from two linked interlocking loops, symmetrical
4. `speech_bubble_dots` — a rounded speech bubble outline containing two small dots connected by a short line
5. `knot_two_rings` — two rings linked together like a simple chain knot, interlocking circles
6. `waveform_circle` — a simple voice waveform (a few vertical bars) centered inside a circle outline
7. `linked_loops_infinity` — two circles linked side by side sharing a small overlapping lens shape
8. `orbit_two_dots` — one small circle orbiting another with a thin circular orbit path connecting them

Reviewed as a contact sheet. `abstract_m_loops` and `knot_two_rings` had interesting woven/over-under detail but that detail is exactly what disappears at 16–24px. `two_nodes_arc`, `speech_bubble_dots`, and `orbit_two_dots` read as UI iconography rather than a brand mark. `waveform_circle` ties too literally to "voice note" and loses the "two people" idea.

**Chosen: `two_circles`** — two overlapping circles/rings. Simplest silhouette of the eight, most literal expression of "mutual" (a shared, overlapping connection between two people), and the one that stayed legible with the least detail — exactly what a favicon-scale mark needs.

**From concept to production asset:** the generated PNG was reference only. The shipped mark is a hand-written SVG, `viewBox="0 0 64 64"`, built from two `<circle>` primitives — `cx=24 cy=24 r=16` and `cx=40 cy=40 r=16` (diagonal placement, not the side-by-side layout in the generated concept) — both filled with the same opaque colour so their union reads as one connected form. No stroke, no path data, no traced artwork. Diagonal placement was chosen over the generated concept's horizontal layout so the mark's bounding box (48×48 within the 64×64 canvas) is close to square, which sits better inside a square icon/favicon frame than the wide horizontal pill the side-by-side layout produces. Verified legible down to 16×16 by rendering the Apple touch icon at 180/64/32/16px — the twin-lobe silhouette holds up at every size.

**Cost:** 8 images via `google/gemini-3.1-flash-image`, concept exploration only (none shipped) — consistent with the ~$0.07/image cost observed elsewhere in this document, ≈ $0.56 total.

---

## OG image fonts (not generated)
`src/app/fonts/Fraunces.woff` (Fraunces 400, latin, from @fontsource/fraunces, OFL) and `src/app/fonts/GeistMono.ttf` (Geist Mono Regular, vercel/geist-font, OFL) are bundled for the `@vercel/og` renderer only. The page itself uses `next/font/google`.
