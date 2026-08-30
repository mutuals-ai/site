create table if not exists waitlist (
  id            bigserial primary key,
  position      serial,
  email         text,
  phone         text,
  raw_input     text not null,
  source        text,
  referrer      text,
  utm           jsonb,
  referral_code text unique not null,
  referred_by   text,
  referrals     int not null default 0,
  created_at    timestamptz not null default now(),
  confirmed_at  timestamptz
);
create unique index if not exists waitlist_email_idx on waitlist (lower(email)) where email is not null;
create unique index if not exists waitlist_phone_idx on waitlist (phone) where phone is not null;
