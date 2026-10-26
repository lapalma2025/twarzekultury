'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { setWeekFace } from '@/lib/data/articles';

export interface WeekFaceFormState {
  error?: string;
  success?: boolean;
}

export async function updateWeekFaceAction(_prev: WeekFaceFormState, formData: FormData): Promise<WeekFaceFormState> {
  await requireAdmin();

  const articleId = String(formData.get('articleId') ?? '').trim();
  if (!articleId) return { error: 'Wybierz artykuł.' };

  try {
    await setWeekFace(articleId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Nie udało się zapisać.' };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/week-face');
  return { success: true };
}
