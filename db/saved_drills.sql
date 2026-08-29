-- Run this in your Supabase SQL editor.
-- Saved training drills (private per user)
create table if not exists public.saved_drills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  name_normalized text not null,
  drill jsonb not null,
  par_seconds numeric,
  created_at timestamptz not null default now(),
  unique (user_id, name_normalized)
);

grant select, insert, update, delete on public.saved_drills to authenticated;
grant all on public.saved_drills to service_role;

alter table public.saved_drills enable row level security;

create policy "Users can view their own saved drills"
  on public.saved_drills for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own saved drills"
  on public.saved_drills for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own saved drills"
  on public.saved_drills for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own saved drills"
  on public.saved_drills for delete to authenticated
  using (auth.uid() = user_id);
