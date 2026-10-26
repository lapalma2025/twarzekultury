-- ============================================================================
-- Galeria „Twarze tego tygodnia” — 5 kadrów edytowalnych z panelu admina.
-- Uruchom w SQL Editor (raz), potem odśwież /admin/gallery.
-- ============================================================================

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

-- Domyślne 5 slotów (puste URL — admin uzupełni, albo skrypt seed)
insert into public.gallery_frames (slot, alt_pl, alt_en, parallax) values
  (1, 'Dariusz Kozakiewicz', 'Dariusz Kozakiewicz', 30),
  (2, 'Małgorzata Kozłowska', 'Małgorzata Kozłowska', -20),
  (3, 'Black Sabbath', 'Black Sabbath', 50),
  (4, 'Piotr Rogucki', 'Piotr Rogucki', -40),
  (5, 'David Bowie', 'David Bowie', 25)
on conflict (slot) do nothing;
