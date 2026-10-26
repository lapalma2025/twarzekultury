'use client';

import { useTransition } from 'react';
import { deleteArticleAction } from './actions';
import { colors, fontFamily } from '@/lib/theme';

export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Usunąć artykuł „${title}"? Tej operacji nie można cofnąć.`)) return;
        startTransition(() => deleteArticleAction(id));
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
