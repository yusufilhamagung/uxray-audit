create extension if not exists "pgcrypto";

create table if not exists public.early_access_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  source text,
  audit_id uuid,
  user_agent text,
  ip_hash text
);

create index if not exists early_access_signups_created_at_idx
  on public.early_access_signups (created_at desc);
