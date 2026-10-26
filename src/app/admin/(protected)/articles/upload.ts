'use server';

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export interface UploadResult {
  url?: string;
  error?: string;
}

/** Uploads an image (article cover, or one embedded inside the body via the
 * Markdown editor). Targets Supabase Storage once configured, otherwise
 * writes to /public/uploads so the admin panel works locally today. */
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get('file');
  if (!(file instanceof File)) return { error: 'Nie wybrano pliku.' };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: 'Dozwolone formaty: JPG, PNG, WEBP, GIF.' };
  if (file.size > MAX_BYTES) return { error: 'Plik jest za duży (maks. 8MB).' };

  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.storage.from('article-images').upload(filename, bytes, { contentType: file.type });
    if (error) return { error: `Błąd wgrywania: ${error.message}` };
    const { data } = supabase.storage.from('article-images').getPublicUrl(filename);
    return { url: data.publicUrl };
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, filename), bytes);
  return { url: `/uploads/${filename}` };
}
