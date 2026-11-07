-- Film Crew HQ · Step 4: budget categories and expenses (all amounts NZD).
-- Run AFTER 01, 02 and 03. Safe to run more than once.

-- ---------- Categories (each with its own planned amount) ----------
create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  planned numeric(10, 2) not null default 0 check (planned >= 0),
  color text not null default '#8C8C8C',
  position int not null default 0
);

alter table public.categories enable row level security;

drop policy if exists "Team can see categories" on public.categories;
create policy "Team can see categories" on public.categories for select to authenticated using (true);
drop policy if exists "Team can add categories" on public.categories;
create policy "Team can add categories" on public.categories for insert to authenticated with check (true);
drop policy if exists "Team can edit categories" on public.categories;
create policy "Team can edit categories" on public.categories for update to authenticated using (true) with check (true);
drop policy if exists "Team can delete categories" on public.categories;
create policy "Team can delete categories" on public.categories for delete to authenticated using (true);

insert into public.categories (name, color, position)
select name, color, position
from (values
  ('AI tool subscriptions', '#7B61FF', 1),
  ('Music', '#CC79A7', 2),
  ('Voiceover', '#0072B2', 3),
  ('Software', '#009E73', 4),
  ('Equipment', '#E69F00', 5),
  ('Prizes / entry fees', '#D55E00', 6),
  ('Other', '#8C8C8C', 7)
) as starter (name, color, position)
where not exists (select 1 from public.categories);

-- ---------- Expenses ----------
create table if not exists public.expenses (
  id bigint generated always as identity primary key,
  item text not null,
  amount numeric(10, 2) not null check (amount > 0),
  category_id bigint references public.categories (id) on delete set null,
  date date not null default current_date,
  paid_by uuid references public.profiles (id) on delete set null,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_date_idx on public.expenses (date);

alter table public.expenses enable row level security;

drop policy if exists "Team can see expenses" on public.expenses;
create policy "Team can see expenses" on public.expenses for select to authenticated using (true);
drop policy if exists "Team can add expenses" on public.expenses;
create policy "Team can add expenses" on public.expenses for insert to authenticated with check (true);
drop policy if exists "Team can edit expenses" on public.expenses;
create policy "Team can edit expenses" on public.expenses for update to authenticated using (true) with check (true);
drop policy if exists "Team can delete expenses" on public.expenses;
create policy "Team can delete expenses" on public.expenses for delete to authenticated using (true);

-- ---------- Live updates ----------
do $$
begin
  alter publication supabase_realtime add table public.categories;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.expenses;
exception when duplicate_object then null;
end $$;
