'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardClient({ account, referralLink }) {
  const [greeting, setGreeting] = useState('Welcome');
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)      setGreeting('Good Morning');
    else if (h < 18) setGreeting('Good Afternoon');
    else             setGreeting('Good Evening');
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .db-blink { animation: blink 2s infinite; }
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

        <Link
          href="/dashboard/profile"
          className="db-avatar"
          style={{
            width: '48px', height: '48px', borderRadius: '13px',
            background: '#00ff88',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: '900', color: '#000',
            textDecoration: 'none',
            boxShadow: '0 0 20px rgba(0,255,136,0.28)',
            flexShrink: 0,
          }}
        >
          {account.username?.[0]?.toUpperCase() || 'P'}
        </Link>
      </div>
    </div>
  );
}