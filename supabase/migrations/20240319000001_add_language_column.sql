-- Add language column to bookmarks table
alter table public.bookmarks 
add column language text not null default 'en';

-- Create index for language column
create index idx_bookmarks_language on public.bookmarks(language);

-- Update existing records to use the default language
update public.bookmarks set language = 'en' where language is null;

-- Add RLS policy for language column
create policy "Users can view bookmarks in their language"
  on public.bookmarks for select
  to authenticated, anon
  using (true);

create policy "Users can insert bookmarks with language"
  on public.bookmarks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own bookmarks language"
  on public.bookmarks for update
  to authenticated
  using (auth.uid() = user_id);