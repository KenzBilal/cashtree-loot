'use client';

const KEYFRAMES = `
  @keyframes fillUp {
    0%   { width: 0%;    opacity: 0; }
    10%  { width: 0%;    opacity: 1; }
    50%  { width: 100%;  opacity: 1; }
    90%  { width: 100%;  opacity: 1; }
    100% { width: 0%;    opacity: 0; }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.1; }
    50%       { opacity: 0.4; }
  }
`;

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading campaigns…"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', width: '100%', minHeight: '300px',
        background: '#000', overflow: 'hidden',
      }}
    >
      {/* Inject keyframes via a plain <style> tag — safe in App Router client components */}
      <style>{KEYFRAMES}</style>

      <div style={{ position: 'relative', userSelect: 'none' }}>

        {/* Layer 1 — dim base text */}
        <h1 style={{
          fontSize: '40px', fontWeight: '900', color: '#111',
          margin: 0, letterSpacing: '4px',
          position: 'relative', zIndex: 1,
          // Reserve the full width so layers 2 & 3 position correctly
        }} aria-hidden="true">
          CASHTREE
        </h1>

        {/* Layer 2 — outline stroke */}
        <h1 style={{
          fontSize: '40px', fontWeight: '900', color: 'transparent',
          WebkitTextStroke: '1px #333',
          margin: 0, letterSpacing: '4px',
          position: 'absolute', top: 0, left: 0, zIndex: 2,
          whiteSpace: 'nowrap',
        }} aria-hidden="true">
          CASHTREE
        </h1>

        {/* Layer 3 — animated neon fill */}
        <h1 style={{
          fontSize: '40px', fontWeight: '900',
          margin: 0, letterSpacing: '4px',
          position: 'absolute', top: 0, left: 0, zIndex: 3,
          overflow: 'hidden', whiteSpace: 'nowrap',
          // Laser-line cursor on the right edge
          borderRight: '2px solid #00ff88',
          // Animate width from 0 → 100 → 0
          animation: 'fillUp 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        }} aria-hidden="true">
          <span style={{ color: '#fff' }}>CASH</span>
          <span style={{ color: '#00ff88' }}>TREE</span>
        </h1>

        {/* Layer 4 — glow reflection beneath the text */}
        <div style={{
          position: 'absolute', bottom: '-10px', left: 0, right: 0,
          height: '20px',
          background: '#00ff88',
          filter: 'blur(30px)',
          animation: 'glowPulse 2.2s ease-in-out infinite',
          pointerEvents: 'none',
        }} aria-hidden="true" />

      </div>
    </div>
  );
}