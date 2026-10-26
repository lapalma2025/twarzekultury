'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function GamepadIcon() {
  const box = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!box.current) return;
    const wrap = box.current.closest('[data-tk-anim]') as HTMLElement;
    const section = wrap.closest('[data-tk-section]') || wrap;
    const bodyG = box.current.querySelector('[data-pad-body]');
    const dpad = box.current.querySelector('[data-pad-dpad]');
    const sticks = box.current.querySelectorAll('[data-pad-stick]');
    const btns = box.current.querySelectorAll('[data-pad-btn]');

    const ctx = gsap.context(() => {
      gsap.from(wrap, { y: 80, opacity: 0, rotation: -12, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 75%' } });
      gsap.to(bodyG, { rotation: 14, transformOrigin: '110px 110px', ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
      sticks.forEach((s, i) => {
        gsap.to(s, { x: 'random(-3,3)', y: 'random(-3,3)', duration: 0.6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.2 });
      });
      const btnTl = gsap.timeline({ repeat: -1 });
      btns.forEach((b) => {
        btnTl.to(b, { fill: '#E85D3C', duration: 0.12 }).to(b, { fill: '#0B0A08', duration: 0.28, delay: 0.15 });
      });
      gsap.to(dpad, { rotation: 8, duration: 0.4, repeat: -1, yoyo: true, ease: 'power1.inOut', transformOrigin: '66px 100px' });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div data-tk-anim style={{ marginTop: 56, width: '100%', aspectRatio: '1/1', maxWidth: 340, position: 'relative' }}>
      <svg ref={box} viewBox="0 0 220 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <g data-pad-body style={{ transformOrigin: '110px 110px', transformBox: 'fill-box' }}>
          <path
            d="M40 80 Q50 60 78 62 L142 62 Q170 60 180 80 Q198 118 178 138 Q160 152 144 138 L134 128 L86 128 L76 138 Q60 152 42 138 Q22 118 40 80 Z"
            fill="#141210" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.5"
          />
          <g data-pad-dpad style={{ transformOrigin: '66px 100px', transformBox: 'fill-box' }}>
            <rect x="60" y="86" width="12" height="28" rx="1.5" fill="#0B0A08" stroke="#F2ECDD" strokeOpacity=".5" strokeWidth="1" />
            <rect x="52" y="94" width="28" height="12" rx="1.5" fill="#0B0A08" stroke="#F2ECDD" strokeOpacity=".5" strokeWidth="1" />
          </g>
          <circle data-pad-btn="1" cx="150" cy="86" r="6" fill="#0B0A08" stroke="#E85D3C" strokeWidth="1.5" />
          <circle data-pad-btn="2" cx="166" cy="100" r="6" fill="#0B0A08" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.5" />
          <circle data-pad-btn="3" cx="150" cy="114" r="6" fill="#0B0A08" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.5" />
          <circle data-pad-btn="4" cx="134" cy="100" r="6" fill="#0B0A08" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1.5" />
          <circle cx="94" cy="118" r="10" fill="#0B0A08" stroke="#F2ECDD" strokeOpacity=".5" strokeWidth="1" />
          <circle data-pad-stick="L" cx="94" cy="118" r="6" fill="#141210" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1" />
          <circle cx="122" cy="118" r="10" fill="#0B0A08" stroke="#F2ECDD" strokeOpacity=".5" strokeWidth="1" />
          <circle data-pad-stick="R" cx="122" cy="118" r="6" fill="#141210" stroke="#F2ECDD" strokeOpacity=".7" strokeWidth="1" />
          <rect x="106" y="80" width="8" height="2" rx="1" fill="#E85D3C" />
          <text x="110" y="76" textAnchor="middle" fill="#8B857A" fontFamily="JetBrains Mono, monospace" fontSize="5" letterSpacing="1">TK-01</text>
        </g>
      </svg>
    </div>
  );
}
