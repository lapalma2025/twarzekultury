'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useCallback, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { uploadImageAction } from '../articles/upload';
import { colors, fontFamily } from '@/lib/theme';
import type { GalleryFrame } from '@/lib/types';
import { updateGalleryAction, type GalleryFormState } from './actions';

const initialState: GalleryFormState = {};

/** Desktop aspect ratios for each homepage gallery slot. */
const SLOT_RATIO: Record<GalleryFrame['slot'], string> = {
  1: '3/4',
  2: '1/1',
  3: '3/4',
  4: '4/3',
  5: '4/3',
};

function parsePosition(pos: string | null | undefined): { x: number; y: number } {
  const m = /^(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%$/.exec((pos || '').trim());
  if (!m) return { x: 50, y: 20 };
  return { x: Math.min(100, Math.max(0, parseFloat(m[1]))), y: Math.min(100, Math.max(0, parseFloat(m[2]))) };
}

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
  const [point, setPoint] = useState(() => parsePosition(frame.imagePosition));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const pickerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const positionValue = `${point.x.toFixed(1)}% ${point.y.toFixed(1)}%`;
  const ratio = SLOT_RATIO[frame.slot];

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set('file', file);
    startTransition(async () => {
      const res = await uploadImageAction(fd);
      if (res.error) setError(res.error);
      else if (res.url) {
        setUrl(res.url);
        setPoint({ x: 50, y: 20 });
      }
    });
  }

  const updatePointFromEvent = useCallback((e: { clientX: number; clientY: number }) => {
    const el = pickerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setPoint({ x, y });
  }, []);

  return (
    <div style={{ border: `1px solid ${colors.line3}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.1em', color: colors.accent, textTransform: 'uppercase' }}>
        Kadr {frame.slot} · proporcje {ratio.replace('/', ':')}
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(160px, 220px) 1fr', alignItems: 'start' }}>
        <div>
          {url ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.08em', color: colors.muted, textTransform: 'uppercase' }}>
                Kliknij / przeciągnij punkt kadrowania
              </span>
              <div
                ref={pickerRef}
                onPointerDown={(e) => {
                  draggingRef.current = true;
                  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                  updatePointFromEvent(e);
                }}
                onPointerMove={(e) => {
                  if (draggingRef.current) updatePointFromEvent(e);
                }}
                onPointerUp={() => {
                  draggingRef.current = false;
                }}
                style={{
                  position: 'relative', width: '100%', aspectRatio: ratio,
                  border: `1px solid ${colors.line3}`, cursor: 'crosshair', touchAction: 'none', userSelect: 'none',
                  background: '#141210', overflow: 'hidden',
                }}
              >
                <Image src={url} alt="" fill sizes="220px" style={{ objectFit: 'cover', objectPosition: positionValue }} unoptimized />
                <div
                  aria-hidden
                  style={{
                    position: 'absolute', left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%, -50%)',
                    width: 18, height: 18, borderRadius: '50%', border: `2px solid ${colors.accent}`,
                    boxShadow: '0 0 0 2px rgba(11,10,8,.8)', pointerEvents: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'Na stronie', r: ratio },
                  { label: 'Mobile 1:1', r: '1/1' },
                ].map((p) => (
                  <div key={p.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ position: 'relative', width: 72, aspectRatio: p.r, overflow: 'hidden', border: `1px solid ${colors.line3}` }}>
                      <Image src={url} alt="" fill sizes="72px" style={{ objectFit: 'cover', objectPosition: positionValue }} unoptimized />
                    </div>
                    <span style={{ fontFamily: fontFamily.mono, fontSize: 9, color: colors.muted, textTransform: 'uppercase' }}>{p.label}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPoint({ x: 50, y: 20 })}
                style={{
                  alignSelf: 'flex-start', background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.muted,
                  padding: '6px 12px', fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
                }}
              >
                Domyślnie (góra)
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', aspectRatio: ratio, background: '#141210', border: `1px solid ${colors.line}`, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: colors.muted, fontFamily: fontFamily.mono, fontSize: 10 }}>Brak zdjęcia</div>
            </div>
          )}

          <label
            style={{
              display: 'block', marginTop: 10, textAlign: 'center', cursor: pending ? 'wait' : 'pointer',
              border: `1px solid ${colors.line3}`, padding: '8px 10px',
              fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase',
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? 'Wgrywanie…' : url ? 'Zmień zdjęcie' : 'Wgraj zdjęcie'}
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
          <input type="hidden" name={`imagePosition_${frame.slot}`} value={positionValue} />
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
          <p style={{ margin: 0, fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, lineHeight: 1.5 }}>
            Przesuń punkt na twarzy / ważnym fragmencie — podgląd pokazuje, jak kadr wytnie się na stronie głównej.
          </p>
        </div>
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
