import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import type { GalleryFrame } from '@/lib/types';

const DEFAULT_POSITION = '50% 20%';

/** Default „Twarze tego tygodnia” — oryginalne kadry z /public/uploads. */
export const DEFAULT_GALLERY: GalleryFrame[] = [
  { slot: 1, imageUrl: '/uploads/dariusz-kozakiewicz.jpg', imagePosition: DEFAULT_POSITION, alt: { pl: 'Dariusz Kozakiewicz', en: 'Dariusz Kozakiewicz' }, parallax: 30 },
  { slot: 2, imageUrl: '/uploads/malgorzata-kozlowska.jpg', imagePosition: DEFAULT_POSITION, alt: { pl: 'Małgorzata Kozłowska', en: 'Małgorzata Kozłowska' }, parallax: -20 },
  { slot: 3, imageUrl: '/uploads/black-sabbath-1970.jpg', imagePosition: DEFAULT_POSITION, alt: { pl: 'Black Sabbath', en: 'Black Sabbath' }, parallax: 50 },
  { slot: 4, imageUrl: '/uploads/piotr-rogucki.jpg', imagePosition: DEFAULT_POSITION, alt: { pl: 'Piotr Rogucki', en: 'Piotr Rogucki' }, parallax: -40 },
  { slot: 5, imageUrl: '/uploads/david-bowie-1967.png', imagePosition: DEFAULT_POSITION, alt: { pl: 'David Bowie', en: 'David Bowie' }, parallax: 25 },
];

const GALLERY_FILE = path.join(process.cwd(), 'data', 'gallery.json');

type Row = {
  slot: number;
  image_url: string | null;
  image_position?: string | null;
  alt_pl: string;
  alt_en: string;
  parallax: number;
};

function rowToFrame(r: Row): GalleryFrame {
  return {
    slot: r.slot as GalleryFrame['slot'],
    imageUrl: r.image_url,
    imagePosition: r.image_position || DEFAULT_POSITION,
    alt: { pl: r.alt_pl ?? '', en: r.alt_en ?? '' },
    parallax: r.parallax ?? 0,
  };
}

function normalize(frames: GalleryFrame[]): GalleryFrame[] {
  const bySlot = new Map(frames.map((f) => [f.slot, f]));
  return DEFAULT_GALLERY.map((d) => {
    const f = bySlot.get(d.slot);
    if (!f) return d;
    return {
      slot: d.slot,
      imageUrl: f.imageUrl ?? d.imageUrl,
      imagePosition: f.imagePosition || d.imagePosition || DEFAULT_POSITION,
      alt: { pl: f.alt.pl || d.alt.pl, en: f.alt.en || d.alt.en },
      parallax: f.parallax ?? d.parallax,
    };
  });
}

function readLocal(): GalleryFrame[] {
  try {
    const raw = fs.readFileSync(GALLERY_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as GalleryFrame[];
    return normalize(parsed);
  } catch {
    return DEFAULT_GALLERY;
  }
}

function writeLocal(frames: GalleryFrame[]) {
  const dir = path.dirname(GALLERY_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(GALLERY_FILE, JSON.stringify(frames, null, 2), 'utf-8');
}

export async function listGalleryFrames(): Promise<GalleryFrame[]> {
  if (!isSupabaseConfigured()) return readLocal();

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from('gallery_frames').select('*').order('slot', { ascending: true });
  if (error || !data?.length) return DEFAULT_GALLERY;
  return normalize((data as Row[]).map(rowToFrame));
}

export async function updateGalleryFrames(frames: GalleryFrame[]): Promise<void> {
  const normalized = normalize(frames);

  if (!isSupabaseConfigured()) {
    writeLocal(normalized);
    return;
  }

  const supabase = await createServerSupabaseClient();
  const rows = normalized.map((f) => ({
    slot: f.slot,
    image_url: f.imageUrl,
    image_position: f.imagePosition || DEFAULT_POSITION,
    alt_pl: f.alt.pl,
    alt_en: f.alt.en,
    parallax: f.parallax,
  }));
  const { error } = await supabase.from('gallery_frames').upsert(rows, { onConflict: 'slot' });
  if (error) throw error;
}
