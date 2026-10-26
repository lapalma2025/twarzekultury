import 'server-only';
import type { Article, ArticleInput, Category } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { localStore } from './local-store';

/**
 * Single data-access point for articles. Automatically targets Supabase once
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set (see
 * supabase/schema.sql); otherwise falls back to the local JSON store so the
 * admin panel is fully usable before Supabase is connected.
 */

type Row = {
  id: string;
  category: Category;
  subcategory: string | null;
  slug_pl: string;
  slug_en: string;
  title_pl: string;
  title_en: string;
  lead_pl: string;
  lead_en: string;
  body_pl: string;
  body_en: string;
  cover_image_url: string | null;
  cover_image_position: string | null;
  author: string;
  reading_time_min: number;
  rating: number | null;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function rowToArticle(r: Row): Article {
  return {
    id: r.id,
    category: r.category,
    subcategory: r.subcategory,
    slug: { pl: r.slug_pl, en: r.slug_en },
    title: { pl: r.title_pl, en: r.title_en },
    lead: { pl: r.lead_pl, en: r.lead_en },
    body: { pl: r.body_pl, en: r.body_en },
    coverImageUrl: r.cover_image_url,
    coverImagePosition: r.cover_image_position,
    author: r.author,
    readingTimeMin: r.reading_time_min,
    rating: r.rating,
    tags: r.tags ?? [],
    status: r.status,
    featured: r.featured,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function inputToRow(input: Partial<ArticleInput>) {
  const row: Record<string, unknown> = {};
  if (input.category !== undefined) row.category = input.category;
  if (input.subcategory !== undefined) row.subcategory = input.subcategory;
  if (input.slug !== undefined) {
    row.slug_pl = input.slug.pl;
    row.slug_en = input.slug.en;
  }
  if (input.title !== undefined) {
    row.title_pl = input.title.pl;
    row.title_en = input.title.en;
  }
  if (input.lead !== undefined) {
    row.lead_pl = input.lead.pl;
    row.lead_en = input.lead.en;
  }
  if (input.body !== undefined) {
    row.body_pl = input.body.pl;
    row.body_en = input.body.en;
  }
  if (input.coverImageUrl !== undefined) row.cover_image_url = input.coverImageUrl;
  if (input.coverImagePosition !== undefined) row.cover_image_position = input.coverImagePosition;
  if (input.author !== undefined) row.author = input.author;
  if (input.readingTimeMin !== undefined) row.reading_time_min = input.readingTimeMin;
  if (input.rating !== undefined) row.rating = input.rating;
  if (input.tags !== undefined) row.tags = input.tags;
  if (input.status !== undefined) row.status = input.status;
  if (input.featured !== undefined) row.featured = input.featured;
  if (input.publishedAt !== undefined) row.published_at = input.publishedAt;
  return row;
}

export interface ListFilter {
  status?: 'draft' | 'published';
  category?: Category;
  subcategory?: string;
}

export async function listArticles(filter: ListFilter = {}): Promise<Article[]> {
  if (!isSupabaseConfigured()) {
    let items = localStore.list();
    if (filter.status) items = items.filter((a) => a.status === filter.status);
    if (filter.category) items = items.filter((a) => a.category === filter.category);
    if (filter.subcategory) items = items.filter((a) => a.subcategory === filter.subcategory);
    return items.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase.from('articles').select('*').order('published_at', { ascending: false, nullsFirst: false });
  if (filter.status) query = query.eq('status', filter.status);
  if (filter.category) query = query.eq('category', filter.category);
  if (filter.subcategory) query = query.eq('subcategory', filter.subcategory);
  const { data, error } = await query;
  if (error) throw error;
  return (data as Row[]).map(rowToArticle);
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (!isSupabaseConfigured()) return localStore.get(id);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToArticle(data as Row) : null;
}

export async function getArticleBySlug(locale: 'pl' | 'en', slug: string): Promise<Article | null> {
  if (!isSupabaseConfigured()) return localStore.getBySlug(locale, slug);
  const supabase = await createServerSupabaseClient();
  const column = locale === 'pl' ? 'slug_pl' : 'slug_en';
  const { data, error } = await supabase.from('articles').select('*').eq(column, slug).maybeSingle();
  if (error) throw error;
  return data ? rowToArticle(data as Row) : null;
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  if (!isSupabaseConfigured()) return localStore.create(input);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const row = { ...inputToRow(input), created_by: user?.id ?? null };
  const { data, error } = await supabase.from('articles').insert(row).select('*').single();
  if (error) throw error;
  return rowToArticle(data as Row);
}

export async function updateArticle(id: string, input: Partial<ArticleInput>): Promise<Article | null> {
  if (!isSupabaseConfigured()) return localStore.update(id, input);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('articles').update(inputToRow(input)).eq('id', id).select('*').maybeSingle();
  if (error) throw error;
  return data ? rowToArticle(data as Row) : null;
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return localStore.remove(id);
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) throw error;
  return true;
}

/** Marks exactly one published article as the homepage „Twarz tygodnia”
 * (featured). Clears the flag on every other article. */
export async function setWeekFace(articleId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const all = localStore.list();
    const target = all.find((a) => a.id === articleId);
    if (!target || target.status !== 'published') {
      throw new Error('Wybierz opublikowany artykuł.');
    }
    for (const a of all) {
      localStore.update(a.id, { featured: a.id === articleId });
    }
    return;
  }

  const supabase = await createServerSupabaseClient();
  const { data: target, error: getErr } = await supabase
    .from('articles')
    .select('id, status')
    .eq('id', articleId)
    .maybeSingle();
  if (getErr) throw getErr;
  if (!target || target.status !== 'published') {
    throw new Error('Wybierz opublikowany artykuł.');
  }

  const { error: clearErr } = await supabase.from('articles').update({ featured: false }).neq('id', articleId);
  if (clearErr) throw clearErr;
  const { error: setErr } = await supabase.from('articles').update({ featured: true }).eq('id', articleId);
  if (setErr) throw setErr;
}
