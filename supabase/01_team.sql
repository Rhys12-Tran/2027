-- Film Crew HQ · Step 2: team profiles, roles and photos.
-- Paste this whole file into Supabase → SQL Editor → New query → Run. Safe to run more than once.

-- ---------- Profiles (one per team member) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  photo_url text,
  roles text[] not null default '{}',
  skills text[] not null default '{}',
  email text,
  phone text,
  other_contact text,
  notify_checklist boolean not null default true,
  notify_budget boolean not null default true,
  email_mode text not null default 'daily' check (email_mode in ('off', 'every', 'daily')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Team can see everyone" on public.profiles;
create policy "Team can see everyone" on public.profiles
  for select to authenticated using (true);

drop policy if exists "You can edit your own profile" on public.profiles;
create policy "You can edit your own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Make a blank profile automatically when someone is added to the team.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles for anyone who signed up before this script ran.
insert into public.profiles (id, email, name)
select id, email, split_part(email, '@', 1) from auth.users
on conflict (id) do nothing;

-- ---------- Roles (shared, editable list) ----------
create table if not exists public.roles (
  id bigint generated always as identity primary key,
  name text not null unique
);

alter table public.roles enable row level security;

drop policy if exists "Team can see roles" on public.roles;
create policy "Team can see roles" on public.roles
  for select to authenticated using (true);

drop policy if exists "Team can add roles" on public.roles;
create policy "Team can add roles" on public.roles
  for insert to authenticated with check (true);

drop policy if exists "Team can remove roles" on public.roles;
create policy "Team can remove roles" on public.roles
  for delete to authenticated using (true);

insert into public.roles (name) values
  ('Director'), ('Writer'), ('Prompt Engineer'), ('Editor'), ('Sound'), ('Budget Manager')
on conflict (name) do nothing;

-- ---------- Live updates ----------
do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.roles;
exception when duplicate_object then null;
end $$;

-- ---------- Profile photos ----------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Each person can only upload into their own folder: avatars/<their id>/...
drop policy if exists "Upload your own photo" on storage.objects;
create policy "Upload your own photo" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Replace your own photo" on storage.objects;
create policy "Replace your own photo" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Delete your own photo" on storage.objects;
create policy "Delete your own photo" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
