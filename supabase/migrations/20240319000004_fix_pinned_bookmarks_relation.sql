-- Drop existing pinned_bookmarks table if exists
drop table if exists public.pinned_bookmarks;

-- Recreate pinned_bookmarks table with proper foreign key
create table public.pinned_bookmarks (
  id uuid default gen_random_uuid() primary key,
  bookmark_id uuid not null,
  is_pinned boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  foreign key (bookmark_id) references public.bookmarks(id) on delete cascade,
  unique(bookmark_id)
);

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