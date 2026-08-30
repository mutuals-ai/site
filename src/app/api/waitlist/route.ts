export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { parseInput, makeReferralCode } from "@/lib/waitlist";
import { getStore } from "@/lib/store";
import { sendConfirmation } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { allow } from "@/lib/ratelimit";

interface WaitlistBody {
  input?: string;
  company?: string;
  ref?: string;
  utm?: Record<string, string>;
  source?: string;
  turnstile?: string;
}

function clientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "local";
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    if (!allow(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Try again in an hour." },
        { status: 429 },
      );
    }

    let body: WaitlistBody;
    try {
      body = (await request.json()) as WaitlistBody;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Enter a valid email or phone number." },
        { status: 400 },
      );
    }

    // Honeypot: bots that fill this field get a fake success, never a tell.
    if (body.company && body.company.trim().length > 0) {
      return NextResponse.json({
        ok: true,
        position: 100 + Math.floor(Math.random() * 400),
        referralCode: makeReferralCode(),
        duplicate: false,
      });
    }

    const parsed = parseInput(body.input ?? "");
    if (!parsed) {
      return NextResponse.json(
        { ok: false, error: "Enter a valid email or phone number." },
        { status: 400 },
      );
    }

    const turnstileOk = await verifyTurnstile(body.turnstile, ip);
    if (!turnstileOk) {
      return NextResponse.json({ ok: false, error: "Verification failed. Try again." }, { status: 403 });
    }

    const store = getStore();
    const referralCode = makeReferralCode();
    const result = await store.upsert({
      email: parsed.kind === "email" ? parsed.email : null,
      phone: parsed.kind === "phone" ? parsed.phone : null,
      raw_input: body.input ?? "",
      source: body.source ?? null,
      referrer: request.headers.get("referer"),
      utm: body.utm ?? null,
      referral_code: referralCode,
      referred_by: body.ref ?? null,
    });

    if (!result.duplicate && body.ref) {
      const referrer = await store.findByCode(body.ref);
      if (referrer) {
        await store.bumpReferral(body.ref);
      }
    }

    if (!result.duplicate && parsed.kind === "email") {
      await sendConfirmation({
        to: parsed.email,
        position: result.position,
        referralCode: result.referralCode,
      });
    }

    return NextResponse.json({
      ok: true,
      position: result.position,
      referralCode: result.referralCode,
      duplicate: result.duplicate,
    });
  } catch (err) {
    console.error("[waitlist] unexpected error", err);
    return NextResponse.json({ ok: false, error: "Something went wrong. Try again." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}
