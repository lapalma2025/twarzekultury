'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { articleSchema, fillMissingLocaleFields } from '@/lib/validation/article';
import { createArticle, updateArticle, deleteArticle, getArticleById } from '@/lib/data/articles';
import type { ArticleInput } from '@/lib/types';

export interface ArticleFormState {
  error?: string;
}

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function formToInput(formData: FormData): ArticleInput | { error: string } {
  const raw = Object.fromEntries(formData.entries());
  const parsed = articleSchema.safeParse({
    category: raw.category,
    subcategory: raw.subcategory === '' || raw.subcategory === undefined ? null : raw.subcategory,
    slugPl: raw.slugPl,
    slugEn: raw.slugEn,
    titlePl: raw.titlePl,
    titleEn: raw.titleEn,
    leadPl: raw.leadPl,
    leadEn: raw.leadEn,
    bodyPl: raw.bodyPl,
    bodyEn: raw.bodyEn,
    coverImageUrl: raw.coverImageUrl,
    coverImagePosition: raw.coverImagePosition || undefined,
    author: raw.author,
    readingTimeMin: raw.readingTimeMin,
    rating: raw.rating === '' ? undefined : raw.rating,
    tags: raw.tags ?? '',
    status: raw.status,
    // „Twarz tygodnia” ustawiana wyłącznie w /admin/week-face
    featured: false,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Nieprawidłowe dane formularza.' };
  }

  const v = fillMissingLocaleFields(parsed.data);
  return {
    category: v.category as ArticleInput['category'],
    subcategory: v.subcategory || null,
    slug: { pl: v.slugPl, en: v.slugEn },
    title: { pl: v.titlePl, en: v.titleEn },
    lead: { pl: v.leadPl, en: v.leadEn },
    body: { pl: v.bodyPl, en: v.bodyEn },
    coverImageUrl: v.coverImageUrl || null,
    coverImagePosition: v.coverImagePosition || '50% 50%',
    author: v.author,
    readingTimeMin: v.readingTimeMin,
    rating: Number.isNaN(v.rating as number) ? null : (v.rating as number | null) ?? null,
    tags: parseTags(v.tags),
    status: v.status,
    featured: false,
    publishedAt: v.status === 'published' ? new Date().toISOString() : null,
  };
}

export async function createArticleAction(_prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await requireAdmin();
  const input = formToInput(formData);
  if ('error' in input) return { error: input.error };

  try {
    await createArticle(input);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Nie udało się zapisać artykułu (sprawdź unikalność slugów).' };
  }

  revalidatePath('/admin');
  revalidatePath('/', 'layout');
  redirect('/admin');
}

export async function updateArticleAction(id: string, _prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await requireAdmin();
  const input = formToInput(formData);
  if ('error' in input) return { error: input.error };

  try {
    const existing = await getArticleById(id);
    // Nie nadpisuj flagi „twarz tygodnia” przy zwykłej edycji artykułu
    input.featured = existing?.featured ?? false;
    if (existing?.status === 'published' && input.status === 'published' && existing.publishedAt) {
      input.publishedAt = existing.publishedAt;
    }
    const updated = await updateArticle(id, input);
    if (!updated) return { error: 'Artykuł nie istnieje.' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Nie udało się zapisać zmian.' };
  }

  revalidatePath('/admin');
  revalidatePath('/', 'layout');
  redirect('/admin');
}

export async function deleteArticleAction(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await deleteArticle(id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Nie udało się usunąć artykułu.' };
  }
  revalidatePath('/admin');
  revalidatePath('/', 'layout');
  return {};
}
