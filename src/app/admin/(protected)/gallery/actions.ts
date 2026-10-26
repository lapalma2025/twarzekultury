'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { updateGalleryFrames } from '@/lib/data/gallery';
import type { GalleryFrame } from '@/lib/types';

export interface GalleryFormState {
  error?: string;
  success?: boolean;
}

const frameSchema = z.object({
  slot: z.coerce.number().int().min(1).max(5),
  imageUrl: z.string().max(2000).nullable(),
  altPl: z.string().max(200),
  altEn: z.string().max(200),
  parallax: z.coerce.number().int().min(-100).max(100),
});

export async function updateGalleryAction(_prev: GalleryFormState, formData: FormData): Promise<GalleryFormState> {
  await requireAdmin();

  const frames: GalleryFrame[] = [];
  for (let slot = 1; slot <= 5; slot++) {
    const imageUrlRaw = String(formData.get(`imageUrl_${slot}`) ?? '').trim();
    const parsed = frameSchema.safeParse({
      slot,
      imageUrl: imageUrlRaw || null,
      altPl: formData.get(`altPl_${slot}`) ?? '',
      altEn: formData.get(`altEn_${slot}`) ?? '',
      parallax: formData.get(`parallax_${slot}`) ?? 0,
    });
    if (!parsed.success) {
      return { error: `Kadr ${slot}: ${parsed.error.issues[0]?.message ?? 'nieprawidłowe dane'}` };
    }
    frames.push({
      slot: parsed.data.slot as GalleryFrame['slot'],
      imageUrl: parsed.data.imageUrl,
      alt: { pl: parsed.data.altPl, en: parsed.data.altEn },
      parallax: parsed.data.parallax,
    });
  }

  try {
    await updateGalleryFrames(frames);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Nie udało się zapisać galerii.' };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/gallery');
  return { success: true };
}
