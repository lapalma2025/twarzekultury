'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registered once at module scope. Importing gsap/ScrollTrigger statically
// (instead of via dynamic import()) keeps effect setup synchronous, which
// matters for React 18 StrictMode's dev-only mount→cleanup→mount cycle:
// gsap.context(...)/ctx.revert() must run in the same tick to avoid
// "zombie" animations created by a stale async callback that resumes after
// cleanup already fired.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Re-run ScrollTrigger's measurements once web fonts have settled, so
  // trigger start/end pixel positions aren't computed against pre-font-load
  // layout (which would otherwise throw off scroll-scrubbed animations).
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

export { gsap, ScrollTrigger };
