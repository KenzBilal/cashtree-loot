'use client';

export default function Loading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', width: '100%', minHeight: '300px',
      background: '#000', overflow: 'hidden'
    }}>
      <div style={{position: 'relative'}}>
        
        {/* The Base Text (Dimmed) */}
        <h1 style={{
          fontSize: '40px', fontWeight: '900', color: '#111', 
          margin: 0, letterSpacing: '4px', position: 'relative', zIndex: 1
        }}>
          CASHTREE
        </h1>

        {/* The "Hollow" Overlay */}
        <h1 style={{
          fontSize: '40px', fontWeight: '900', color: 'transparent', 
          WebkitTextStroke: '1px #333',
          margin: 0, letterSpacing: '4px', position: 'absolute', top: 0, left: 0, zIndex: 2
        }}>
          CASHTREE
        </h1>

        {/* The Neon Liquid Fill (Animated) */}
        <h1 className="liquid-text" style={{
          fontSize: '40px', fontWeight: '900', color: '#00ff88', 
          margin: 0, letterSpacing: '4px', position: 'absolute', top: 0, left: 0, zIndex: 3,
          overflow: 'hidden', width: '0%', whiteSpace: 'nowrap',
          borderRight: '2px solid #00ff88', // The laser line
          animation: 'fillUp 3s cubic-bezier(0.4, 0, 0.2, 1) infinite'
        }}>
          CASHTREE
        </h1>
        
        {/* Reflection/Glow below */}
        <div style={{
           position: 'absolute', bottom: '-10px', left: '0', right: '0', 
           height: '20px', background: '#00ff88', filter: 'blur(30px)', opacity: 0.2,
           animation: 'pulse 3s infinite'
        }}></div>

      </div>

      <style jsx>{`
        @keyframes fillUp {
          0% { width: 0%; opacity: 0.5; }
          50% { width: 100%; opacity: 1; }
          90% { width: 100%; opacity: 1; }
          100% { width: 0%; opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}