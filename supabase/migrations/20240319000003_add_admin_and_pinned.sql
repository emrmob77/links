-- Create admins table
create table if not exists public.admins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Create pinned_bookmarks table
create table if not exists public.pinned_bookmarks (
  id uuid default gen_random_uuid() primary key,
  bookmark_id uuid references public.bookmarks(id) on delete cascade,
  is_pinned boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(bookmark_id)
);

-- Add RLS policies for admins
alter table public.admins enable row level security;

create policy "Admins are viewable by authenticated users"
  on public.admins for select
  to authenticated
  using (true);

-- Add RLS policies for pinned_bookmarks
alter table public.pinned_bookmarks enable row level security;

create policy "Pinned bookmarks are viewable by everyone"
  on public.pinned_bookmarks for select
  to authenticated, anon
  using (true);

create policy "Only admins can manage pinned bookmarks"
  on public.pinned_bookmarks for all
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where user_id = auth.uid()
    )
  );