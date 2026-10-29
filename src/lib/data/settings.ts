import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { DEFAULT_SITE_CONTENT, mergeSiteContent, type SiteContent } from '@/lib/site-content';
import type { SiteSettings } from '@/lib/types';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

function readLocal(): SiteContent {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return mergeSiteContent(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

function writeLocal(content: SiteContent) {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(content, null, 2), 'utf-8');
}

/** Full editable site content (homepage copy, footer, limits). Cached per request. */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!isSupabaseConfigured()) return readLocal();

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle();
  if (error || !data) return DEFAULT_SITE_CONTENT;

  let stored: Partial<SiteContent> = {};
  if (data.content) {
    if (typeof data.content === 'string') {
      try {
        stored = JSON.parse(data.content) as Partial<SiteContent>;
      } catch {
        stored = {};
      }
    } else if (typeof data.content === 'object' && !Array.isArray(data.content)) {
      stored = data.content as Partial<SiteContent>;
    }
  }

  const fromRow: Partial<SiteContent> = {
    ...stored,
    homepageLimits: {
      muzyka: data.muzyka_limit ?? DEFAULT_SITE_CONTENT.homepageLimits.muzyka,
      film: data.film_limit ?? DEFAULT_SITE_CONTENT.homepageLimits.film,
      sport: data.sport_limit ?? DEFAULT_SITE_CONTENT.homepageLimits.sport,
      gry: data.gry_limit ?? DEFAULT_SITE_CONTENT.homepageLimits.gry,
    },
  };
  // Limits columns win over nested content.homepageLimits when both exist
  fromRow.homepageLimits = {
    muzyka: data.muzyka_limit ?? fromRow.homepageLimits?.muzyka ?? DEFAULT_SITE_CONTENT.homepageLimits.muzyka,
    film: data.film_limit ?? fromRow.homepageLimits?.film ?? DEFAULT_SITE_CONTENT.homepageLimits.film,
    sport: data.sport_limit ?? fromRow.homepageLimits?.sport ?? DEFAULT_SITE_CONTENT.homepageLimits.sport,
    gry: data.gry_limit ?? fromRow.homepageLimits?.gry ?? DEFAULT_SITE_CONTENT.homepageLimits.gry,
  };
  return mergeSiteContent(fromRow);
});

/** @deprecated Prefer getSiteContent(). Kept for older call sites. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const c = await getSiteContent();
  return { homepageLimits: c.homepageLimits };
}

export async function updateSiteContent(content: SiteContent): Promise<void> {
  const merged = mergeSiteContent(content);

  if (!isSupabaseConfigured()) {
    writeLocal(merged);
    return;
  }

  const supabase = await createServerSupabaseClient();
  const { homepageLimits, ...rest } = merged;
  const { error } = await supabase.from('site_settings').upsert({
    id: 'default',
    muzyka_limit: homepageLimits.muzyka,
    film_limit: homepageLimits.film,
    sport_limit: homepageLimits.sport,
    gry_limit: homepageLimits.gry,
    content: { ...rest, homepageLimits },
  });
  if (error) throw error;
}

/** @deprecated Prefer updateSiteContent */
export async function updateSiteSettings(limits: SiteSettings['homepageLimits']): Promise<void> {
  const current = await getSiteContent();
  await updateSiteContent({ ...current, homepageLimits: limits });
}

export { DEFAULT_SITE_CONTENT };
