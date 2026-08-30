/**
 * Storage abstraction for the waitlist. Uses Neon Postgres when DATABASE_URL
 * is set; otherwise falls back to an append-only JSONL file so the site
 * works end-to-end with zero keys configured (see docs/design-decisions.md
 * "Waitlist" -> graceful degradation).
 */
import { neon } from "@neondatabase/serverless";
import { mkdir, readFile, writeFile, appendFile } from "fs/promises";
import path from "path";
import { effectivePosition } from "./waitlist";

export interface WaitlistEntry {
  email?: string | null;
  phone?: string | null;
  raw_input: string;
  source?: string | null;
  referrer?: string | null;
  utm?: Record<string, string> | null;
  referral_code: string;
  referred_by?: string | null;
}

export interface UpsertResult {
  position: number;
  referralCode: string;
  duplicate: boolean;
}

export interface WaitlistStore {
  upsert(entry: WaitlistEntry): Promise<UpsertResult>;
  findByCode(code: string): Promise<{ id: number } | null>;
  bumpReferral(code: string): Promise<void>;
}

/** Neon Postgres-backed store (see db/schema.sql). */
export class NeonStore implements WaitlistStore {
  private sql: ReturnType<typeof neon>;

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl);
  }

  async upsert(entry: WaitlistEntry): Promise<UpsertResult> {
    const sql = this.sql;
    const utmJson = entry.utm ? JSON.stringify(entry.utm) : null;

    type Row = { position: number; referral_code: string; referrals: number };
    let inserted: Row[];

    if (entry.email) {
      inserted = (await sql`
        insert into waitlist (email, phone, raw_input, source, referrer, utm, referral_code, referred_by)
        values (${entry.email}, ${entry.phone ?? null}, ${entry.raw_input}, ${entry.source ?? null}, ${entry.referrer ?? null}, ${utmJson}, ${entry.referral_code}, ${entry.referred_by ?? null})
        on conflict (lower(email)) where email is not null do nothing
        returning position, referral_code, referrals
      `) as Row[];
    } else if (entry.phone) {
      inserted = (await sql`
        insert into waitlist (email, phone, raw_input, source, referrer, utm, referral_code, referred_by)
        values (${entry.email ?? null}, ${entry.phone}, ${entry.raw_input}, ${entry.source ?? null}, ${entry.referrer ?? null}, ${utmJson}, ${entry.referral_code}, ${entry.referred_by ?? null})
        on conflict (phone) where phone is not null do nothing
        returning position, referral_code, referrals
      `) as Row[];
    } else {
      throw new Error("WaitlistEntry requires email or phone");
    }

    if (inserted.length > 0) {
      const row = inserted[0];
      return {
        position: effectivePosition(row.position, row.referrals),
        referralCode: row.referral_code,
        duplicate: false,
      };
    }

    const existing = (entry.email
      ? await sql`select position, referral_code, referrals from waitlist where lower(email) = lower(${entry.email}) limit 1`
      : await sql`select position, referral_code, referrals from waitlist where phone = ${entry.phone} limit 1`) as Row[];

    const row = existing[0];
    return {
      position: effectivePosition(row.position, row.referrals),
      referralCode: row.referral_code,
      duplicate: true,
    };
  }

  async findByCode(code: string): Promise<{ id: number } | null> {
    const rows = (await this.sql`select id from waitlist where referral_code = ${code} limit 1`) as {
      id: number;
    }[];
    return rows[0] ? { id: rows[0].id } : null;
  }

  async bumpReferral(code: string): Promise<void> {
    await this.sql`update waitlist set referrals = referrals + 1 where referral_code = ${code}`;
  }
}

interface FileRecord {
  id: number;
  position: number;
  email: string | null;
  phone: string | null;
  raw_input: string;
  source: string | null;
  referrer: string | null;
  utm: Record<string, string> | null;
  referral_code: string;
  referred_by: string | null;
  referrals: number;
  created_at: string;
}

/** Dev fallback store: append-only JSONL at data/waitlist.jsonl. */
export class FileStore implements WaitlistStore {
  private filePath: string;

  constructor(filePath = path.join(process.cwd(), "data", "waitlist.jsonl")) {
    this.filePath = filePath;
  }

  private async readAll(): Promise<FileRecord[]> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return raw
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line) as FileRecord);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
  }

  private async ensureDir(): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
  }

  private async rewriteAll(records: FileRecord[]): Promise<void> {
    await this.ensureDir();
    const body = records.map((r) => JSON.stringify(r)).join("\n") + (records.length ? "\n" : "");
    await writeFile(this.filePath, body, "utf8");
  }

  async upsert(entry: WaitlistEntry): Promise<UpsertResult> {
    const records = await this.readAll();

    const existing = entry.email
      ? records.find((r) => r.email && r.email.toLowerCase() === entry.email!.toLowerCase())
      : records.find((r) => r.phone === entry.phone);

    if (existing) {
      return {
        position: effectivePosition(existing.position, existing.referrals),
        referralCode: existing.referral_code,
        duplicate: true,
      };
    }

    await this.ensureDir();
    const record: FileRecord = {
      id: records.length + 1,
      position: records.length + 1,
      email: entry.email ?? null,
      phone: entry.phone ?? null,
      raw_input: entry.raw_input,
      source: entry.source ?? null,
      referrer: entry.referrer ?? null,
      utm: entry.utm ?? null,
      referral_code: entry.referral_code,
      referred_by: entry.referred_by ?? null,
      referrals: 0,
      created_at: new Date().toISOString(),
    };
    await appendFile(this.filePath, JSON.stringify(record) + "\n", "utf8");

    return {
      position: effectivePosition(record.position, record.referrals),
      referralCode: record.referral_code,
      duplicate: false,
    };
  }

  async findByCode(code: string): Promise<{ id: number } | null> {
    const records = await this.readAll();
    const found = records.find((r) => r.referral_code === code);
    return found ? { id: found.id } : null;
  }

  async bumpReferral(code: string): Promise<void> {
    const records = await this.readAll();
    const idx = records.findIndex((r) => r.referral_code === code);
    if (idx === -1) return;
    records[idx] = { ...records[idx], referrals: records[idx].referrals + 1 };
    await this.rewriteAll(records);
  }
}

let store: WaitlistStore | undefined;
let loggedFallback = false;

/** Returns the process-wide store instance, picking the backend by env presence. */
export function getStore(): WaitlistStore {
  if (store) return store;

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    store = new NeonStore(databaseUrl);
  } else {
    if (!loggedFallback) {
      console.log("[waitlist] DATABASE_URL missing — using data/waitlist.jsonl");
      loggedFallback = true;
    }
    store = new FileStore();
  }
  return store;
}
