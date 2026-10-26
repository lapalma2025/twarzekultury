'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function ParallaxItem({
  amount,
  style,
  className,
  children,
}: {
  amount: number;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Skip the parallax drift on mobile/tablet — the gallery collapses to a
    // compact stacked grid there, where a large vertical offset just creates
    // ugly gaps instead of the intended editorial-collage effect.
    if (window.innerWidth < 1024) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { y: amount },
        { y: -amount, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } }
      );
    });
    return () => ctx.revert();
  }, [amount]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
