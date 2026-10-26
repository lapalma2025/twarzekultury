'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useTransition } from 'react';
import Image from 'next/image';
import { uploadImageAction } from '../articles/upload';
import { colors, fontFamily } from '@/lib/theme';
import type { GalleryFrame } from '@/lib/types';
import { updateGalleryAction, type GalleryFormState } from './actions';

const initialState: GalleryFormState = {};

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
      {pending ? 'Zapisywanie…' : 'Zapisz galerię'}
    </button>
  );
}

function SlotEditor({ frame }: { frame: GalleryFrame }) {
  const [url, setUrl] = useState(frame.imageUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set('file', file);
    startTransition(async () => {
      const res = await uploadImageAction(fd);
      if (res.error) setError(res.error);
      else if (res.url) setUrl(res.url);
    });
  }

  return (
    <div style={{ border: `1px solid ${colors.line3}`, padding: 20, display: 'grid', gap: 16, gridTemplateColumns: '160px 1fr' }}>
      <div>
        <div style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.1em', color: colors.accent, textTransform: 'uppercase', marginBottom: 10 }}>
          Kadr {frame.slot}
        </div>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#141210', border: `1px solid ${colors.line}`, overflow: 'hidden' }}>
          {url ? (
            <Image src={url} alt="" fill sizes="160px" style={{ objectFit: 'cover', objectPosition: 'top' }} unoptimized />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: colors.muted, fontFamily: fontFamily.mono, fontSize: 10 }}>Brak</div>
          )}
        </div>
        <label
          style={{
            display: 'block', marginTop: 10, textAlign: 'center', cursor: pending ? 'wait' : 'pointer',
            border: `1px solid ${colors.line3}`, padding: '8px 10px',
            fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase',
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? 'Wgrywanie…' : 'Zmień zdjęcie'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            disabled={pending}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
        {error && <div style={{ marginTop: 8, color: colors.accent, fontFamily: fontFamily.mono, fontSize: 11 }}>{error}</div>}
        <input type="hidden" name={`imageUrl_${frame.slot}`} value={url} />
        <input type="hidden" name={`parallax_${frame.slot}`} value={frame.parallax} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.08em', color: colors.muted, textTransform: 'uppercase' }}>Podpis PL</span>
          <input
            name={`altPl_${frame.slot}`}
            defaultValue={frame.alt.pl}
            maxLength={200}
            style={{ background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.fg, padding: '10px 12px', fontSize: 14 }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.08em', color: colors.muted, textTransform: 'uppercase' }}>Podpis EN</span>
          <input
            name={`altEn_${frame.slot}`}
            defaultValue={frame.alt.en}
            maxLength={200}
            style={{ background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.fg, padding: '10px 12px', fontSize: 14 }}
          />
        </label>
      </div>
    </div>
  );
}

export function GalleryForm({ initial }: { initial: GalleryFrame[] }) {
  const [state, formAction] = useFormState(updateGalleryAction, initialState);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {initial.map((frame) => (
        <SlotEditor key={frame.slot} frame={frame} />
      ))}

      {state.error && (
        <div role="alert" style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.accent }}>{state.error}</div>
      )}
      {state.success && (
        <div style={{ fontFamily: fontFamily.mono, fontSize: 12, color: '#7CCB8C' }}>Zapisano. Galeria na stronie głównej jest zaktualizowana.</div>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
