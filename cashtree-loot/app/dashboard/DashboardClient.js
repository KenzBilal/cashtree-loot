'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardClient({ account, referralLink }) {
  const [greeting, setGreeting] = useState('Welcome');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good Morning');
    else if (hours < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '30px', paddingTop: '10px'
      }}>
        <div>
          <div style={{
            fontSize: '11px', color: '#00ff88', letterSpacing: '2px', 
            fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span className="blink" style={{width:'6px', height:'6px', background:'#00ff88', borderRadius:'50%', boxShadow:'0 0 10px #00ff88'}}></span>
            {greeting}
          </div>
          <div style={{
            fontSize: '28px', fontWeight: '900', color: '#fff', 
            letterSpacing: '-1px', textShadow: '0 0 30px rgba(255,255,255,0.1)'
          }}>
            {account.username}
          </div>
        </div>

        {/* --- THE FIXED AVATAR --- */}
        {/* White Background, Black Text, Green Ring */}
        <Link href="/dashboard/profile" style={{
          width: '54px', height: '54px', borderRadius: '50%', 
          background: '#ffffff', // WHITE BG
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: '900', color: '#000000', // BLACK TEXT
          textDecoration: 'none',
          border: '2px solid #00ff88', // GREEN RING
          boxShadow: '0 0 25px rgba(0, 255, 136, 0.6)', // GREEN GLOW
          position: 'relative',
          transition: 'transform 0.2s'
        }}>
          {account.username?.[0]?.toUpperCase() || 'U'}
        </Link>
      </div>

      {/* CSS for Blinking Dot */}
      <style jsx global>{`
        @keyframes blink { 0% {opacity: 1;} 50% {opacity: 0.4;} 100% {opacity: 1;} }
        .blink { animation: blink 2s infinite; }
      `}</style>
    </div>
  );
}