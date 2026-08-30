"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import { copy } from "@/lib/copy";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

declare global {
  interface Window {
    plausible?: (event: string, options?: object) => void;
  }
}

type WaitlistSuccess = { ok: true; position: number; referralCode: string; duplicate?: boolean };
type WaitlistFailure = { ok: false; error: string };
type WaitlistResponse = WaitlistSuccess | WaitlistFailure;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function looksLikePhone(value: string): boolean {
  const cleaned = value.replace(/[\s()-]/g, "");
  if (!/^\+?\d+$/.test(cleaned)) return false;
  return cleaned.replace(/\D/g, "").length >= 7;
}

function validate(value: string): string | null {
  if (!value) return "Enter your email or WhatsApp number.";
  if (EMAIL_RE.test(value) || looksLikePhone(value)) return null;
  return "That doesn't look like an email or phone number.";
}

export function WaitlistForm({
  id,
  compact,
  inverted,
}: {
  id?: string;
  compact?: boolean;
  /** Use on dark/ink backgrounds: paper-toned borders, text, and a paper button. */
  inverted?: boolean;
}) {
  const [value, setValue] = useState("");
  const [company, setCompany] = useState("");
  const [refCode, setRefCode] = useState("");
  const [utm, setUtm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<WaitlistSuccess | null>(null);
  const [copied, setCopied] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const reactId = useId();
  const turnstileCallback = `mutualsTurnstileCb${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Magnetic hover: on fine-pointer desktop, nudge the submit button up to 6px
  // toward the cursor within a 40px radius. No-op on touch or reduced motion.
  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn || prefersReducedMotion()) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;

    const RADIUS = 40;
    const MAX_OFFSET = 6;
    const scale = MAX_OFFSET / RADIUS;
    const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });

    function onMove(e: PointerEvent) {
      const rect = btn!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const reach = RADIUS + Math.max(rect.width, rect.height) / 2;
      if (Math.hypot(dx, dy) < reach) {
        xTo(dx * scale);
        yTo(dy * scale);
      } else {
        xTo(0);
        yTo(0);
      }
    }
    function reset() {
      xTo(0);
      yTo(0);
    }

    window.addEventListener("pointermove", onMove);
    btn.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      btn.removeEventListener("pointerleave", reset);
    };
  }, []);

  useEffect(() => {
    // Reading location.search has to wait until after mount: there's no
    // `window` during SSR, and reading it during render would make the hidden
    // ref/utm inputs mismatch between server and client markup. This is the
    // "synchronize with an external system" (the browser's URL) case an
    // effect exists for, not a derived-state anti-pattern.
    /* eslint-disable react-hooks/set-state-in-effect */
    const params = new URLSearchParams(window.location.search);
    const r = params.get("r") ?? "";
    setRefCode(r);
    const collected: Record<string, string> = {};
    params.forEach((v, k) => {
      if (k.startsWith("utm_")) collected[k] = v;
    });
    setUtm(collected);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!siteKey) return;
    (window as unknown as Record<string, (token: string) => void>)[turnstileCallback] = (token: string) => {
      setTurnstileToken(token);
    };
  }, [siteKey, turnstileCallback]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setPending(true);
    window.plausible?.("waitlist_submit");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: trimmed,
          company,
          ref: refCode || undefined,
          utm,
          source: compact ? "footer" : "hero",
          ...(siteKey ? { turnstile: turnstileToken } : {}),
        }),
      });
      const data: WaitlistResponse = await res.json();
      if (data.ok) {
        setResult(data);
        window.plausible?.("waitlist_success");
      } else {
        setError(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleCopy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.plausible?.("share_link_copied");
    } catch {
      // clipboard API unavailable; silently ignore
    }
  }

  return (
    <div id={id} aria-live="polite" className="w-full">
      {siteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
          <div
            className="cf-turnstile"
            data-sitekey={siteKey}
            data-size="invisible"
            data-callback={turnstileCallback}
          />
        </>
      ) : null}

      {!result ? (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <label htmlFor={`${id ?? "waitlist"}-input`} className="sr-only">
                Email or WhatsApp number
              </label>
              <input
                id={`${id ?? "waitlist"}-input`}
                name="input"
                type="text"
                inputMode="email"
                autoComplete="email"
                placeholder={copy.hero.placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id ?? "waitlist"}-error` : undefined}
                className={
                  inverted
                    ? "h-[52px] w-full rounded-md border border-paper/35 bg-transparent px-4 text-[16px] text-paper placeholder:text-paper/50"
                    : "h-[52px] w-full rounded-md border border-ink-faint bg-transparent px-4 text-[16px] text-ink placeholder:text-ink-faint"
                }
              />
              {/* honeypot — never shown to real users */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <input type="hidden" name="ref" value={refCode} />
              <input type="hidden" name="utm" value={JSON.stringify(utm)} />
            </div>
            <button
              ref={buttonRef}
              type="submit"
              disabled={pending}
              className={
                inverted
                  ? "group flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-md bg-paper px-6 text-[16px] font-medium text-ink transition-colors hover:bg-paper-2 disabled:opacity-70"
                  : "group flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-md bg-signal px-6 text-[16px] font-medium text-paper transition-colors hover:[background:color-mix(in_oklab,var(--signal),black_8%)] disabled:opacity-70"
              }
            >
              {pending ? "Joining…" : copy.hero.button}
              <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-[3px]">
                →
              </span>
            </button>
          </div>
          {error ? (
            <p
              id={`${id ?? "waitlist"}-error`}
              role="alert"
              className={inverted ? "font-mono text-[13px] text-signal-2" : "font-mono text-[13px] text-ink"}
            >
              {error}
            </p>
          ) : null}
        </form>
      ) : (
        <div className={inverted ? "font-mono text-[14px] text-paper" : "font-mono text-[14px] text-ink"}>
          <p>
            ✓ You&apos;re on the list · #{String(result.position).padStart(4, "0")}
          </p>
          <p className={inverted ? "mt-2 text-[13px] text-paper/60" : "mt-2 text-[13px] text-ink-faint"}>
            Move up the list: each friend who joins moves you up 10 spots.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-[13px]">{`${typeof window !== "undefined" ? window.location.host : "getmutuals.ai"}/?r=${result.referralCode}`}</span>
            <button
              type="button"
              onClick={() => handleCopy(`${window.location.origin}/?r=${result.referralCode}`)}
              className={
                inverted
                  ? "rounded-md border border-paper/35 px-3 py-1 text-[13px] text-paper transition-colors hover:border-paper"
                  : "rounded-md border border-ink-faint px-3 py-1 text-[13px] text-ink transition-colors hover:border-ink"
              }
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
