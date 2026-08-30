"use client";

import { WaitlistForm } from "./WaitlistForm";
import { HeroDemo } from "./HeroDemo";
import { HeroNetwork } from "./HeroNetwork";
import { copy } from "@/lib/copy";

/**
 * Full-viewport hero. Headline masks in immediately on load; sub/form/
 * reassurance/meta fade + rise in at 0.5s, centered on the dark ground. The
 * instrument (HeroDemo) is a full-bleed ambient waveform anchoring the
 * bottom of the section.
 *
 * Headline and form block animate in with CSS only (see globals.css
 * .hero-line / .hero-fade) so the LCP never waits for JavaScript.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-x-clip">
      <HeroNetwork />
      <div className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center justify-center px-5 pt-20 text-center sm:px-8">
        {/* CSS-only masked rise: paints on first frame, so LCP never waits for JS. */}
        <h1
          className="font-display font-display-hero max-w-[12ch] text-ink"
          style={{ fontSize: "clamp(56px, 11vw, 168px)", lineHeight: 0.92, letterSpacing: "-0.03em" }}
        >
          <span className="hero-line"><span className="hero-line-inner" style={{ animationDelay: "0.1s" }}>{copy.hero.headline[0]}</span></span>
          <span className="hero-line"><span className="hero-line-inner" style={{ animationDelay: "0.2s" }}><em>{copy.hero.headline[1]}</em></span></span>
        </h1>

        <div className="hero-fade mt-12 flex max-w-[560px] flex-col items-center gap-5">
          <div className="w-full max-w-[520px]">
            <WaitlistForm id="waitlist" />
          </div>
          <p className="text-[14px] text-ink-soft">{copy.hero.reassurance}</p>
        </div>
      </div>

      <HeroDemo />
    </section>
  );
}
