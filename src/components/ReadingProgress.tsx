'use client';

import { useEffect, useRef } from 'react';
import { colors } from '@/lib/theme';

export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const pct = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      if (ref.current) ref.current.style.width = `${Math.max(0, Math.min(1, pct)) * 100}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div ref={ref} style={{ position: 'fixed', top: 0, left: 0, height: 2, background: colors.accent, zIndex: 250, width: '0%' }} />;
}
