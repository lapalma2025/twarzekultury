'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function VinylIcon() {
  const box = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!box.current) return;
    const wrap = box.current.closest('[data-tk-anim]') as HTMLElement;
    const section = wrap.closest('[data-tk-section]') || wrap;
    const disc = box.current.querySelector('[data-vinyl-disc]');

    const ctx = gsap.context(() => {
      gsap.to(disc, { rotation: 720, transformOrigin: '100px 100px', ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.from(wrap, { scale: 0.6, opacity: 0, rotation: -40, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 75%' } });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div data-tk-anim style={{ marginTop: 56, width: '100%', aspectRatio: '1/1', maxWidth: 340, position: 'relative' }}>
      <svg ref={box} viewBox="0 0 200 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <radialGradient id="tk-vinyl" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#141210" />
            <stop offset="45%" stopColor="#0B0A08" />
            <stop offset="46%" stopColor="#1a1815" />
            <stop offset="100%" stopColor="#050403" />
          </radialGradient>
        </defs>
        <g data-vinyl-disc style={{ transformOrigin: '100px 100px', transformBox: 'fill-box' }}>
          <circle cx="100" cy="100" r="98" fill="url(#tk-vinyl)" />
          <circle cx="100" cy="100" r="98" fill="none" stroke="#F2ECDD" strokeOpacity=".04" strokeWidth="1" />
          <g fill="none" stroke="#F2ECDD" strokeOpacity=".08">
            <circle cx="100" cy="100" r="88" />
            <circle cx="100" cy="100" r="80" />
            <circle cx="100" cy="100" r="72" />
            <circle cx="100" cy="100" r="64" />
            <circle cx="100" cy="100" r="56" />
            <circle cx="100" cy="100" r="48" />
          </g>
          <path d="M100 6 A94 94 0 0 1 194 100" stroke="#F2ECDD" strokeOpacity=".18" strokeWidth="1" fill="none" />
          <circle cx="100" cy="100" r="34" fill="#E85D3C" />
          <circle cx="100" cy="100" r="34" fill="none" stroke="#0B0A08" strokeOpacity=".2" />
          <circle cx="100" cy="100" r="4" fill="#0B0A08" />
          <circle cx="100" cy="100" r="1.2" fill="#F2ECDD" />
        </g>
      </svg>
    </div>
  );
}
