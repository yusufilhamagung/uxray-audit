create extension if not exists "pgcrypto";

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  page_type text not null,
  image_url text not null,
  ux_score integer not null,
  result_json jsonb not null,
  model_used text not null,
  latency_ms integer not null
);

create index if not exists audits_created_at_idx on public.audits (created_at desc);
