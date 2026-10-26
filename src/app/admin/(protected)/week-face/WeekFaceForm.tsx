'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { colors, fontFamily } from '@/lib/theme';
import type { Article } from '@/lib/types';
import { updateWeekFaceAction, type WeekFaceFormState } from './actions';

const initialState: WeekFaceFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        background: colors.accent, color: colors.bg, border: 0, padding: '14px 24px',
        fontFamily: fontFamily.mono, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase',
        cursor: pending ? 'wait' : 'pointer', opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? 'Zapisywanie…' : 'Ustaw jako twarz tygodnia'}
    </button>
  );
}

export function WeekFaceForm({ articles, currentId }: { articles: Article[]; currentId: string | null }) {
  const [state, formAction] = useFormState(updateWeekFaceAction, initialState);

  if (articles.length === 0) {
    return (
      <p style={{ color: colors.muted, fontFamily: fontFamily.serif }}>
        Brak opublikowanych artykułów. Najpierw dodaj i opublikuj artykuł.
      </p>
    );
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {articles.map((a) => {
          const selected = a.id === currentId;
          return (
            <label
              key={a.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 72px 1fr',
                gap: 14,
                alignItems: 'center',
                padding: 12,
                border: `1px solid ${selected ? colors.accent : colors.line3}`,
                cursor: 'pointer',
                background: selected ? 'rgba(232,93,60,.06)' : 'transparent',
              }}
            >
              <input type="radio" name="articleId" value={a.id} defaultChecked={selected || (!currentId && a.id === articles[0].id)} />
              <div style={{ position: 'relative', width: 72, aspectRatio: '4/5', background: '#141210', overflow: 'hidden' }}>
                {a.coverImageUrl ? (
                  <Image src={a.coverImageUrl} alt="" fill sizes="72px" style={{ objectFit: 'cover' }} unoptimized />
                ) : null}
              </div>
              <div>
                <div style={{ fontFamily: fontFamily.serif, fontSize: 17, marginBottom: 4 }}>{a.title.pl}</div>
                <div style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                  {a.category} · {a.author}
                  {selected ? ' · aktualna' : ''}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {state.error && (
        <div role="alert" style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.accent }}>{state.error}</div>
      )}
      {state.success && (
        <div style={{ fontFamily: fontFamily.mono, fontSize: 12, color: '#7CCB8C' }}>
          Zapisano. Ta twarz tygodnia jest teraz na górze strony głównej.
        </div>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
