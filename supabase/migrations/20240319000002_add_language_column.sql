-- Add language column to bookmarks table
alter table public.bookmarks 
add column language text not null default 'en';

-- Create index for language column
create index idx_bookmarks_language on public.bookmarks(language);

-- Update existing records to use the default language
update public.bookmarks set language = 'en' where language is null;