'use client';

export default function Loading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', width: '100%', minHeight: '300px',
      background: '#030305', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

        @keyframes fillUp {
          0%   { width: 0%;   opacity: 0; }
          10%  { opacity: 1; }
          50%  { width: 100%; opacity: 1; }
          90%  { width: 100%; opacity: 1; }
          100% { width: 0%;   opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.1; }
          50%       { opacity: 0.35; }
        }
        @keyframes cursorBlink {
          0%, 100% { border-color: #00ff88; }
          50%      { border-color: transparent; }
        }
        @keyframes scanline {
          0%   { top: -8%; }
          100% { top: 108%; }
        }
        @keyframes fadeInDots {
          0%, 60% { opacity: 0; }
          80%     { opacity: 1; }
          100%    { opacity: 0; }
        }
      `}</style>

      <div style={{ position: 'relative', textAlign: 'center' }}>

        {/* Scanline effect */}
        <div style={{
          position: 'absolute', left: '-20px', right: '-20px',
          height: '4px',
          background: 'linear-gradient(180deg, transparent, rgba(0,255,136,0.08) 50%, transparent)',
          animation: 'scanline 1.8s linear infinite',
          pointerEvents: 'none', zIndex: 10,
        }} />

        {/* Word mark stack */}
        <div style={{ position: 'relative', display: 'inline-block' }}>

          {/* 1. Base (dark ghost) */}
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '52px', fontWeight: '400', color: '#111',
            margin: 0, letterSpacing: '10px', position: 'relative', zIndex: 1,
            userSelect: 'none',
          }}>
            CASHTREE
          </h1>

          {/* 2. Outline overlay */}
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '52px', fontWeight: '400', color: 'transparent',
            WebkitTextStroke: '1px #1e3a2a',
            margin: 0, letterSpacing: '10px',
            position: 'absolute', top: 0, left: 0, zIndex: 2,
            userSelect: 'none',
          }}>
            CASHTREE
          </h1>

          {/* 3. Neon liquid fill */}
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '52px', fontWeight: '400',
            margin: 0, letterSpacing: '10px',
            position: 'absolute', top: 0, left: 0, zIndex: 3,
            overflow: 'hidden', width: '0%', whiteSpace: 'nowrap',
            borderRight: '2px solid #00ff88',
            animation: 'fillUp 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            userSelect: 'none',
          }}>
            <span style={{ color: '#e8ffe4' }}>CASH</span>
            <span style={{ color: '#00ff88' }}>TREE</span>
          </h1>
        </div>

        {/* Loading label */}
        <div style={{
          marginTop: '18px',
          fontFamily: "'Bebas Neue', monospace",
          fontSize: '11px',
          letterSpacing: '6px',
          color: '#1a4a2e',
          animation: 'fadeInDots 2.2s ease-in-out infinite',
          userSelect: 'none',
        }}>
          LOADING
        </div>

        {/* 4. Glow reflection */}
        <div style={{
          position: 'absolute', bottom: '-12px', left: 0, right: 0,
          height: '24px', background: '#00ff88',
          filter: 'blur(32px)', opacity: 0.15,
          animation: 'glowPulse 2.2s infinite',
        }} />

        {/* Floor reflection */}
        <div style={{
          position: 'absolute', bottom: '-40px', left: '10%', right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #00ff8822, #00ff8844, #00ff8822, transparent)',
        }} />

      </div>
    </div>
  );
}
