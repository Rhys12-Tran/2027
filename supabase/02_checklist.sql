-- Film Crew HQ · Step 3: competition details and the checklist.
-- Paste this whole file into Supabase → SQL Editor → New query → Run. Safe to run more than once.

-- ---------- Competition (always exactly one row) ----------
create table if not exists public.competition (
  id int primary key default 1 check (id = 1),
  name text not null default 'AI Short Film Competition',
  deadline date,
  total_budget numeric(10, 2) not null default 0
);

insert into public.competition (id) values (1) on conflict (id) do nothing;

alter table public.competition enable row level security;

drop policy if exists "Team can see the competition" on public.competition;
create policy "Team can see the competition" on public.competition
  for select to authenticated using (true);

drop policy if exists "Team can edit the competition" on public.competition;
create policy "Team can edit the competition" on public.competition
  for update to authenticated using (true) with check (true);

-- ---------- Tasks ----------
create table if not exists public.tasks (
  id bigint generated always as identity primary key,
  phase text not null check (phase in ('idea', 'script', 'storyboard', 'video', 'audio', 'edit', 'submit')),
  title text not null,
  owner uuid references public.profiles (id) on delete set null,
  due date,
  status text not null default 'Not started' check (status in ('Not started', 'In progress', 'Done', 'Stuck')),
  is_lesson boolean not null default false,
  note text,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_phase_idx on public.tasks (phase);
create index if not exists tasks_owner_idx on public.tasks (owner);

alter table public.tasks enable row level security;

drop policy if exists "Team can see tasks" on public.tasks;
create policy "Team can see tasks" on public.tasks
  for select to authenticated using (true);

drop policy if exists "Team can add tasks" on public.tasks;
create policy "Team can add tasks" on public.tasks
  for insert to authenticated with check (true);

drop policy if exists "Team can edit tasks" on public.tasks;
create policy "Team can edit tasks" on public.tasks
  for update to authenticated using (true) with check (true);

drop policy if exists "Team can delete tasks" on public.tasks;
create policy "Team can delete tasks" on public.tasks
  for delete to authenticated using (true);

-- Keep updated_at current on every edit.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_touch on public.tasks;
create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();

-- ---------- Starter lessons (only added if the checklist is empty; edit them freely) ----------
insert into public.tasks (phase, title, is_lesson, created_by)
select phase, title, true, null
from (values
  ('idea', 'Read the competition rules and judging criteria together'),
  ('idea', 'Agree on the one-line idea and film length before starting'),
  ('script', 'Get script feedback from someone outside the team'),
  ('storyboard', 'Make character reference sheets so AI faces stay the same'),
  ('video', 'Check AI credits and generation limits before they run out'),
  ('audio', 'Check music and voice licences allow competition use'),
  ('edit', 'Leave 3 spare days before the deadline for fixes'),
  ('submit', 'Export a test file in the required format and size'),
  ('submit', 'Submit a day early, not on deadline night')
) as starter (phase, title)
where not exists (select 1 from public.tasks);

-- ---------- Live updates ----------
do $$
begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.competition;
exception when duplicate_object then null;
end $$;
