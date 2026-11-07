-- Film Crew HQ · Switch to "team code + pick your name" sign-in (no emails).
-- Run AFTER 01_team.sql and 02_checklist.sql. Safe to run more than once.
-- Everyone signs in as one shared team account; people are just profiles you pick from a list.

-- ---------- Profiles no longer belong to an email login ----------
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles alter column id set default gen_random_uuid();

-- Stop making a profile for every login (the shared team login shouldn't appear as a person).
drop trigger if exists on_auth_user_created on auth.users;
delete from public.profiles where email = 'team@example.com';

-- Any team member can add people and edit profiles.
drop policy if exists "You can edit your own profile" on public.profiles;
drop policy if exists "Team can edit profiles" on public.profiles;
create policy "Team can edit profiles" on public.profiles
  for update to authenticated using (true) with check (true);

drop policy if exists "Team can add people" on public.profiles;
create policy "Team can add people" on public.profiles
  for insert to authenticated with check (true);

drop policy if exists "Team can remove people" on public.profiles;
create policy "Team can remove people" on public.profiles
  for delete to authenticated using (true);

-- ---------- Tasks: "created by" is now set by the site, not the login ----------
alter table public.tasks alter column created_by drop default;

-- ---------- Photos: any team member can upload ----------
drop policy if exists "Upload your own photo" on storage.objects;
drop policy if exists "Replace your own photo" on storage.objects;
drop policy if exists "Delete your own photo" on storage.objects;
drop policy if exists "Team can upload photos" on storage.objects;
drop policy if exists "Team can replace photos" on storage.objects;
drop policy if exists "Team can delete photos" on storage.objects;

create policy "Team can upload photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');
create policy "Team can replace photos" on storage.objects
  for update to authenticated using (bucket_id = 'avatars');
create policy "Team can delete photos" on storage.objects
  for delete to authenticated using (bucket_id = 'avatars');
