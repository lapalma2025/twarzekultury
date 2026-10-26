'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function BagIcon() {
  const box = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!box.current) return;
    const wrap = box.current.closest('[data-tk-anim]') as HTMLElement;
    const section = wrap.closest('[data-tk-section]') || wrap;
    const swing = box.current.querySelector('[data-bag-swing]');
    const impact = box.current.querySelector('[data-bag-impact]');

    const ctx = gsap.context(() => {
      gsap.from(wrap, { y: -30, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 75%' } });
      gsap.to(swing, { rotation: 3, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '100px 18px' });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play pause resume pause' } });
      tl.to(swing, { rotation: -14, duration: 0.18, ease: 'power3.out', transformOrigin: '100px 18px' })
        .to(impact, { opacity: 1, scale: 1.4, duration: 0.14, ease: 'power2.out', transformOrigin: '135px 130px' }, '<')
        .to(impact, { opacity: 0, scale: 0.6, duration: 0.3, ease: 'power2.in', transformOrigin: '135px 130px' })
        .to(swing, { rotation: 8, duration: 0.9, ease: 'elastic.out(1,0.4)', transformOrigin: '100px 18px' }, '<-0.1')
        .to(swing, { rotation: 0, duration: 0.6, ease: 'sine.inOut', transformOrigin: '100px 18px' });

      gsap.to(swing, { rotation: '+=6', ease: 'none', transformOrigin: '100px 18px', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 2 } });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div data-tk-anim style={{ marginTop: 56, width: '100%', aspectRatio: '1/1', maxWidth: 340, position: 'relative' }}>
      <svg ref={box} viewBox="0 0 200 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <line x1="10" y1="14" x2="190" y2="14" stroke="#F2ECDD" strokeOpacity=".25" strokeWidth="1.5" />
        <rect x="92" y="10" width="16" height="8" fill="#F2ECDD" fillOpacity=".5" />
        <g data-bag-swing style={{ transformOrigin: '100px 18px', transformBox: 'fill-box' }}>
          <g stroke="#F2ECDD" strokeOpacity=".55" strokeWidth="1.4" fill="none">
            <path d="M100 18 L100 30" />
            <ellipse cx="100" cy="34" rx="4" ry="3" />
            <ellipse cx="100" cy="40" rx="3" ry="4" />
            <ellipse cx="100" cy="46" rx="4" ry="3" />
            <ellipse cx="100" cy="52" rx="3" ry="4" />
            <ellipse cx="100" cy="58" rx="4" ry="3" />
          </g>
          <path d="M84 66 Q100 60 116 66 L114 76 L86 76 Z" fill="#141210" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.4" />
          <path d="M76 78 Q70 90 72 108 L72 168 Q72 186 100 190 Q128 186 128 168 L128 108 Q130 90 124 78 Z" fill="#E85D3C" stroke="#0B0A08" strokeWidth="1.5" />
          <path d="M82 92 Q80 108 82 140" stroke="#0B0A08" strokeOpacity=".25" strokeWidth="1" fill="none" />
          <path d="M118 92 Q120 108 118 140" stroke="#F2ECDD" strokeOpacity=".18" strokeWidth="1" fill="none" />
          <line x1="72" y1="118" x2="128" y2="118" stroke="#0B0A08" strokeOpacity=".4" strokeWidth="1.2" />
          <line x1="72" y1="152" x2="128" y2="152" stroke="#0B0A08" strokeOpacity=".4" strokeWidth="1.2" />
          <text x="100" y="138" textAnchor="middle" fill="#0B0A08" fontFamily="JetBrains Mono, monospace" fontSize="7" letterSpacing="2">TK</text>
        </g>
        <g data-bag-impact style={{ transformOrigin: '135px 130px', transformBox: 'fill-box' }} opacity="0">
          <path d="M135 118 L142 126 L152 122 L146 132 L156 138 L144 138 L142 148 L134 140 L124 144 L130 134 L120 128 L132 128 Z" fill="#F2ECDD" fillOpacity=".9" />
        </g>
      </svg>
    </div>
  );
}
