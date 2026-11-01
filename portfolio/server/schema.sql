create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
-- No public policies: the server writes using the service role key.

-- Private admin editing; the public website reads via GET /api/portfolio.
create table if not exists public.portfolio_settings (
  id text primary key check (id = 'main'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.portfolio_settings enable row level security;
-- No anonymous or authenticated policies. Only the server-side service role
-- accesses this table, after it verifies the admin user's JWT and user ID.
