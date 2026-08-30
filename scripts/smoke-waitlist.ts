/**
 * One-off smoke test for waitlist helpers + FileStore, run without a dev
 * server: `pnpm exec tsx scripts/smoke-waitlist.ts`. Deletes its test data
 * file when done.
 */
import { parseInput, makeReferralCode, effectivePosition, formatPosition } from "../src/lib/waitlist";
import { FileStore } from "../src/lib/store";
import { existsSync, unlinkSync } from "fs";
import path from "path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`ok: ${message}`);
  }
}

async function main() {
  console.log("--- parseInput ---");

  const email = parseInput("foo@bar.com");
  console.log("foo@bar.com ->", email);
  assert(email?.kind === "email" && email.email === "foo@bar.com", "email parses as email");

  const phone1 = parseInput("+43 660 1234567");
  console.log("+43 660 1234567 ->", phone1);
  assert(phone1?.kind === "phone" && phone1.phone.startsWith("+43"), "intl phone parses as E.164 phone");

  const phone2 = parseInput("0660 1234567");
  console.log("0660 1234567 ->", phone2);
  assert(phone2?.kind === "phone" && phone2.phone.startsWith("+43"), "national AT phone parses as E.164 phone");

  const nonsense = parseInput("nonsense");
  console.log("nonsense ->", nonsense);
  assert(nonsense === null, "nonsense input is rejected");

  console.log("\n--- makeReferralCode / effectivePosition / formatPosition ---");
  const code = makeReferralCode();
  console.log("referral code ->", code);
  assert(/^[A-Z0-9]{8}$/.test(code), "referral code is 8 chars");

  assert(effectivePosition(100, 0) === 100, "effectivePosition with 0 referrals is unchanged");
  assert(effectivePosition(100, 3) === 70, "effectivePosition applies 10x referrals");
  assert(effectivePosition(5, 10) === 1, "effectivePosition floors at 1");

  assert(formatPosition(421) === "0421", "formatPosition zero-pads to 4 digits");
  assert(formatPosition(12345) === "12345", "formatPosition does not truncate larger numbers");

  console.log("\n--- FileStore ---");
  const testFile = path.join(process.cwd(), "data", "smoke-test-waitlist.jsonl");
  if (existsSync(testFile)) unlinkSync(testFile);
  const store = new FileStore(testFile);

  const first = await store.upsert({
    email: "dup@example.com",
    phone: null,
    raw_input: "dup@example.com",
    referral_code: makeReferralCode(),
  });
  console.log("first upsert ->", first);
  assert(first.duplicate === false, "first upsert is not a duplicate");

  const second = await store.upsert({
    email: "dup@example.com",
    phone: null,
    raw_input: "DUP@example.com",
    referral_code: makeReferralCode(),
  });
  console.log("second upsert (same email) ->", second);
  assert(second.duplicate === true, "second upsert with same email is a duplicate");
  assert(second.position === first.position, "duplicate upsert returns the same position");
  assert(second.referralCode === first.referralCode, "duplicate upsert returns the original referral code");

  if (existsSync(testFile)) unlinkSync(testFile);
  console.log("\ncleaned up", testFile);

  if (process.exitCode === 1) {
    console.error("\nSMOKE TEST FAILED");
    process.exit(1);
  } else {
    console.log("\nSMOKE TEST PASSED");
  }
}

main();
