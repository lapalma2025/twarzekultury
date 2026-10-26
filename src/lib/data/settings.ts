import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { SiteSettings } from '@/lib/types';

/**
 * How many items each homepage section shows before offering a "Pokaż
 * więcej" button. Defaults (and optional Supabase/local persistence) —
 * not exposed in the admin UI.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  homepageLimits: { muzyka: 4, film: 4, sport: 2, gry: 2 },
};

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

function readLocal(): SiteSettings {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { homepageLimits: { ...DEFAULT_SETTINGS.homepageLimits, ...parsed.homepageLimits } };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeLocal(settings: SiteSettings) {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return readLocal();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return {
    homepageLimits: {
      muzyka: data.muzyka_limit ?? DEFAULT_SETTINGS.homepageLimits.muzyka,
      film: data.film_limit ?? DEFAULT_SETTINGS.homepageLimits.film,
      sport: data.sport_limit ?? DEFAULT_SETTINGS.homepageLimits.sport,
      gry: data.gry_limit ?? DEFAULT_SETTINGS.homepageLimits.gry,
    },
  };
}

export async function updateSiteSettings(limits: SiteSettings['homepageLimits']): Promise<void> {
  if (!isSupabaseConfigured()) {
    writeLocal({ homepageLimits: limits });
    return;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('site_settings').upsert({
    id: 'default',
    muzyka_limit: limits.muzyka,
    film_limit: limits.film,
    sport_limit: limits.sport,
    gry_limit: limits.gry,
  });
  if (error) throw error;
}
