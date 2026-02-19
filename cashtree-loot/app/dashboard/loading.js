'use client';

export default function Loading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', width: '100%', minHeight: '300px',
      background: '#030305', overflow: 'hidden',
    }}>
      <style>{`
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
      `}</style>

      <div style={{ position: 'relative' }}>

        {/* 1. Base (dark ghost) */}
        <h1 style={{
          fontSize: '40px', fontWeight: '900', color: '#111',
          margin: 0, letterSpacing: '4px', position: 'relative', zIndex: 1,
          userSelect: 'none',
        }}>
          CASHTREE
        </h1>

        {/* 2. Outline overlay */}
        <h1 style={{
          fontSize: '40px', fontWeight: '900', color: 'transparent',
          WebkitTextStroke: '1px #2a2a2a',
          margin: 0, letterSpacing: '4px',
          position: 'absolute', top: 0, left: 0, zIndex: 2,
          userSelect: 'none',
        }}>
          CASHTREE
        </h1>

        {/* 3. Neon liquid fill */}
        <h1 style={{
          fontSize: '40px', fontWeight: '900',
          margin: 0, letterSpacing: '4px',
          position: 'absolute', top: 0, left: 0, zIndex: 3,
          overflow: 'hidden', width: '0%', whiteSpace: 'nowrap',
          borderRight: '2px solid #00ff88',
          animation: 'fillUp 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          userSelect: 'none',
        }}>
          <span style={{ color: '#fff' }}>CASH</span>
          <span style={{ color: '#00ff88' }}>TREE</span>
        </h1>

        {/* 4. Glow reflection */}
        <div style={{
          position: 'absolute', bottom: '-10px', left: 0, right: 0,
          height: '20px', background: '#00ff88',
          filter: 'blur(28px)', opacity: 0.18,
          animation: 'glowPulse 2.2s infinite',
        }} />

      </div>
    </div>
  );
}