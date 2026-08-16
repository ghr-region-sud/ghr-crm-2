-- V8 - base métier existante
create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.app_state (id,payload) values ('main','{}'::jsonb) on conflict (id) do nothing;
alter table public.app_state enable row level security;

-- Profils applicatifs séparés de Supabase Auth
create table if not exists public.app_users (
  id text primary key,
  auth_user_id uuid not null unique,
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin','delegate')),
  access_ids jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  sector text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.app_users enable row level security;

-- Documents privés
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('ghr-documents','ghr-documents',false,10485760,null)
on conflict (id) do update set file_size_limit=excluded.file_size_limit;

-- V11 - connexions Google Agenda (serveur uniquement)
create table if not exists public.google_calendar_connections (
  profile_id text primary key,
  google_email text not null default '',
  refresh_token text not null default '',
  access_token text not null default '',
  expires_at timestamptz,
  scope text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.google_calendar_connections enable row level security;
