'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Megaphone, Network, Wallet, UserCircle,
  TrendingUp, Users, Zap, ChevronRight,
  Bell, ArrowUpRight,
} from 'lucide-react';

const NEON = '#00ff88';

// ── COUNT-UP HOOK ──
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start     = performance.now();
    const startVal  = 0;

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}

export default function DashboardClient({
  account, config, availableBalance, lifetimeEarnings,
  earnedToday, leadCount, liveLeads, rank,
}) {
  const [greeting, setGreeting] = useState('');
  const [mounted,  setMounted]  = useState(false);

  const animatedBalance  = useCountUp(mounted ? availableBalance  : 0, 1400);
  const animatedLifetime = useCountUp(mounted ? lifetimeEarnings  : 0, 1600);
  const animatedToday    = useCountUp(mounted ? earnedToday       : 0, 1000);

  useEffect(() => {
    const h = new Date().getHours();
    if      (h < 12) setGreeting('Good Morning');
    else if (h < 18) setGreeting('Good Afternoon');
    else             setGreeting('Good Evening');
    // Slight delay so count-up feels intentional
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  const rankColors = {
    1: { color: '#888',    glow: 'rgba(136,136,136,0.15)' },
    2: { color: '#3b82f6', glow: 'rgba(59,130,246,0.15)'  },
    3: { color: '#a855f7', glow: 'rgba(168,85,247,0.15)'  },
    4: { color: NEON,      glow: 'rgba(0,255,136,0.2)'    },
  };
  const rc = rankColors[rank.tier] || rankColors[1];

  const glass = {
    background: 'rgba(8,8,12,0.9)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
  };

  const QUICK = [
    { label: 'Campaigns', sub: 'Start Earning',  Icon: Megaphone, link: '/dashboard/campaigns' },
    { label: 'Network',   sub: 'Your Team',      Icon: Network,   link: '/dashboard/team'      },
    { label: 'Wallet',    sub: 'Withdraw',        Icon: Wallet,    link: '/dashboard/wallet'    },
    { label: 'Profile',   sub: 'Settings',        Icon: UserCircle,link: '/dashboard/profile'  },
  ];

  return (
    <div style={{ paddingBottom: '100px' }}>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes shimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes rankGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }

        .db-card   { animation: fadeUp 0.4s ease-out both; }
        .db-card-1 { animation-delay: 0ms;   }
        .db-card-2 { animation-delay: 60ms;  }
        .db-card-3 { animation-delay: 120ms; }
        .db-card-4 { animation-delay: 180ms; }
        .db-card-5 { animation-delay: 240ms; }

        .db-blink { animation: blink 2.4s ease-in-out infinite; }

        .db-withdraw {
          background: ${NEON}; color: #000;
          transition: all 0.18s; border: none;
        }
        .db-withdraw:active { transform: scale(0.97); opacity: 0.9; }

        .db-history {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          transition: all 0.18s;
        }
        .db-history:active { transform: scale(0.97); }

        .quick-btn {
          transition: border-color 0.18s, background 0.18s, transform 0.18s;
        }
        .quick-btn:active { transform: scale(0.95); }

        .shimmer-line {
          position: absolute; top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          animation: shimmer 3s ease-in-out infinite;
          pointer-events: none;
        }

        .rank-glow { animation: rankGlow 2s ease-in-out infinite; }

        .notice-bar {
          transition: border-color 0.2s;
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="db-card db-card-1" style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px', paddingTop: '4px',
      }}>
        <div>
          <div style={{
            fontSize: '10px', color: NEON, letterSpacing: '2.5px',
            fontWeight: '800', textTransform: 'uppercase', marginBottom: '7px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span className="db-blink" style={{
              width: '5px', height: '5px', background: NEON,
              borderRadius: '50%', boxShadow: `0 0 6px ${NEON}`,
              flexShrink: 0,
            }} />
            {greeting || 'Welcome'}
          </div>
          <div style={{
            fontSize: 'clamp(24px,5vw,32px)', fontWeight: '900', color: '#fff',
            letterSpacing: '-1.5px', lineHeight: 1,
          }}>
            {account.username}
          </div>
          <div style={{
            fontSize: '10px', color: '#2e2e2e', fontWeight: '800',
            textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '6px',
          }}>
            Network Promoter
          </div>
        </div>

        {/* Avatar */}
        <Link href="/dashboard/profile" style={{ textDecoration: 'none', flexShrink: 0, position: 'relative' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '50%',
            border: '2px solid #1c4a30', padding: '3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: '900', color: '#000',
            }}>
              {account.username?.[0]?.toUpperCase() || 'P'}
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: '2px', right: '2px',
            width: '11px', height: '11px', borderRadius: '50%',
            background: NEON, border: '2px solid #030305',
            boxShadow: `0 0 8px ${NEON}cc`,
          }} />
        </Link>
      </div>

      {/* ── BALANCE CARD ── */}
      <div className="db-card db-card-2" style={{
        ...glass,
        background: 'linear-gradient(145deg, #0d0d0d 0%, #060606 60%, #080808 100%)',
        padding: '24px 22px',
        marginBottom: '12px',
        boxShadow: `0 20px 60px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)`,
      }}>
        {/* Corner glow */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '220px', height: '220px',
          background: `radial-gradient(circle, ${NEON} 0%, transparent 70%)`,
          opacity: 0.07, filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div className="shimmer-line" />

        <div style={{ position: 'relative', zIndex: 2 }}>

          {/* Top row: rank badge + label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div className="rank-glow" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: `${rc.glow}`,
              border: `1px solid ${rc.color}30`,
              padding: '5px 12px', borderRadius: '8px',
            }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: rc.color, boxShadow: `0 0 6px ${rc.color}`,
              }} />
              <span style={{ fontSize: '10px', color: rc.color, fontWeight: '900', letterSpacing: '1.5px' }}>
                {rank.name}
              </span>
            </div>
            <span style={{ fontSize: '9px', color: '#2a2a2a', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Available
            </span>
          </div>

          {/* Balance — hero number */}
          <div style={{
            fontSize: 'clamp(42px, 10vw, 56px)', fontWeight: '900', color: '#fff',
            letterSpacing: '-3px', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>
            ₹{animatedBalance.toLocaleString('en-IN')}
          </div>

          {/* Lifetime sub-line */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginTop: '8px', marginBottom: '20px',
          }}>
            <TrendingUp size={11} color="#2a2a2a" />
            <span style={{ fontSize: '12px', color: '#2a2a2a', fontWeight: '700' }}>
              ₹{animatedLifetime.toLocaleString('en-IN')} lifetime earned
            </span>
          </div>

          {/* Rank progress bar */}
          {rank.next > 0 && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '9px', color: '#2a2a2a', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Next rank
                </span>
                <span style={{ fontSize: '10px', color: rc.color, fontWeight: '900' }}>
                  {Math.round(rank.progress)}%
                </span>
              </div>
              <div style={{
                height: '4px', background: 'rgba(255,255,255,0.05)',
                borderRadius: '10px', overflow: 'hidden',
              }}>
                <div style={{
                  width: `${rank.progress}%`, height: '100%',
                  background: `linear-gradient(90deg, ${rc.color}88, ${rc.color})`,
                  boxShadow: `0 0 8px ${rc.color}66`,
                  borderRadius: '10px',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              </div>
            </div>
          )}

          {/* CTA row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Link href="/dashboard/wallet" className="db-withdraw" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '14px', borderRadius: '13px',
              fontWeight: '900', fontSize: '12px', textDecoration: 'none',
              textTransform: 'uppercase', letterSpacing: '1px',
              boxShadow: `0 0 20px ${NEON}33`,
            }}>
              <ArrowUpRight size={14} strokeWidth={2.5} />
              Withdraw
            </Link>
            <Link href="/dashboard/leads" className="db-history" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '14px', borderRadius: '13px',
              fontWeight: '700', fontSize: '12px', textDecoration: 'none',
              color: '#666',
              textTransform: 'uppercase', letterSpacing: '1px',
            }}>
              History
            </Link>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="db-card db-card-3" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px', marginBottom: '12px',
      }}>
        {[
          { Icon: Users,     value: leadCount,                                       label: 'Total Leads',  color: '#fff'    },
          { Icon: Zap,       value: liveLeads,                                       label: 'Active',       color: NEON      },
          { Icon: TrendingUp,value: `₹${animatedToday.toLocaleString('en-IN')}`,     label: 'Today',        color: '#facc15' },
        ].map(({ Icon, value, label, color }, i) => (
          <div key={i} style={{
            ...glass,
            padding: '16px 12px',
            textAlign: 'center',
            boxShadow: '0 8px 24px -8px rgba(0,0,0,0.5)',
          }}>
            <Icon size={13} color={color} style={{ opacity: 0.6, marginBottom: '8px' }} strokeWidth={2} />
            <div style={{
              fontSize: 'clamp(18px,4vw,22px)', fontWeight: '900',
              color, lineHeight: 1, marginBottom: '5px',
              fontVariantNumeric: 'tabular-nums',
              textShadow: color !== '#fff' ? `0 0 12px ${color}44` : 'none',
            }}>
              {value}
            </div>
            <div style={{
              fontSize: '8px', color: '#2e2e2e', fontWeight: '800',
              textTransform: 'uppercase', letterSpacing: '1px',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── NOTICE BOARD ── */}
      {config.notice_board && (
        <div className="db-card db-card-4 notice-bar" style={{
          display: 'flex', gap: '14px', alignItems: 'flex-start',
          padding: '16px 18px', marginBottom: '12px', borderRadius: '16px',
          background: 'rgba(251,191,36,0.04)',
          border: '1px solid rgba(251,191,36,0.1)',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bell size={14} color="#fbbf24" strokeWidth={2} />
          </div>
          <div>
            <div style={{
              fontSize: '9px', color: '#fbbf24', fontWeight: '900',
              textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '5px',
            }}>
              Announcement
            </div>
            <div style={{ fontSize: '13px', color: '#777', lineHeight: '1.6', fontWeight: '500' }}>
              {config.notice_board}
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK ACTIONS ── */}
      <div className="db-card db-card-5">
        <div style={{
          fontSize: '9px', color: '#222', fontWeight: '800',
          textTransform: 'uppercase', letterSpacing: '2px',
          margin: '0 0 12px 2px',
        }}>
          Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Campaigns', sub: 'Start earning',  Icon: Megaphone,  link: '/dashboard/campaigns', accent: NEON      },
            { label: 'Network',   sub: 'Your team',      Icon: Network,    link: '/dashboard/team',      accent: '#3b82f6' },
            { label: 'Wallet',    sub: 'Withdraw funds', Icon: Wallet,     link: '/dashboard/wallet',    accent: '#facc15' },
            { label: 'Profile',   sub: 'Settings',       Icon: UserCircle, link: '/dashboard/profile',   accent: '#a855f7' },
          ].map(({ label, sub, Icon, link, accent }) => (
            <Link key={link} href={link} className="quick-btn" style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px 16px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              textDecoration: 'none',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
                background: `${accent}10`,
                border: `1px solid ${accent}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color={accent} strokeWidth={1.8} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: '#ddd', fontWeight: '700', lineHeight: 1.2 }}>
                  {label}
                </div>
                <div style={{ fontSize: '10px', color: '#333', fontWeight: '600', marginTop: '3px' }}>
                  {sub}
                </div>
              </div>
              <ChevronRight size={14} color="#222" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}