'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardClient({ account, referralLink }) {
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)      setGreeting('Good Morning');
    else if (h < 18) setGreeting('Good Afternoon');
    else             setGreeting('Good Evening');
  }, []);

  return (
    <div>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .db-blink  { animation: blink 2s infinite; }
        .db-avatar { transition: transform 0.2s; }
        .db-avatar:hover { transform: scale(1.06); }
      `}</style>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '28px', paddingTop: '8px',
      }}>
        <div>
          <div style={{
            fontSize: '10px', color: '#00ff88', letterSpacing: '2px',
            fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            <span className="db-blink" style={{
              width: '6px', height: '6px',
              background: '#00ff88', borderRadius: '50%',
              boxShadow: '0 0 8px #00ff88', flexShrink: 0,
            }} />
            {greeting}
          </div>

          <div style={{
            fontSize: 'clamp(22px,4vw,30px)', fontWeight: '900', color: '#fff',
            letterSpacing: '-1px', lineHeight: 1,
          }}>
            {account.username}
          </div>

          <div style={{
            fontSize: '10px', color: '#333', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px',
          }}>
            Network Promoter
          </div>
        </div>

        {/* Avatar — matches Image 1: white circle + green ring + green dot */}
        <Link
          href="/dashboard/profile"
          className="db-avatar"
          style={{ textDecoration: 'none', flexShrink: 0, position: 'relative' }}
        >
          {/* Outer dark-green ring */}
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            border: '2.5px solid #1c4a30',
            padding: '3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* White circle with initial */}
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '19px', fontWeight: '900', color: '#000',
            }}>
              {account.username?.[0]?.toUpperCase() || 'P'}
            </div>
          </div>
          {/* Green online dot */}
          <div style={{
            position: 'absolute', bottom: '2px', right: '2px',
            width: '12px', height: '12px', borderRadius: '50%',
            background: '#00ff88',
            border: '2px solid #030305',
            boxShadow: '0 0 8px rgba(0,255,136,0.9)',
          }} />
        </Link>
      </div>
    </div>
  );
}