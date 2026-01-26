create extension if not exists "pgcrypto";

create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  venue text not null,
  asset_type text not null,
  pattern text not null,
  features jsonb not null default '{}'::jsonb,
  entry numeric not null,
  sl numeric not null,
  tp1 numeric,
  tp2 numeric,
  tp3 numeric,
  confidence int not null,
  bar_time timestamptz not null,
  seen_time timestamptz not null,
  interval text not null,
  data_latency_ms int not null,
  vendor text not null,
  class_scope text not null,
  options_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists signal_votes (
  id bigserial primary key,
  signal_id uuid references signals(id),
  detector text not null,
  score numeric not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists signals_live (
  signal_id uuid primary key references signals(id),
  status text not null,
  first_seen timestamptz not null,
  last_seen timestamptz not null,
  dedupe_hash text not null unique
);

create table if not exists public_feed (
  id bigserial primary key,
  signal_id uuid references signals(id),
  published_at timestamptz not null,
  delay_minutes int not null default 15
);

create table if not exists email_log (
  id bigserial primary key,
  uid text not null,
  template text not null,
  subject text not null,
  sent_at timestamptz not null default now(),
  to_addr text not null
);

create table if not exists stripe_entitlements (
  uid text primary key,
  plan text not null,
  status text not null,
  current_period_end timestamptz,
  seats int not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists help_tickets (
  id bigserial primary key,
  uid text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists portfolio_events (
  id bigserial primary key,
  uid text not null,
  alert_id uuid not null,
  symbol text not null,
  action text not null,
  price numeric not null,
  decided_at timestamptz not null,
  created_at timestamptz not null default now()
);
