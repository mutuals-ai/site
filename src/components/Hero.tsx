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
    <section className="relative flex min-h-[100svh] flex-col overflow-x-clip">
      <HeroNetwork />
      <div className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center justify-center px-5 pt-20 text-center sm:px-8">
        {/* CSS-only masked rise: paints on first frame, so LCP never waits for JS. */}
        <h1
          className="font-sans w-full font-medium text-ink"
          style={{ fontSize: "clamp(36px, 6.9vw, 100px)", lineHeight: 1.02, letterSpacing: "-0.04em" }}
        >
          <span className="hero-line"><span className="hero-line-inner" style={{ animationDelay: "0.1s" }}>{copy.hero.headline[0]}</span></span>
          <span className="hero-line"><span className="hero-line-inner" style={{ animationDelay: "0.2s" }}>{copy.hero.headline[1]}</span></span>
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
