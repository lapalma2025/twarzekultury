-- ============================================================================
-- Twarze Kultury — schemat bazy danych Supabase
-- Uruchom całość w Supabase Studio -> SQL Editor (albo `supabase db push`).
-- Bezpieczne do wielokrotnego uruchomienia (IF NOT EXISTS / OR REPLACE).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- PROFILES — role administratorów. Wiersz w tej tabeli = użytkownik jest
-- adminem panelu. Zwykli czytelnicy portalu NIE zakładają konta.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: self read" on public.profiles;
create policy "profiles: self read" on public.profiles
  for select using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- ARTICLES — treść dwujęzyczna (PL/EN) w jednym wierszu na artykuł.
-- ----------------------------------------------------------------------------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),

  category text not null check (category in ('muzyka', 'film', 'sport', 'gry')),
  subcategory text,

  slug_pl text not null unique,
  slug_en text not null unique,

  title_pl text not null,
  title_en text not null,
  lead_pl text not null default '',
  lead_en text not null default '',
  body_pl text not null default '',
  body_en text not null default '',

  cover_image_url text,
  -- CSS object-position ("50% 50%") — the crop focal point chosen in the
  -- admin panel's cropper, so a badly-framed photo can be repositioned
  -- without a re-upload.
  cover_image_position text not null default '50% 50%',
  author text not null default 'Redakcja',
  reading_time_min int not null default 5,
  rating numeric(3,1),

  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

-- Safe to re-run against a table created before this column existed.
alter table public.articles add column if not exists cover_image_position text not null default '50% 50%';

create index if not exists articles_category_idx on public.articles (category);
create index if not exists articles_status_idx on public.articles (status);
create index if not exists articles_published_at_idx on public.articles (published_at desc);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

alter table public.articles enable row level security;

-- Public: only published articles are readable by anyone (anon + authenticated).
drop policy if exists "articles: public read published" on public.articles;
create policy "articles: public read published" on public.articles
  for select using (status = 'published');

-- Admins: full read (drafts included) — checked via profiles membership.
drop policy if exists "articles: admin read all" on public.articles;
create policy "articles: admin read all" on public.articles
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid()));

drop policy if exists "articles: admin insert" on public.articles;
create policy "articles: admin insert" on public.articles
  for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid()));

drop policy if exists "articles: admin update" on public.articles;
create policy "articles: admin update" on public.articles
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));

drop policy if exists "articles: admin delete" on public.articles;
create policy "articles: admin delete" on public.articles
  for delete using (exists (select 1 from public.profiles p where p.id = auth.uid()));

-- ----------------------------------------------------------------------------
-- STORAGE — bucket na zdjęcia artykułów. Publiczny odczyt, zapis tylko admin.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

drop policy if exists "article-images: public read" on storage.objects;
create policy "article-images: public read" on storage.objects
  for select using (bucket_id = 'article-images');

drop policy if exists "article-images: admin write" on storage.objects;
create policy "article-images: admin write" on storage.objects
  for insert with check (
    bucket_id = 'article-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "article-images: admin update" on storage.objects;
create policy "article-images: admin update" on storage.objects
  for update using (
    bucket_id = 'article-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "article-images: admin delete" on storage.objects;
create policy "article-images: admin delete" on storage.objects
  for delete using (
    bucket_id = 'article-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- SITE_SETTINGS — single-row table of editable homepage behaviour, e.g. how
-- many articles each homepage section shows before "Pokaż więcej".
-- ----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id text primary key default 'default',
  muzyka_limit int not null default 4,
  film_limit int not null default 4,
  sport_limit int not null default 2,
  gry_limit int not null default 2,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "site_settings: public read" on public.site_settings;
create policy "site_settings: public read" on public.site_settings
  for select using (true);

drop policy if exists "site_settings: admin write" on public.site_settings;
create policy "site_settings: admin write" on public.site_settings
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));

insert into public.site_settings (id) values ('default') on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- GALLERY_FRAMES — 5 kadrów sekcji „Twarze tego tygodnia” na homepage.
-- Edytowalne z /admin/gallery.
-- ----------------------------------------------------------------------------
create table if not exists public.gallery_frames (
  slot int primary key check (slot between 1 and 5),
  image_url text,
  alt_pl text not null default '',
  alt_en text not null default '',
  parallax int not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists gallery_frames_set_updated_at on public.gallery_frames;
create trigger gallery_frames_set_updated_at
  before update on public.gallery_frames
  for each row execute function public.set_updated_at();

alter table public.gallery_frames enable row level security;

drop policy if exists "gallery_frames: public read" on public.gallery_frames;
create policy "gallery_frames: public read" on public.gallery_frames
  for select using (true);

drop policy if exists "gallery_frames: admin write" on public.gallery_frames;
create policy "gallery_frames: admin write" on public.gallery_frames
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));

insert into public.gallery_frames (slot, alt_pl, alt_en, parallax) values
  (1, 'Dariusz Kozakiewicz', 'Dariusz Kozakiewicz', 30),
  (2, 'Małgorzata Kozłowska', 'Małgorzata Kozłowska', -20),
  (3, 'Black Sabbath', 'Black Sabbath', 50),
  (4, 'Piotr Rogucki', 'Piotr Rogucki', -40),
  (5, 'David Bowie', 'David Bowie', 25)
on conflict (slot) do nothing;

-- ----------------------------------------------------------------------------
-- Jak nadać sobie uprawnienia administratora po zalogowaniu przez
-- Supabase Auth (Authentication -> Users -> Add user, albo strona /admin/login
-- z włączonym self-signup na czas zakładania pierwszego konta):
--
--   insert into public.profiles (id, email)
--   select id, email from auth.users where email = 'twoj@email.pl';
-- ----------------------------------------------------------------------------
