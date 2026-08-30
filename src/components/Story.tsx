"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { copy } from "@/lib/copy";
import { waveform } from "@/lib/waveform";
import { StoryGraph, type Stage, type StoryGraphHandle } from "./StoryGraph";

type Step = (typeof copy.steps)[number];

/** Renders a step's body, italicizing the embedded query phrase (step 03) if present. */
function renderBody(step: Step): ReactNode {
  const em = "em" in step ? step.em : undefined;
  if (!em) return step.body;
  const idx = step.body.indexOf(em);
  if (idx === -1) return step.body;
  return (
    <>
      {step.body.slice(0, idx)}
      <em>{em}</em>
      {step.body.slice(idx + em.length)}
    </>
  );
}

const VOICE_BARS = waveform.slice(0, 24);
const PLAYED_FRACTION = 0.4;

/** Bottom-right timestamp + (for outgoing bubbles) WhatsApp-style double blue ticks. */
function MetaRow({ time, outgoing }: { time: string; outgoing?: boolean }) {
  return (
    <span className="mt-1 flex items-center justify-end gap-1 font-mono text-[11px] text-[#8696A0]">
      {time}
      {outgoing ? <span className="text-[#53BDEB]">✓✓</span> : null}
    </span>
  );
}

function MicGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="4.5" y="1" width="3" height="6" rx="1.5" stroke="#8696A0" strokeWidth="0.8" />
      <path d="M2.5 6.5a3.5 3.5 0 0 0 7 0" stroke="#8696A0" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M6 10v1.2" stroke="#8696A0" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" className="shrink-0 text-[#E9EDEF]" aria-hidden="true">
      <path d="M1 0.5 L9 5 L1 9.5 Z" fill="currentColor" />
    </svg>
  );
}

function VoiceBars() {
  const playedCount = Math.round(VOICE_BARS.length * PLAYED_FRACTION);
  return (
    <div className="flex h-[16px] items-end gap-[2px]" aria-hidden="true">
      {VOICE_BARS.map((h, i) => (
        <span
          key={i}
          className={`w-[2px] shrink-0 rounded-full ${i < playedCount ? "bg-[#53BDEB]" : "bg-[#E9EDEF]/70"}`}
          style={{ height: `${Math.max(2, h * 16)}px` }}
        />
      ))}
    </div>
  );
}

function VoiceMessage() {
  return (
    <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#005C4B] px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.12)]">
          <MicGlyph />
        </span>
        <PlayGlyph />
        <VoiceBars />
        <span className="font-mono text-[11px] text-[#E9EDEF]/80">0:07</span>
      </div>
      <MetaRow time="21:14" outgoing />
    </div>
  );
}

function ReceiptMessage() {
  const [first, ...rest] = copy.story.receipt;
  return (
    <div className="mr-auto max-w-[85%] rounded-lg rounded-tl-none bg-[#202C33] px-3 py-2 font-mono text-[13px]">
      <p className="text-[#E9EDEF]">
        <span className="text-signal">✓</span>
        {first.replace("✓", "")}
      </p>
      {rest.map((line) => (
        <p key={line} className="text-[#8696A0]">
          {line}
        </p>
      ))}
      <MetaRow time="21:14" />
    </div>
  );
}

function QuestionMessage() {
  return (
    <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#005C4B] px-3 py-2 text-[14px] text-[#E9EDEF]">
      {copy.story.question}
      <MetaRow time="21:16" outgoing />
    </div>
  );
}

function AnswerMessage() {
  return (
    <div className="mr-auto max-w-[90%] rounded-lg rounded-tl-none bg-[#202C33] px-3 py-2 font-mono text-[13px]">
      {copy.story.answer.map((item, i) => (
        <div key={item.who} className={i > 0 ? "mt-2 border-t border-[rgba(255,255,255,0.08)] pt-2" : ""}>
          <p className="font-medium text-[#E9EDEF]">{item.who}</p>
          <p className="text-[#8696A0]">{item.why}</p>
        </div>
      ))}
      <MetaRow time="21:16" />
    </div>
  );
}

function DigestMessage() {
  return (
    <div className="mr-auto max-w-[92%] rounded-lg rounded-tl-none bg-[#202C33] px-3 py-2 font-mono text-[12.5px] text-[#E9EDEF]">
      <p className="text-[#8696A0]">{copy.digest.header}</p>
      <ul className="mt-2 space-y-2">
        {copy.digest.items.map((item) => (
          <li key={item.n} className="flex gap-2">
            <span className="text-[#8696A0]">{item.n}</span>
            <span>
              <span className="font-medium">{item.who}</span> · {item.why}
            </span>
          </li>
        ))}
      </ul>
      <MetaRow time="08:30" />
    </div>
  );
}

/** iOS-style status bar glyphs: signal bars, wifi, battery. */
function StatusGlyphs() {
  return (
    <svg width="46" height="11" viewBox="0 0 46 11" fill="none" className="text-ink/70" aria-hidden="true">
      <rect x="0" y="6" width="2.4" height="5" rx="0.5" fill="currentColor" />
      <rect x="3.6" y="4.2" width="2.4" height="6.8" rx="0.5" fill="currentColor" />
      <rect x="7.2" y="2.4" width="2.4" height="8.6" rx="0.5" fill="currentColor" />
      <rect x="10.8" y="0.5" width="2.4" height="10.5" rx="0.5" fill="currentColor" />
      <path
        d="M18 9c2.4-2.6 6.6-2.6 9 0M20 6.4c1.5-1.4 3.5-1.4 5 0M22 3.8c0.7-0.7 1.5-0.7 2 0"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="32" y="1.5" width="12" height="7.5" rx="1.6" stroke="currentColor" strokeWidth="1" />
      <rect x="33.2" y="2.7" width="8.4" height="5.1" rx="0.8" fill="currentColor" />
      <rect x="44.3" y="3.7" width="1.2" height="3.1" rx="0.5" fill="currentColor" />
    </svg>
  );
}

/** Status bar: time left, iOS glyphs right. Sits above the WhatsApp chrome. */
function StatusBar() {
  return (
    <div className="flex shrink-0 items-center justify-between px-6 pb-1 pt-3">
      <span className="font-mono text-[11px] text-ink/70">09:41</span>
      <StatusGlyphs />
    </div>
  );
}

function HeaderIconGlyph({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d={path} stroke="#AEBAC1" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** WhatsApp-dark chat header: back chevron, avatar, name + "online", call/menu glyphs. */
function WhatsAppHeader() {
  return (
    <div className="flex shrink-0 items-center gap-3 bg-[#1F2C34] px-3 py-2.5">
      <span className="font-display text-[22px] leading-none text-[#AEBAC1]" aria-hidden="true">
        ‹
      </span>
      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-signal font-display text-[15px] text-paper">
        M
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] text-[#E9EDEF]">Mutuals</p>
        <p className="text-[12px] text-[#8696A0]">online</p>
      </div>
      <div className="flex shrink-0 items-center gap-4 pr-1">
        <HeaderIconGlyph path="M2 6.5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-5ZM12 8l4-2.5v7L12 10" />
        <HeaderIconGlyph path="M3 4c0-.6.4-1 1-1h2.2c.5 0 .9.3 1 .8l.6 2.4c.1.4 0 .8-.3 1.1l-1 1a10 10 0 0 0 4.2 4.2l1-1c.3-.3.7-.4 1.1-.3l2.4.6c.5.1.8.5.8 1V15c0 .6-.4 1-1 1h-1C7.8 16 2 10.2 2 3.9V4Z" />
        <HeaderIconGlyph path="M3 4.5h12M3 9h12M3 13.5h12" />
      </div>
    </div>
  );
}

const DOT_WALLPAPER = {
  backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
};

/** Bottom composer bar: message pill + mic button. Purely decorative, non-functional. */
function Composer() {
  return (
    <div className="flex shrink-0 items-center gap-2 bg-[#1F2C34] px-3 py-2.5">
      <div className="flex flex-1 items-center gap-2 rounded-full bg-[#2A3942] px-3 py-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="8" cy="8" r="6.2" stroke="#8696A0" strokeWidth="1.1" />
          <circle cx="5.7" cy="6.4" r="0.9" fill="#8696A0" />
          <circle cx="10.3" cy="6.4" r="0.9" fill="#8696A0" />
          <path d="M5.2 9.6c.8 1 1.8 1.5 2.8 1.5s2-.5 2.8-1.5" stroke="#8696A0" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
        <span className="flex-1 font-sans text-[13px] text-[#8696A0]">Message</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
          <path
            d="M8 2.2c-3.7 1.4-5.8 5-5.8 5.8 0 3.7 2.6 6 5.8 6s5.8-2.3 5.8-6c0-.8-2.1-4.4-5.8-5.8Z"
            stroke="#8696A0"
            strokeWidth="1.1"
          />
          <path d="M8 1v2.2M5 9.2 8 6l3 3.2" stroke="#8696A0" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00A884]">
        <MicGlyph />
      </span>
    </div>
  );
}

const MESSAGE_NODES = [
  <VoiceMessage key="a" />,
  <ReceiptMessage key="b" />,
  <QuestionMessage key="c" />,
  <AnswerMessage key="d" />,
  <DigestMessage key="e" />,
] as const;

export function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const headingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const bodyRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const dMsgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<StoryGraphHandle>(null);

  const mMsgRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const stage = stageRef.current;
        const headings = headingRefs.current;
        const bodies = bodyRefs.current;
        const messages = dMsgRefs.current;
        const inner = innerRef.current;
        const list = listRef.current;
        if (!stage || !inner || !list || messages.some((m) => !m) || headings.some((h) => !h) || bodies.some((b) => !b)) {
          return;
        }

        gsap.set(headings[0], { opacity: 1 });
        gsap.set([headings[1], headings[2]], { opacity: 0.28 });
        gsap.set(bodies[0], { opacity: 1 });
        gsap.set([bodies[1], bodies[2]], { opacity: 0 });
        gsap.set(messages, { opacity: 0, y: 14 });
        gsap.set(list, { y: 0 });

        let overflow = 0;
        const measure = () => {
          overflow = Math.max(0, list.scrollHeight - inner.clientHeight);
        };
        measure();
        const ro = new ResizeObserver(() => {
          measure();
          ScrollTrigger.refresh();
        });
        ro.observe(list);
        ro.observe(inner);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            pin: stage,
            start: "top top",
            end: "+=200%",
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Drives the background people-graph: stage 0 (nothing lit) through
        // stage 3 (digest names lit), derived straight from timeline progress
        // so it stays correct scrubbing in either direction.
        tl.eventCallback("onUpdate", () => {
          const p = tl.progress();
          const next: Stage = p >= 0.75 ? 3 : p >= 0.52 ? 2 : p >= 0.2 ? 1 : 0;
          graphRef.current?.setStage(next);
        });

        // heading 1 → 2 crossfade, active right at 0.33
        tl.to(headings[0], { opacity: 0.28, duration: 0.06 }, 0.33);
        tl.to(headings[1], { opacity: 1, duration: 0.06 }, 0.33);
        tl.to(bodies[0], { opacity: 0, duration: 0.06 }, 0.33);
        tl.to(bodies[1], { opacity: 1, duration: 0.06 }, 0.33);

        // heading 2 → 3 crossfade, active right at 0.66
        tl.to(headings[1], { opacity: 0.28, duration: 0.06 }, 0.66);
        tl.to(headings[2], { opacity: 1, duration: 0.06 }, 0.66);
        tl.to(bodies[1], { opacity: 0, duration: 0.06 }, 0.66);
        tl.to(bodies[2], { opacity: 1, duration: 0.06 }, 0.66);

        // chat messages, in scroll order. The timeline's total duration is the
        // furthest point any tween reaches (here, 0.75 + 0.25 = 1 for message
        // "e", tying for the list-translate tween below), since scrub maps
        // scroll progress 0..1 directly to timeline time 0..totalDuration,
        // keeping every position + duration pair at or under 1 here is what
        // makes these numbers read as literal scroll-progress fractions.
        const points = [0.05, 0.2, 0.4, 0.52, 0.75];
        messages.forEach((m, i) => {
          tl.to(m, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, points[i]);
        });

        // keep newest message in view once the list overflows the phone body
        tl.to(list, { y: () => -overflow, duration: 0.5, ease: "none" }, 0.5);

        return () => {
          ro.disconnect();
        };
      });

      mm.add("(max-width: 1023.98px)", () => {
        const messages = mMsgRefs.current.filter((m): m is HTMLDivElement => m !== null);
        if (messages.length === 0) return;

        gsap.set(messages, { opacity: 0, y: 14 });
        const triggers = messages.map((m) =>
          gsap.to(m, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: { trigger: m, start: "top 85%", once: true },
          }),
        );

        return () => {
          triggers.forEach((t) => t.scrollTrigger?.kill());
        };
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how" ref={sectionRef} className="relative pt-[120px] lg:pt-[200px]">
      <p className="font-mono text-[13px] uppercase tracking-[0.04em] text-ink-soft">§ 01 · How it works</p>

      {/* Desktop: pinned stage, faint people-graph behind, crossfading headings, scrubbed chat */}
      <div ref={stageRef} className="relative hidden h-screen grid-cols-2 items-center gap-16 lg:motion-safe:grid">
        <StoryGraph ref={graphRef} variant="desktop" />

        <div className="relative z-10">
          <div className="flex flex-col gap-4">
            {copy.steps.map((step, i) => (
              <h3
                key={step.n}
                ref={(el) => {
                  headingRefs.current[i] = el;
                }}
                className="font-display text-[clamp(40px,5.5vw,80px)] leading-[0.95] text-ink"
                style={{ opacity: i === 0 ? 1 : 0.28 }}
              >
                {step.title}
              </h3>
            ))}
          </div>
          <div className="mt-8 grid max-w-[440px]">
            {copy.steps.map((step, i) => (
              <p
                key={step.n}
                ref={(el) => {
                  bodyRefs.current[i] = el;
                }}
                className="col-start-1 row-start-1 text-[17px] text-ink-soft"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                {renderBody(step)}
              </p>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto flex flex-col items-center">
          <div aria-hidden="true" className="flex h-[720px] w-[380px] flex-col overflow-hidden rounded-[40px] border border-paper-2 bg-[#0B141A]">
            <StatusBar />
            <WhatsAppHeader />
            <div ref={innerRef} className="relative flex-1 overflow-hidden" style={DOT_WALLPAPER}>
              <div ref={listRef} className="absolute inset-x-0 top-0 flex flex-col gap-[10px] p-4">
                {MESSAGE_NODES.map((node, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      dMsgRefs.current[i] = el;
                    }}
                  >
                    {node}
                  </div>
                ))}
              </div>
            </div>
            <Composer />
          </div>
          <p className="mt-4 font-mono text-[12px] text-ink-faint">Works in WhatsApp and Telegram. No app to install.</p>
        </div>
      </div>

      {/* Mobile / reduced motion: plain stacked headings + bodies, then phone */}
      <div className="block lg:motion-safe:hidden">
        <div className="relative">
          <StoryGraph variant="mobile" />
          <div className="relative z-10 flex flex-col gap-10">
            {copy.steps.map((step) => (
              <div key={step.n}>
                <h3 className="font-display text-[clamp(32px,9vw,48px)] leading-[0.95] text-ink">{step.title}</h3>
                <p className="mt-3 max-w-[520px] text-[17px] text-ink-soft">{renderBody(step)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 flex w-full max-w-[380px] flex-col items-center">
          <div aria-hidden="true" className="flex w-full flex-col overflow-hidden rounded-[40px] border border-paper-2 bg-[#0B141A]">
            <StatusBar />
            <WhatsAppHeader />
            <div className="flex flex-col gap-[10px] p-4" style={DOT_WALLPAPER}>
              {MESSAGE_NODES.map((node, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    mMsgRefs.current[i] = el;
                  }}
                >
                  {node}
                </div>
              ))}
            </div>
            <Composer />
          </div>
          <p className="mt-4 font-mono text-[12px] text-ink-faint">Works in WhatsApp and Telegram. No app to install.</p>
        </div>
      </div>
    </section>
  );
}
