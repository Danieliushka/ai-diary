-- Створення таблиці tasks (завдання)
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'active' check (status in ('active', 'completed')),
  deadline timestamp with time zone,
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users not null
);

-- Створення таблиці goals (цілі)
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'active' check (status in ('active', 'completed')),
  deadline timestamp with time zone,
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users not null
);

-- Створення таблиці diary_entries (записи щоденника)
create table public.diary_entries (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  mood text,
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users not null
);

-- Налаштування Row Level Security (RLS)
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.diary_entries enable row level security;

-- Політики безпеки для tasks
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Політики безпеки для goals
create policy "Users can view their own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can create their own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Політики безпеки для diary_entries
create policy "Users can view their own diary entries"
  on public.diary_entries for select
  using (auth.uid() = user_id);

create policy "Users can create their own diary entries"
  on public.diary_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own diary entries"
  on public.diary_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own diary entries"
  on public.diary_entries for delete
  using (auth.uid() = user_id);