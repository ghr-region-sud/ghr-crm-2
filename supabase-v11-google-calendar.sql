-- À exécuter une seule fois dans Supabase > SQL Editor avant d'utiliser Google Agenda.
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
