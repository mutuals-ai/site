# Agent-first website, September 2026

## Owner correction: restore the animated identity

The owner rejected the white/green redesign as bland and explicitly prefers the
original animated site. This supersedes the visual plan below, not the agent-first
product direction. Restore the existing network, waveform and scroll narrative.

Palette: night #0e0c0b, raised surface #1a1715, warm ink #f2ede4,
signal blue #5fa8f7, focus blue #a9cdff. Restore Geist for the large centered
headline/body, Geist Mono for small controls, Fraunces for the wordmark and story.

Layout: original full-viewport centered hero, then prominent connector directory,
then original animated story; small supporting identity feature and privacy text.

```
               Mutuals                         Agents / Sign in
                   Relationship memory
                       for your AI.
                [Early access] [Explore agents]
          original moving network + living waveform
             Claude Code / Codex / Hermes / Grok / Muse
                  original scroll-driven story
                   supporting features / privacy
```

Critique before build: merely darkening the new cards would not restore what the
owner liked. Reuse the original animation components and composition, not a new
approximation. Adapt new sections to those tokens. Keep reduced-motion fallbacks,
truthful beta labels and fictional-demo disclosure; do not restore old unsupported
claims about automatic daily messages or calendar access.

The owner's approved agent-first plan supersedes the old chat-only waitlist brief.
Keep the working waitlist API, referral handling and domain deployment unchanged.

## Design before implementation

Palette: white #ffffff, ink #18201f, muted #56645e, rule #dce4df,
forest #185c43, mint #eaf3ed. Manrope sets headlines; IBM Plex Sans sets body
copy and controls. IBM Plex Mono is reserved for commands. Google Fonts' OFL
families are downloaded at build time by next/font and served locally.

Left-aligned, asymmetric hero; one expressive element is a fictional memory
moving from a note in one agent to recall in another. Directory rows
carry real availability instead of a logo cloud implying partnerships.

```
Mutuals                         Agents    Privacy    Sign in
Relationship memory             Save a note | Before a meeting
for your AI.                    Same context, another agent
Join agent early access          Dated answer with original source
Choose your agent
Claude Code       Planned       Details
Codex             Planned       Details
Hermes / Grok Bot / Muse         Planned
Small identity feature          Which Maya? [Maya A] [Maya B]
Your permission, not your whole digital life
Waitlist form
Support / Privacy / Imprint
```

Critique: an undifferentiated memory headline and logo wall could describe any
agent database. Replace that wall with useful setup/availability details and
show a source-backed recall. The owner specifically asked to keep the two-Maya
choice out of the hero; it is a supporting feature, not the positioning. No animated graph, automatic carousel, fake
customer logos or unsupported public-launch CTA. Preserve static content without
JavaScript. Interaction responds only to deliberate choices. On mobile stack the
demo below the headline. Keep reading measures below 75 characters.

The catalog is the sole authority for compatibility labels. Planned means no
Mutuals client acceptance yet; generic MCP support alone does not mean available.
Marketplace approval is separate. No production deployment until visual checks,
legal disclosures and endpoint acceptance are complete.
