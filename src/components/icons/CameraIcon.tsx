'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function CameraIcon() {
  const box = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!box.current) return;
    const wrap = box.current.closest('[data-tk-anim]') as HTMLElement;
    const section = wrap.closest('[data-tk-section]') || wrap;
    const reels = box.current.querySelectorAll('[data-cam-reel]');
    const rec = box.current.querySelector('[data-cam-rec]');
    const body = box.current.querySelector('[data-cam-body]');

    const ctx = gsap.context(() => {
      reels.forEach((r) => {
        const dir = parseFloat((r as HTMLElement).dataset.dir || '1');
        gsap.to(r, { rotation: 220 * dir, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 2.5 } });
      });
      gsap.to(rec, { opacity: 0.2, duration: 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.from(wrap, { x: -80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 75%' } });
      gsap.to(body, { rotation: 8, transformOrigin: '100px 110px', ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 2 } });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div data-tk-anim style={{ marginTop: 56, width: '100%', aspectRatio: '1/1', maxWidth: 340, position: 'relative' }}>
      <svg ref={box} viewBox="0 0 200 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <g data-cam-body>
          <rect x="40" y="82" width="90" height="56" rx="4" fill="#141210" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.5" />
          <rect x="128" y="94" width="34" height="32" fill="#141210" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.5" />
          <circle cx="145" cy="110" r="10" fill="#0B0A08" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.5" />
          <circle cx="145" cy="110" r="5" fill="#E85D3C" />
          <rect x="52" y="72" width="26" height="14" fill="#141210" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.5" />
          <g data-cam-reel data-dir="1" style={{ transformOrigin: '70px 60px', transformBox: 'fill-box' }}>
            <circle cx="70" cy="60" r="26" fill="#141210" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.5" />
            <circle cx="70" cy="60" r="20" fill="none" stroke="#F2ECDD" strokeOpacity=".2" />
            <circle cx="70" cy="60" r="4" fill="#F2ECDD" fillOpacity=".8" />
            <line x1="70" y1="36" x2="70" y2="84" stroke="#F2ECDD" strokeOpacity=".3" strokeWidth="1" />
            <line x1="46" y1="60" x2="94" y2="60" stroke="#F2ECDD" strokeOpacity=".3" strokeWidth="1" />
          </g>
          <g data-cam-reel data-dir="-1" style={{ transformOrigin: '110px 60px', transformBox: 'fill-box' }}>
            <circle cx="110" cy="60" r="22" fill="#141210" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.5" />
            <circle cx="110" cy="60" r="16" fill="none" stroke="#F2ECDD" strokeOpacity=".2" />
            <circle cx="110" cy="60" r="3.5" fill="#F2ECDD" fillOpacity=".8" />
            <line x1="110" y1="40" x2="110" y2="80" stroke="#F2ECDD" strokeOpacity=".3" strokeWidth="1" />
            <line x1="90" y1="60" x2="130" y2="60" stroke="#F2ECDD" strokeOpacity=".3" strokeWidth="1" />
          </g>
          <rect x="60" y="138" width="10" height="20" fill="#141210" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.5" />
          <circle data-cam-rec cx="55" cy="95" r="3" fill="#E85D3C" />
          <text x="63" y="98" fill="#F2ECDD" fillOpacity=".7" fontFamily="JetBrains Mono, monospace" fontSize="6" letterSpacing="1">REC</text>
        </g>
      </svg>
    </div>
  );
}
