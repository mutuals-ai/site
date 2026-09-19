"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { LogoMark } from "./Logo";
import { AgentLogo } from "./AgentLogo";
import s from "./memory-engine.module.css";

const sources = [
  {
    name: "LinkedIn",
    detail: "Your imported connections",
    logo: "/brands/linkedin.ico",
  },
  {
    name: "WhatsApp",
    detail: "Notes & voice messages",
    logo: "/brands/whatsapp.svg",
  },
  {
    name: "Google Calendar",
    detail: "Meetings & shared history",
    logo: "/brands/calendar.ico",
  },
  { name: "Email", detail: "Conversations & introductions", logo: null },
];
const clients = [
  ["claude-code", "Claude Code"],
  ["codex", "Codex"],
  ["hermes", "Hermes"],
  ["openclaw", "OpenClaw"],
  ["grok", "Grok Bot"],
  ["muse", "Muse"],
];

export function MemoryEngine() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
      () => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
          },
        });
        timeline.fromTo(
          root.current!.querySelectorAll("[data-tier]"),
          { y: (i: number) => (i - 1) * 18 },
          {
            y: (i: number) => (i - 1) * 110,
            duration: 1,
            ease: "power1.inOut",
          },
          0,
        );
        timeline.fromTo(
          root.current!.querySelectorAll("[data-signal]"),
          { strokeDashoffset: 500 },
          { strokeDashoffset: 0, duration: 1.5, ease: "none" },
          0,
        );
        timeline.fromTo(
          root.current!.querySelectorAll("[data-reveal]"),
          { opacity: 0.8, y: 12 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 },
          0.15,
        );
        timeline.to(
          root.current!.querySelector("[data-orbit]"),
          {
            rotate: 65,
            transformOrigin: "50% 50%",
            duration: 1.5,
            ease: "none",
          },
          0,
        );
      },
      root,
    );
    return () => media.revert();
  }, []);
  return (
    <section
      ref={root}
      className={s.section}
      id="how-it-works"
      aria-labelledby="engine-title"
    >
      <div className={s.sticky}>
        <header className={s.heading}>
          <h2 id="engine-title">
            A memory built
            <br />
            around people.
          </h2>
          <p>
            Bring your connections, conversations and meetings together.
            <br className={s.desktopBreak} /> Mutuals builds the record. Your
            agents put it to work.
          </p>
        </header>
        <div className={s.ecosystem}>
          <svg
            className={s.routes}
            viewBox="0 0 1100 500"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="route-light">
                <stop stopColor="#7ac6ae" stopOpacity=".1" />
                <stop offset=".5" stopColor="#bbd9ff" />
                <stop offset="1" stopColor="#a390e5" stopOpacity=".1" />
              </linearGradient>
            </defs>
            {[105, 200, 295, 390].map((y) => (
              <g key={y}>
                <path d={`M200 ${y} C330 ${y} 340 250 480 250`} />
                <path
                  data-signal
                  className={s.signal}
                  d={`M200 ${y} C330 ${y} 340 250 480 250`}
                />
              </g>
            ))}
            {[110, 250, 390].map((y) => (
              <g key={y}>
                <path d={`M620 250 C760 250 750 ${y} 900 ${y}`} />
                <path
                  data-signal
                  className={s.signal}
                  d={`M620 250 C760 250 750 ${y} 900 ${y}`}
                />
              </g>
            ))}
          </svg>
          <div className={s.sources} data-reveal>
            <h3>Where context begins</h3>
            {sources.map((source) => (
              <div className={s.source} key={source.name}>
                <span className={s.sourceLogo}>
                  {source.logo ? (
                    <Image src={source.logo} alt="" width={28} height={28} />
                  ) : (
                    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
                      <rect
                        x="3"
                        y="6"
                        width="22"
                        height="16"
                        rx="3"
                        stroke="#a5bbdf"
                        strokeWidth="1.5"
                      />
                      <path
                        d="m4 8 10 8L24 8"
                        stroke="#a5bbdf"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </span>
                <div>
                  <strong>{source.name}</strong>
                  <span>{source.detail}</span>
                </div>
              </div>
            ))}
            <p className={s.availability}>
              Calendar and email sync are planned.
            </p>
          </div>
          <div
            className={s.core}
            aria-label="Mutuals database: sources, enrichment, and connected people"
          >
            <div className={s.halo} />
            <svg
              className={s.orbit}
              viewBox="0 0 440 440"
              fill="none"
              aria-hidden="true"
            >
              <g data-orbit>
                <circle
                  cx="220"
                  cy="220"
                  r="190"
                  stroke="#a6c9ff22"
                  strokeDasharray="2 12"
                />
                <circle
                  cx="220"
                  cy="220"
                  r="174"
                  stroke="#a6c9ff25"
                  strokeDasharray="100 32 8 32"
                />
                <path
                  d="M220 24v14M220 402v14M24 220h14M402 220h14"
                  stroke="#c3d9fa88"
                />
              </g>
            </svg>
            <div className={`${s.tier} ${s.top}`} data-tier>
              <div className={s.plate}>
                <div className={s.coreBrand}>
                  <LogoMark className={s.mark} />
                  <strong>Mutuals</strong>
                  <span>Your relationship database</span>
                </div>
                <svg
                  className={s.engraving}
                  viewBox="0 0 300 220"
                  aria-hidden="true"
                >
                  <g fill="none" stroke="#c7dcff33">
                    <path d="M0 110h60l35-55h110l35 55h60M0 140h80l30 40h80l30-40h80M95 55V0m110 55V0M110 180v40m80-40v40" />
                    <circle cx="60" cy="110" r="3" />
                    <circle cx="240" cy="110" r="3" />
                  </g>
                </svg>
              </div>
            </div>
            <div className={`${s.tier} ${s.middle}`} data-tier>
              <div className={s.plate}>
                <svg
                  className={s.graph}
                  viewBox="0 0 300 220"
                  fill="none"
                  aria-hidden="true"
                >
                  {Array.from({ length: 22 }, (_, i) => {
                    const x = 30 + ((i * 73) % 240);
                    const y = 25 + ((i * 47) % 170);
                    return (
                      <g key={i}>
                        <path
                          d={`M150 110L${x} ${y}L${30 + (((i + 1) * 73) % 240)} ${25 + (((i + 1) * 47) % 170)}`}
                          stroke="#9cafee"
                          strokeOpacity=".45"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={i % 3 === 0 ? 3 : 1.5}
                          fill="#cedaff"
                        />
                      </g>
                    );
                  })}
                  <circle cx="150" cy="110" r="9" fill="#d3e5ff" />
                  <circle cx="150" cy="110" r="19" stroke="#d3e5ff55" />
                </svg>
              </div>
            </div>
            <div className={`${s.tier} ${s.bottom}`} data-tier>
              <div className={s.plate}>
                <div className={s.records}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i}>
                      <span />
                      <i />
                      <i />
                      <b />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={s.agents} data-reveal>
            <h3>Agents that know your people</h3>
            <div className={s.agentGrid}>
              {clients.map(([slug, name]) => (
                <a href="#agents" key={slug}>
                  <AgentLogo agent={slug} />
                  <span>{name}</span>
                </a>
              ))}
            </div>
            <div className={s.exchange}>
              <span>
                Retrieve context <b>↗</b>
              </span>
              <span>
                Add what you learn <b>↙</b>
              </span>
            </div>
          </div>
        </div>
        <div className={s.explanation} data-reveal>
          <div>
            <h3>Enrich the person.</h3>
            <p>
              Match new details to the right profile. Add roles, interests and
              shared history without losing what you already know.
            </p>
          </div>
          <div>
            <h3>Keep the evidence.</h3>
            <p>
              Every fact has a source. Mutuals preserves changes and flags
              conflicting details for review.
            </p>
          </div>
          <div>
            <h3>Give every agent the context.</h3>
            <p>
              Retrieve a person before a meeting. Save what you learned
              afterwards. Both work with the same underlying record.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
