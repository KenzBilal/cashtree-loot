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
        .db-avatar:hover { transform: scale(1.06); }
      `}</style>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '28px', paddingTop: '8px',
      }}>
        <div>
          {/* Greeting row */}
          <div style={{
            fontSize: '11px', color: '#00ff88', letterSpacing: '2px',
            fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            <span
              className="db-blink"
              style={{
                width: '6px', height: '6px',
                background: '#00ff88', borderRadius: '50%',
                boxShadow: '0 0 8px #00ff88', flexShrink: 0,
              }}
            />
            {greeting}
          </div>

          {/* Username */}
          <div style={{
            fontSize: '28px', fontWeight: '900', color: '#fff',
            letterSpacing: '-1px', lineHeight: 1,
          }}>
            {account.username}
          </div>
        </div>

        {/* Avatar → profile */}
        <Link
          href="/dashboard/profile"
          className="db-avatar"
          style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: '900', color: '#000',
            textDecoration: 'none',
            border: '2px solid #00ff88',
            boxShadow: '0 0 22px rgba(0,255,136,0.5)',
            flexShrink: 0,
            transition: 'transform 0.2s',
          }}
        >
          {account.username?.[0]?.toUpperCase() || 'U'}
        </Link>
      </div>
    </div>
  );
}