'use client';

import { useState } from 'react';

export default function InviteBox({ link }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const neonGreen = '#00ff88';

  return (
    <div style={{
      display: 'flex', gap: '12px', alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.03)', 
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px', padding: '12px 16px',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
      transition: 'border 0.2s',
      position: 'relative', overflow: 'hidden'
    }}>
      
      {/* Icon */}
      <div style={{fontSize: '18px'}}>🔗</div>

      {/* Link Text */}
      <div style={{
        flex: 1, 
        fontFamily: 'monospace', fontSize: '13px', color: '#ccc', letterSpacing: '0.5px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
      }}>
        {link}
      </div>

      {/* Action Button */}
      <button 
        onClick={handleCopy}
        style={{
          background: copied ? neonGreen : '#fff',
          color: '#000',
          border: 'none', borderRadius: '8px',
          padding: '8px 16px', 
          fontWeight: '900', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
          cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
          transform: copied ? 'scale(0.95)' : 'scale(1)',
          boxShadow: copied ? `0 0 20px ${neonGreen}66` : 'none'
        }}
      >
        {copied ? 'COPIED!' : 'COPY'}
      </button>

      {/* Active Border Glow (Optional) */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '16px', pointerEvents: 'none',
        border: copied ? `1px solid ${neonGreen}44` : '1px solid transparent',
        transition: 'border 0.3s'
      }}></div>

    </div>
  );
}