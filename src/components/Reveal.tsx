"use client";
import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from "react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** split into lines (default) or words */
  by?: "lines" | "words";
  /** seconds */
  delay?: number;
  /** play on mount instead of on scroll enter */
  immediate?: boolean;
  id?: string;
};

/**
 * Masked line reveal. Splits text into lines, wraps each in an overflow-hidden
 * mask, and slides them up on enter (expo.out, 0.9s, stagger 0.08).
 * Reduced motion: no split, no animation.
 */
export function Reveal({ as: Tag = "div", className, style, children, by = "lines", delay = 0, immediate = false, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    const run = () => {
      split = new SplitText(el, { type: by === "lines" ? "lines" : "words", linesClass: "reveal-line", wordsClass: "reveal-line", mask: by, autoSplit: true,
        onSplit: (self) => {
          const targets = by === "lines" ? self.lines : self.words;
          tween = gsap.fromTo(targets, { yPercent: 110 }, {
            yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
          });
          return tween;
        } });
    };
    // wait for fonts so line breaks are final
    document.fonts?.ready.then(run) ?? run();
    return () => { tween?.kill(); split?.revert(); };
  }, [by, delay, immediate]);
  return (
    <Tag ref={ref as never} id={id} className={className} style={style}>
      {children}
    </Tag>
  );
}
