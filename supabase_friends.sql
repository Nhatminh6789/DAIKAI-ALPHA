-- Chạy 1 lần trong Supabase: SQL Editor -> New query -> dán -> Run
create table if not exists public.public_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  code text not null unique,
  name text not null default 'Player',
  av text,
  elo int not null default 100,
  rg int not null default 0,
  peak int not null default 100,
  w int not null default 0, l int not null default 0, d int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.public_profiles enable row level security;
drop policy if exists pp_read on public.public_profiles;
drop policy if exists pp_ins on public.public_profiles;
drop policy if exists pp_upd on public.public_profiles;
create policy pp_read on public.public_profiles for select to authenticated using (true);
create policy pp_ins on public.public_profiles for insert to authenticated with check (id = auth.uid());
create policy pp_upd on public.public_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create table if not exists public.friends (
  a uuid not null references auth.users(id) on delete cascade,
  b uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  primary key (a, b),
  check (a <> b)
);
create unique index if not exists friends_pair_uni on public.friends (least(a,b), greatest(a,b));
alter table public.friends enable row level security;
drop policy if exists fr_read on public.friends;
drop policy if exists fr_ins on public.friends;
drop policy if exists fr_upd on public.friends;
drop policy if exists fr_del on public.friends;
create policy fr_read on public.friends for select to authenticated using (auth.uid() in (a, b));
create policy fr_ins on public.friends for insert to authenticated with check (a = auth.uid() and status = 'pending');
create policy fr_upd on public.friends for update to authenticated using (b = auth.uid()) with check (b = auth.uid() and status = 'accepted');
create policy fr_del on public.friends for delete to authenticated using (auth.uid() in (a, b));
