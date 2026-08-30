/**
 * Pure helpers for the waitlist: input parsing, referral codes, position math.
 * No I/O here — see src/lib/store.ts for persistence.
 */
import { randomBytes } from "crypto";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ParsedInput = { kind: "email"; email: string } | { kind: "phone"; phone: string };

/**
 * Detect whether raw input is an email or a phone number, and normalize.
 * Phone numbers are parsed with a default region of AT (Austria) and must
 * be valid per libphonenumber-js; the result is E.164 formatted.
 */
export function parseInput(raw: string): ParsedInput | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (EMAIL_RE.test(trimmed)) {
    return { kind: "email", email: trimmed.toLowerCase() };
  }

  const phone = parsePhoneNumberFromString(trimmed, "AT");
  if (phone && phone.isValid()) {
    return { kind: "phone", phone: phone.number };
  }

  return null;
}

// Crockford-ish base32 alphabet, no ambiguous characters (0/O, 1/I/L excluded).
const BASE32_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

/** An 8-character, human-friendly referral code. */
export function makeReferralCode(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += BASE32_ALPHABET[bytes[i] % BASE32_ALPHABET.length];
  }
  return out;
}

/** Position after referral bonuses: 10 spots per referral, floor of 1. */
export function effectivePosition(position: number, referrals: number): number {
  return Math.max(1, position - 10 * referrals);
}

/** Zero-padded 4-digit position, e.g. 421 -> "0421". */
export function formatPosition(n: number): string {
  return String(n).padStart(4, "0");
}
