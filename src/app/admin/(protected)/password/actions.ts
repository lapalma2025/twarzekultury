'use server';

import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateLocalPassword } from '@/lib/auth/local';

export interface PasswordFormState {
  error?: string;
  success?: boolean;
}

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Podaj obecne hasło.'),
    newPassword: z.string().min(8, 'Nowe hasło musi mieć co najmniej 8 znaków.').max(200),
    confirmPassword: z.string().min(1, 'Powtórz nowe hasło.'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Nowe hasła nie są takie same.',
    path: ['confirmPassword'],
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: 'Nowe hasło musi różnić się od obecnego.',
    path: ['newPassword'],
  });

export async function changePasswordAction(
  _prev: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const admin = await requireAdmin();

  const parsed = schema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Nieprawidłowe dane.' };
  }

  const { currentPassword, newPassword } = parsed.data;

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();

    // Re-auth with current password before changing it.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: admin.email,
      password: currentPassword,
    });
    if (signInError) return { error: 'Obecne hasło jest nieprawidłowe.' };

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      return { error: updateError.message || 'Nie udało się zmienić hasła.' };
    }
    return { success: true };
  }

  const result = await updateLocalPassword(admin.email, currentPassword, newPassword);
  if ('error' in result) return { error: result.error };
  return { success: true };
}
