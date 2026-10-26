'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface SplitProps {
  text: string;
  mode: 'chars' | 'words';
  style?: React.CSSProperties;
}

/** Renders pre-split spans (SSR-safe) and animates them in on scroll — a
 * React-friendly equivalent of the original vanilla-JS char/word splitter. */
export function SplitText({ text, mode, style }: SplitProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const spans = ref.current.querySelectorAll('span[data-unit]');
    if (!spans.length) return;

    const ctx = gsap.context(() => {
      gsap.from(spans, {
        yPercent: mode === 'chars' ? 110 : 120,
        opacity: 0,
        duration: mode === 'chars' ? 1.1 : 1.2,
        ease: 'expo.out',
        stagger: mode === 'chars' ? { each: 0.02, from: 'start' } : 0.035,
        scrollTrigger: { trigger: ref.current, start: mode === 'chars' ? 'top 85%' : 'top 90%' },
      });
    });
    return () => ctx.revert();
  }, [mode]);

  const units = mode === 'chars' ? [...text] : text.split(/(\s+)/);

  return (
    <span ref={ref} style={style}>
      {units.map((u, i) =>
        /^\s+$/.test(u) || u === '' ? (
          <span key={i}>{u}</span>
        ) : (
          <span key={i} data-unit style={{ display: 'inline-block' }}>
            {u}
          </span>
        )
      )}
    </span>
  );
}
