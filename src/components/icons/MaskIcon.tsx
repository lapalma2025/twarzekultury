'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function MaskIcon() {
  const box = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!box.current) return;
    const wrap = box.current.closest('[data-tk-anim]') as HTMLElement;
    const section = wrap.closest('[data-tk-section]') || wrap;
    const body = box.current.querySelector('[data-mask-body]');
    const ribL = box.current.querySelector('[data-mask-ribbon="L"]');
    const ribR = box.current.querySelector('[data-mask-ribbon="R"]');

    const ctx = gsap.context(() => {
      gsap.from(wrap, { y: 40, opacity: 0, rotation: -20, scale: 0.7, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 80%' } });
      gsap.to(body, { rotation: 4, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '100px 100px' });
      gsap.to(wrap, { y: -8, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to(ribL, { rotation: 8, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '22px 100px' });
      gsap.to(ribR, { rotation: -8, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '178px 100px', delay: 0.4 });
      gsap.to(body, { rotation: '+=18', ease: 'none', transformOrigin: '100px 100px', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.4 } });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div data-tk-anim style={{ width: 140, height: 140, flexShrink: 0, position: 'relative' }}>
      <svg ref={box} viewBox="0 0 200 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <g data-mask-ribbon="L" stroke="#E85D3C" strokeWidth="2" fill="none" style={{ transformOrigin: '22px 100px', transformBox: 'fill-box' }}>
          <path d="M22 100 Q6 116 12 138 Q22 160 8 178" />
        </g>
        <g data-mask-ribbon="R" stroke="#E85D3C" strokeWidth="2" fill="none" style={{ transformOrigin: '178px 100px', transformBox: 'fill-box' }}>
          <path d="M178 100 Q194 116 188 138 Q178 160 192 178" />
        </g>
        <g data-mask-body style={{ transformOrigin: '100px 100px', transformBox: 'fill-box' }}>
          <path
            d="M22 100 Q26 68 60 62 Q80 58 100 66 Q120 58 140 62 Q174 68 178 100 Q178 128 158 138 Q138 148 122 138 Q110 130 100 130 Q90 130 78 138 Q62 148 42 138 Q22 128 22 100 Z"
            fill="#141210" stroke="#F2ECDD" strokeOpacity=".75" strokeWidth="1.5"
          />
          <path d="M46 96 Q58 84 76 90 Q86 94 84 104 Q80 116 64 116 Q48 116 46 106 Z" fill="#0B0A08" stroke="#F2ECDD" strokeOpacity=".5" strokeWidth="1" />
          <path d="M116 90 Q134 84 154 96 Q154 106 152 108 Q150 116 136 116 Q120 116 116 104 Q114 94 116 90 Z" fill="#0B0A08" stroke="#F2ECDD" strokeOpacity=".5" strokeWidth="1" />
          <path d="M74 116 Q74 124 78 130 Q80 132 82 130 Q84 124 82 118 Z" fill="#E85D3C" />
          <path d="M100 66 Q98 76 100 90" stroke="#F2ECDD" strokeOpacity=".35" strokeWidth="1" fill="none" />
          <circle cx="100" cy="90" r="2" fill="#E85D3C" />
          <path d="M32 92 Q40 86 48 88" stroke="#F2ECDD" strokeOpacity=".3" strokeWidth="1" fill="none" />
          <path d="M152 88 Q160 86 168 92" stroke="#F2ECDD" strokeOpacity=".3" strokeWidth="1" fill="none" />
        </g>
      </svg>
    </div>
  );
}
