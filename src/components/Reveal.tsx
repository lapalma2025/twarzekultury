'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface RevealProps {
  children: React.ReactNode;
  as?: 'div' | 'a' | 'article';
  href?: string;
  style?: React.CSSProperties;
  className?: string;
}

/** Client-side equivalent of the original design's [data-reveal] GSAP fade-up. */
export function Reveal({ children, as = 'div', href, style, className }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y: 60, opacity: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 88%' },
      });
    });
    return () => ctx.revert();
  }, []);

  const Tag = as as any;
  return (
    <Tag ref={ref} href={href} style={style} className={className}>
      {children}
    </Tag>
  );
}
