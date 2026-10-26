export function GrainVignette() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: '-50%', pointerEvents: 'none', zIndex: 200,
          opacity: 0.08, mixBlendMode: 'overlay',
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')",
          animation: 'tk-grain 1.6s steps(6) infinite',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 150,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.55) 100%)',
        }}
      />
    </>
  );
}
