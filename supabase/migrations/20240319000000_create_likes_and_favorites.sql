-- Create bookmark_likes table
create table if not exists public.bookmark_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  bookmark_id uuid references public.bookmarks(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, bookmark_id)
);

-- Create bookmark_favorites table
create table if not exists public.bookmark_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  bookmark_id uuid references public.bookmarks(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, bookmark_id)
);

-- Add RLS policies for bookmark_likes
alter table public.bookmark_likes enable row level security;

create policy "Users can view all likes"
  on public.bookmark_likes for select
  to authenticated, anon
  using (true);

create policy "Users can insert their own likes"
  on public.bookmark_likes for insert
  to authenticated, anon
  with check (true);

create policy "Users can delete their own likes"
  on public.bookmark_likes for delete
  to authenticated, anon
  using (true);

-- Add RLS policies for bookmark_favorites
alter table public.bookmark_favorites enable row level security;

create policy "Users can view all favorites"
  on public.bookmark_favorites for select
  to authenticated, anon
  using (true);

create policy "Users can insert their own favorites"
  on public.bookmark_favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.bookmark_favorites for delete
  to authenticated
  using (auth.uid() = user_id);