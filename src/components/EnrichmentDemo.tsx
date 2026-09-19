"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AgentLogo } from "./AgentLogo";
import s from "./enrichment-demo.module.css";

export function EnrichmentDemo() {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [source, setSource] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlaying(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timers = [
      window.setTimeout(() => setStage(1), 900),
      window.setTimeout(() => setStage(2), 2000),
      window.setTimeout(() => {
        setStage(3);
        setPlaying(false);
      }, 3400),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [playing]);
  function replay() {
    setSource(false);
    setStage(0);
    setPlaying(true);
  }
  return (
    <div ref={root} className={s.demo}>
      <button
        className={s.replay}
        type="button"
        disabled={playing}
        onClick={replay}
        aria-label="Replay enrichment example"
        title="Replay"
      >
        <span aria-hidden="true">↻</span>
      </button>
      <div className={s.stage} data-stage={stage}>
        <div className={s.input}>
          <div className={s.windowLabel}>
            <AgentLogo agent="claude-code" />
            Claude Code <span>New note</span>
          </div>
          <p>
            Coffee with Maya from Lantern Labs. She’s looking for a design
            partner and learning to sail.
          </p>
          <div className={s.extract} aria-hidden="true">
            <span>
              Person <b>Maya</b>
            </span>
            <span>
              Organization <b>Lantern Labs</b>
            </span>
            <span>
              Looking for <b>Design partner</b>
            </span>
            <span>
              Interest <b>Sailing</b>
            </span>
          </div>
          <div className={s.inputFoot}>
            <span className={s.processingDot} />
            {stage === 0
              ? "A note from your conversation"
              : stage === 1
                ? "Finding the right person…"
                : "Matched to Maya Chen"}
          </div>
        </div>
        <div className={s.flow} aria-hidden="true">
          <svg viewBox="0 0 100 80" fill="none">
            <path d="M0 40H100" />
            <path className={s.pulse} d="M0 40H100" />
            <path d="m90 33 8 7-8 7" />
          </svg>
          <span>Enrich</span>
        </div>
        <div className={s.profile}>
          <div className={s.windowLabel}>
            <span className={s.recordDot} />
            Mutuals<span>Existing person</span>
          </div>
          <div className={s.person}>
            <Image
              src="/generated/avatars/a03.webp"
              alt=""
              width={48}
              height={48}
            />
            <div>
              <h3>Maya Chen</h3>
              <p>Founder · Lantern Labs</p>
            </div>
            <span className={s.matched}>Matched</span>
          </div>
          <dl>
            <div>
              <dt>First met</dt>
              <dd>
                Founder dinner, 12 Sep <small>Kept</small>
              </dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>
                Vienna <small>Kept</small>
              </dd>
            </div>
            <div className={s.newFact}>
              <dt>Looking for</dt>
              <dd>
                Design partner <small>Added</small>
              </dd>
            </div>
            <div className={s.newFact}>
              <dt>Interests</dt>
              <dd>
                Sailing <small>Added</small>
              </dd>
            </div>
          </dl>
          <button
            className={s.sourceButton}
            type="button"
            onClick={() => setSource(!source)}
            aria-expanded={source}
          >
            {source ? "Hide original note" : "View original note"}
            <span>19 Sep ↗</span>
          </button>
          {source && (
            <blockquote>
              Coffee with Maya from Lantern Labs. She’s looking for a design
              partner and learning to sail.
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
}
