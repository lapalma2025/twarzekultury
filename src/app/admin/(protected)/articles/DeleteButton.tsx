'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteArticleAction } from './actions';
import { colors, fontFamily } from '@/lib/theme';

export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Usunąć artykuł „${title}"? Tej operacji nie można cofnąć.`)) return;
        startTransition(async () => {
          try {
            await deleteArticleAction(id);
            router.refresh();
          } catch {
            // Server action / network failure — leave list as-is; user can retry.
          }
        });
      }}
      style={{
        background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.muted,
        padding: '6px 10px', fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.06em',
        textTransform: 'uppercase', cursor: pending ? 'wait' : 'pointer',
      }}
    >
      {pending ? '…' : 'Usuń'}
    </button>
  );
}
