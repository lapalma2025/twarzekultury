'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { uploadImageAction } from './upload';
import { colors, fontFamily } from '@/lib/theme';

function parsePosition(pos: string | null | undefined): { x: number; y: number } {
  const m = /^(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%$/.exec((pos || '').trim());
  if (!m) return { x: 50, y: 50 };
  return { x: Math.min(100, Math.max(0, parseFloat(m[1]))), y: Math.min(100, Math.max(0, parseFloat(m[2]))) };
}

const PREVIEWS = [
  { label: 'Hero (4:5)', ratio: '4/5' },
  { label: 'Kafelek (16:9)', ratio: '16/9' },
  { label: 'Kwadrat (1:1)', ratio: '1/1' },
];

export function CoverImageUploader({
  name,
  positionName,
  defaultValue,
  defaultPosition,
}: {
  name: string;
  positionName: string;
  defaultValue: string | null;
  defaultPosition?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? '');
  const [point, setPoint] = useState(() => parsePosition(defaultPosition));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const pickerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const positionValue = `${point.x.toFixed(1)}% ${point.y.toFixed(1)}%`;

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
        setPoint({ x: 50, y: 50 });
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input type="hidden" name={name} value={url} />
      <input type="hidden" name={positionName} value={positionValue} />

      {url && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.08em', color: colors.muted, textTransform: 'uppercase' }}>
            Kliknij lub przeciągnij na zdjęciu, aby ustawić kadrowanie
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
              position: 'relative', width: '100%', maxWidth: 420, aspectRatio: '4/3',
              border: `1px solid ${colors.line3}`, cursor: 'crosshair', touchAction: 'none', userSelect: 'none',
            }}
          >
            <Image src={url} alt="" fill sizes="420px" style={{ objectFit: 'cover', objectPosition: positionValue }} unoptimized />
            <div
              aria-hidden
              style={{
                position: 'absolute', left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%, -50%)',
                width: 18, height: 18, borderRadius: '50%', border: `2px solid ${colors.accent}`,
                boxShadow: '0 0 0 2px rgba(11,10,8,.8)', pointerEvents: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {PREVIEWS.map((p) => (
              <div key={p.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ position: 'relative', width: 96, aspectRatio: p.ratio, overflow: 'hidden', border: `1px solid ${colors.line3}` }}>
                  <Image src={url} alt="" fill sizes="96px" style={{ objectFit: 'cover', objectPosition: positionValue }} unoptimized />
                </div>
                <span style={{ fontFamily: fontFamily.mono, fontSize: 9, color: colors.muted, textTransform: 'uppercase' }}>{p.label}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPoint({ x: 50, y: 50 })}
            style={{
              alignSelf: 'flex-start', background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.muted,
              padding: '6px 12px', fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Wyśrodkuj
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => handleFile(e.target.files?.[0])}
          style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.muted }}
        />
        {pending && <span style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted }}>Wgrywanie…</span>}
      </div>
      <input
        type="url"
        placeholder="…albo wklej URL zdjęcia"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.fg, padding: '8px 10px', fontSize: 13, maxWidth: 360 }}
      />
      {error && (
        <span role="alert" style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.accent }}>
          {error}
        </span>
      )}
    </div>
  );
}
