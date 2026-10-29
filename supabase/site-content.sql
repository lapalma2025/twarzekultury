-- Run once in Supabase SQL Editor to enable admin „Treści strony”.
-- Stores homepage / footer editable copy as JSON next to section limits.

alter table public.site_settings
  add column if not exists content jsonb not null default '{}'::jsonb;
