-- Run once in Supabase Studio → SQL Editor (production already has articles).
alter table public.articles add column if not exists section_featured boolean not null default false;
