'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteArticleAction } from './actions';
import { colors, fontFamily } from '@/lib/theme';

export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, pending]);

  function close() {
    if (pending) return;
    setOpen(false);
    setError(null);
  }

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await deleteArticleAction(id);
        if (res?.error) {
          setError(res.error);
          return;
        }
        setOpen(false);
        router.refresh();
      } catch {
        setError('Nie udało się usunąć. Spróbuj ponownie.');
      }
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="tk-admin-ghost-btn"
        style={{
          background: 'transparent',
          border: `1px solid ${colors.line3}`,
          color: colors.muted,
          fontFamily: fontFamily.mono,
          cursor: 'pointer',
        }}
      >
        Usuń
      </button>

      {open && (
        <div
          role="presentation"
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            background: 'rgba(11,10,8,.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              background: colors.bg2,
              border: `1px solid ${colors.line3}`,
              padding: '28px 24px 22px',
              boxShadow: '0 24px 64px rgba(0,0,0,.55)',
            }}
          >
            <div
              style={{
                fontFamily: fontFamily.mono,
                fontSize: 10,
                letterSpacing: '.14em',
                color: colors.accent,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Usuwanie
            </div>
            <h2
              id={titleId}
              style={{
                fontFamily: fontFamily.serif,
                fontWeight: 400,
                fontSize: 24,
                letterSpacing: '-.02em',
                margin: '0 0 12px',
                lineHeight: 1.2,
                color: colors.fg,
              }}
            >
              Usunąć ten artykuł?
            </h2>
            <p
              style={{
                fontFamily: fontFamily.serif,
                fontSize: 15,
                lineHeight: 1.55,
                color: colors.muted2,
                margin: '0 0 8px',
              }}
            >
              „{title}”
            </p>
            <p
              style={{
                fontFamily: fontFamily.mono,
                fontSize: 11,
                lineHeight: 1.5,
                color: colors.muted,
                margin: '0 0 22px',
              }}
            >
              Tej operacji nie można cofnąć.
            </p>

            {error && (
              <p
                role="alert"
                style={{
                  fontFamily: fontFamily.mono,
                  fontSize: 11,
                  color: colors.accent,
                  margin: '0 0 16px',
                }}
              >
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                ref={cancelRef}
                type="button"
                disabled={pending}
                onClick={close}
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.line3}`,
                  color: colors.fg,
                  padding: '10px 16px',
                  fontFamily: fontFamily.mono,
                  fontSize: 11,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  cursor: pending ? 'wait' : 'pointer',
                }}
              >
                Anuluj
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirmDelete}
                style={{
                  background: colors.accent,
                  border: `1px solid ${colors.accent}`,
                  color: colors.bg,
                  padding: '10px 16px',
                  fontFamily: fontFamily.mono,
                  fontSize: 11,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  cursor: pending ? 'wait' : 'pointer',
                  opacity: pending ? 0.7 : 1,
                }}
              >
                {pending ? 'Usuwanie…' : 'Usuń artykuł'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
