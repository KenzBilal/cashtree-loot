'use client';

import { useState, useEffect } from 'react';
import { Cookie, ShieldCheck } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible]   = useState(false);
  const [leaving, setLeaving]   = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cookieConsent');
    if (!saved) {
      const t = setTimeout(() => setVisible(true), 1600);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (value) => {
    setLeaving(true);
    setTimeout(() => {
      localStorage.setItem('cookieConsent', value);
      setVisible(false);
      setLeaving(false);
    }, 400);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes ccUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ccDown { from { opacity:1; transform:translateY(0); }   to { opacity:0; transform:translateY(24px); } }
        .cc-wrap { animation: ccUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .cc-wrap.out { animation: ccDown 0.4s cubic-bezier(0.4,0,1,1) forwards; }
        .cc-decline:hover { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.15) !important; color: #fff !important; }
        .cc-accept:hover  { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,255,136,0.35) !important; }
      `}</style>

      <div
        className={`cc-wrap ${leaving ? 'out' : ''}`}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99998,
          width: 'calc(100vw - 40px)',
          maxWidth: '380px',
          background: 'rgba(8,8,12,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset',
        }}
      >
        {/* Top row */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
            background: 'rgba(0,255,136,0.08)',
            border: '1px solid rgba(0,255,136,0.18)',
            color: '#00ff88',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Cookie size={18} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '1px' }}>
              Cookie Policy
            </div>
            <div style={{ fontSize: '10px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Privacy &amp; Tracking
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 8px', borderRadius: '20px',
            background: 'rgba(0,255,136,0.06)',
            border: '1px solid rgba(0,255,136,0.15)',
          }}>
            <ShieldCheck size={10} color="#00ff88" />
            <span style={{ fontSize: '9px', color: '#00ff88', fontWeight: '800', letterSpacing: '0.5px' }}>GDPR</span>
          </div>
        </div>

        {/* Body */}
        <p style={{
          color: '#666', fontSize: '12px', lineHeight: '1.65',
          margin: '0 0 16px', fontWeight: '500',
        }}>
          We use cookies to enhance your experience, analyze traffic, and personalize content.
          Your data is never sold to third parties.
        </p>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            className="cc-decline"
            onClick={() => dismiss('false')}
            style={{
              padding: '11px', borderRadius: '11px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent', color: '#888',
              fontSize: '12px', fontWeight: '800',
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px',
              transition: 'background 0.18s, border-color 0.18s, color 0.18s',
            }}
          >
            Decline
          </button>
          <button
            className="cc-accept"
            onClick={() => dismiss('true')}
            style={{
              padding: '11px', borderRadius: '11px', border: 'none',
              background: '#00ff88', color: '#000',
              fontSize: '12px', fontWeight: '900',
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px',
              boxShadow: '0 0 20px rgba(0,255,136,0.2)',
              transition: 'transform 0.18s, box-shadow 0.18s',
            }}
          >
            Accept All
          </button>
        </div>
      </div>
    </>
  );
}