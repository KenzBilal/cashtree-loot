'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight, Zap, Copy, Check, TrendingUp, Shield, Clock } from 'lucide-react';

const CAMPAIGNS = [
  { id: 101, name: "Rio Money",       category: "Finance",      payout: "₹800", difficulty: "High Reward", time: "Verified",  link: "https://campguruji.in/camp/j8kam6c9",                             color: "#f97316" },
  { id: 102, name: "Credilio Flash",  category: "Finance",      payout: "₹900", difficulty: "High Reward", time: "Verified",  link: "https://campguruji.in/camp/u1phzg18",                             color: "#3b82f6" },
  { id: 103, name: "IndusInd Bank",   category: "Banking",      payout: "₹500", difficulty: "Premium",     time: "Video KYC", link: "#",                                                               color: "#ef4444" },
  { id: 104, name: "Bajaj EMI Card",  category: "Finance",      payout: "₹500", difficulty: "Medium",      time: "Approval",  link: "https://campguruji.in/camp/im6robpt",                             color: "#06b6d4" },
  { id: 105, name: "5Paisa Demat",    category: "Demat",        payout: "₹380", difficulty: "Medium",      time: "24 Hrs",    link: "https://clickmudra.co/camp/MBVZJME",                              color: "#f97316" },
  { id: 106, name: "Tide Business",   category: "Banking",      payout: "₹300", difficulty: "Easy",        time: "Verified",  link: "https://rfox.in/l/rmopqjkx",                                     color: "#4338ca" },
  { id: 107, name: "Kotak 811",       category: "Banking",      payout: "₹200", difficulty: "Easy",        time: "Instant",   link: "https://cgrj.in/c/rnf6yrzd",                                     color: "#ef4444" },
  { id: 108, name: "Upstox Demat",    category: "Demat",        payout: "₹200", difficulty: "Medium",      time: "24-48 Hrs", link: "https://campguruji.in/camp/hw52jghh",                             color: "#a855f7" },
  { id: 109, name: "AU Credit Card",  category: "Credit Card",  payout: "₹180", difficulty: "Limit Check", time: "Instant",   link: "https://campguruji.in/camp/uctpuhvp",                             color: "#f59e0b" },
  { id: 110, name: "Angel One",       category: "Demat",        payout: "₹150", difficulty: "Medium",      time: "Approved",  link: "https://lootcampaign.in?camp=Aone&ref=SueeEI63",                  color: "#3b82f6" },
  { id: 111, name: "CoinSwitch",      category: "Crypto",       payout: "₹150", difficulty: "Trade",       time: "Instant",   link: "https://campaigns.fast2cash.in/camp/o3t1X8zCeW9S3W3",            color: "#10b981" },
  { id: 112, name: "PhonePe",         category: "App",          payout: "₹150", difficulty: "Easy",        time: "Signup",    link: "/phonepay/",                                                      color: "#6d28d9" },
  { id: 113, name: "Bajaj EMI App",   category: "Finance",      payout: "₹125", difficulty: "Easy",        time: "Instant",   link: "https://rechargefox.com/camp/rzryyek5",                            color: "#3b82f6" },
  { id: 114, name: "Airtel Thanks",   category: "App Task",     payout: "₹100", difficulty: "Easy",        time: "Task",      link: "https://lootcampaign.in?camp=Atl&ref=VMIZAvSI",                   color: "#ef4444" },
  { id: 115, name: "Qoneqt",          category: "Referral",     payout: "₹85",  difficulty: "Code Req",    time: "Bonus",     link: "/qoneqt/",                                                        color: "#06b6d4", specialCode: "8424042254214049" },
  { id: 116, name: "Motwal",          category: "App",          payout: "₹70",  difficulty: "Easy",        time: "Install",   link: "/motwal",                                                         color: "#10b981" },
  { id: 117, name: "Nielsen",         category: "Survey",       payout: "₹70",  difficulty: "Easy",        time: "3 Days",    link: "https://lootcampaign.in?camp=nsn3d&ref=OGkUSDyw",                 color: "#3b82f6" },
  { id: 118, name: "Royal Laminates", category: "Form",         payout: "₹70",  difficulty: "Easy",        time: "Call",      link: "https://campguruji.in/camp/xu6fxt8y",                             color: "#ca8a04" },
  { id: 119, name: "Bajaj Demat",     category: "Demat",        payout: "₹60",  difficulty: "Easy",        time: "Instant",   link: "https://campguruji.com/camp/kgwnocyl",                            color: "#3b82f6" },
  { id: 120, name: "Media Rewards",   category: "App",          payout: "₹50",  difficulty: "Login",       time: "7 Days",    link: "https://campaign.cashwala.in/campaigns/Sh4sct2s7?as=2n0tg1g1i",  color: "#ec4899" },
  { id: 121, name: "ZebPay",          category: "Crypto",       payout: "₹40",  difficulty: "KYC",         time: "Instant",   link: "https://campaigns.fast2cash.in/camp/tp32keOzRAxFzM1",            color: "#3b82f6" },
  { id: 122, name: "TimesPrime",      category: "Subscription", payout: "₹750+",difficulty: "Purchase",    time: "Instant",   link: "https://campguruji.com/camp/qbjybwmw",                            color: "#a855f7" },
];

const FILTERS = ['All', 'Finance', 'Apps'];

const FINANCE_CATS = ['Finance', 'Banking', 'Credit Card', 'Demat', 'Crypto'];
const APP_CATS     = ['App', 'App Task', 'Survey', 'Form', 'Referral', 'Subscription'];

export default function CampaignsPage() {
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filtered = CAMPAIGNS.filter(c => {
    const matchCat =
      filter === 'All' ||
      (filter === 'Finance' && FINANCE_CATS.includes(c.category)) ||
      (filter === 'Apps'    && APP_CATS.includes(c.category));
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const copyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Top 3 highest payout for "featured" treatment
  const topIds = [...CAMPAIGNS]
    .sort((a, b) => parseInt(b.payout) - parseInt(a.payout))
    .slice(0, 3)
    .map(c => c.id);

  return (
    <div style={{ minHeight: '100vh', background: '#030305', color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,255,136,0.6); }
          50%      { box-shadow: 0 0 0 6px rgba(0,255,136,0); }
        }

        .camp-card {
          background: #0a0a0f;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
          cursor: default;
          animation: fadeUp 0.4s ease both;
        }
        .camp-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%);
          pointer-events: none;
        }
        .camp-card:hover {
          border-color: rgba(255,255,255,0.16);
          transform: translateY(-3px);
        }
        .camp-card.featured {
          border-color: rgba(0,255,136,0.2);
        }
        .camp-card.featured:hover {
          border-color: rgba(0,255,136,0.4);
        }

        .start-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .start-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmer 2.5s ease-in-out infinite;
        }
        .start-btn-primary {
          background: #00ff88;
          color: #000;
        }
        .start-btn-primary:hover {
          background: #00e87a;
          box-shadow: 0 0 24px rgba(0,255,136,0.35);
        }
        .start-btn-ghost {
          background: rgba(255,255,255,0.05);
          color: #888;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .start-btn-ghost:hover {
          background: rgba(255,255,255,0.09);
          color: #fff;
        }

        .filter-pill {
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: #555;
          cursor: pointer;
          transition: all 0.18s;
        }
        .filter-pill:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
        .filter-pill.active {
          background: #fff;
          color: #000;
          border-color: #fff;
        }

        .search-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 0 14px;
          flex: 1;
          max-width: 280px;
          transition: border-color 0.18s;
        }
        .search-wrap:focus-within { border-color: rgba(0,255,136,0.4); }
        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          padding: 11px 0;
          width: 100%;
        }
        .search-input::placeholder { color: #444; }

        .copy-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 7px;
          padding: 4px 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.18s;
          flex-shrink: 0;
        }
        .copy-btn:hover { background: rgba(255,255,255,0.1); }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00ff88;
          animation: pulse-dot 2s infinite;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .controls-row { flex-direction: column; align-items: stretch !important; }
          .search-wrap { max-width: 100% !important; }
          .grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(3,3,5,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '0 24px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none', fontWeight: '900', fontSize: '18px', letterSpacing: '-0.5px', color: '#fff', fontFamily: "'Syne', sans-serif" }}>
          Cash<span style={{ color: '#00ff88' }}>Tree</span>
        </Link>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', fontWeight: '700', color: '#666', textDecoration: 'none',
          textTransform: 'uppercase', letterSpacing: '0.8px',
          transition: 'color 0.18s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#666'}
        >
          Back to Home
        </Link>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>

        {/* ── HERO ── */}
        <div style={{ padding: '56px 0 40px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: '8px', padding: '6px 12px', marginBottom: '20px',
          }}>
            <div className="live-dot" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#00ff88', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              {CAMPAIGNS.length} Live Offers
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: '900', color: '#fff',
            margin: '0 0 12px', letterSpacing: '-2px', lineHeight: 1.05,
          }}>
            Earn Cash From<br />
            <span style={{ color: '#00ff88' }}>Every Click.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#555', fontWeight: '600', margin: 0, maxWidth: '480px', lineHeight: 1.6 }}>
            Verified high-payout campaigns. Complete tasks, get paid. No experience needed.
          </p>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px', marginBottom: '36px',
          animation: 'fadeUp 0.5s ease 0.08s both',
        }}>
          {[
            { icon: <TrendingUp size={14} color="#00ff88" />, label: 'Top Payout', value: '₹900' },
            { icon: <Shield size={14} color="#3b82f6" />,     label: 'All Verified', value: '100%' },
            { icon: <Clock size={14} color="#fbbf24" />,      label: 'Fastest Pay', value: 'Instant' },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '16px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '9px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '10px', color: '#444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CONTROLS ── */}
        <div className="controls-row" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px', marginBottom: '24px',
          animation: 'fadeUp 0.5s ease 0.12s both',
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-pill${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="search-wrap">
            <Search size={14} color="#444" />
            <input
              className="search-input"
              type="text"
              placeholder="Search offers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── RESULTS COUNT ── */}
        <div style={{
          fontSize: '11px', color: '#333', fontWeight: '700',
          textTransform: 'uppercase', letterSpacing: '1px',
          marginBottom: '16px',
        }}>
          {filtered.length} offer{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* ── GRID ── */}
        <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '14px',
          paddingBottom: '80px',
        }}>
          {filtered.map((c, i) => {
            const isFeatured = topIds.includes(c.id);
            const pNum = parseInt(c.payout.replace(/[^\d]/g, ''));
            return (
              <div
                key={c.id}
                className={`camp-card${isFeatured ? ' featured' : ''}`}
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                {/* Featured glow */}
                {isFeatured && (
                  <div style={{
                    position: 'absolute', top: '-40px', right: '-40px',
                    width: '140px', height: '140px',
                    background: `radial-gradient(circle, ${c.color} 0%, transparent 70%)`,
                    opacity: 0.08, filter: 'blur(30px)', pointerEvents: 'none',
                  }} />
                )}

                {/* ── Card Top ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '13px',
                    background: `${c.color}18`,
                    border: `1px solid ${c.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: '900', color: c.color,
                    flexShrink: 0, fontFamily: "'Syne', sans-serif",
                  }}>
                    {c.name[0]}
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {isFeatured && (
                      <span style={{
                        fontSize: '9px', fontWeight: '800', color: '#000',
                        background: '#00ff88', padding: '3px 8px',
                        borderRadius: '5px', letterSpacing: '0.5px', textTransform: 'uppercase',
                      }}>
                        Top Pick
                      </span>
                    )}
                    <span style={{
                      fontSize: '9px', fontWeight: '800', color: '#555',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      padding: '3px 8px', borderRadius: '5px',
                      letterSpacing: '0.5px', textTransform: 'uppercase',
                    }}>
                      {c.category}
                    </span>
                  </div>
                </div>

                {/* ── Name ── */}
                <div>
                  <h3 style={{
                    fontSize: '16px', fontWeight: '800', color: '#fff',
                    margin: '0 0 4px', letterSpacing: '-0.3px',
                    fontFamily: "'Syne', sans-serif",
                  }}>
                    {c.name}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#444', fontWeight: '600' }}>
                    {c.difficulty}
                  </div>
                </div>

                {/* ── Special Code ── */}
                {c.specialCode && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', padding: '8px 12px', gap: '8px',
                  }}>
                    <div>
                      <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                        Referral Code
                      </div>
                      <div style={{ fontSize: '12px', color: '#00ff88', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                        {c.specialCode}
                      </div>
                    </div>
                    <button className="copy-btn" onClick={() => copyCode(c.id, c.specialCode)}>
                      {copiedId === c.id
                        ? <Check size={13} color="#00ff88" />
                        : <Copy size={13} color="#666" />}
                    </button>
                  </div>
                )}

                {/* ── Payout Row ── */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                }}>
                  <div style={{
                    background: 'rgba(0,255,136,0.05)',
                    border: '1px solid rgba(0,255,136,0.12)',
                    borderRadius: '11px', padding: '12px',
                  }}>
                    <div style={{ fontSize: '9px', color: '#00ff88', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      You Earn
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#00ff88', letterSpacing: '-0.5px', lineHeight: 1 }}>
                      {c.payout}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '11px', padding: '12px',
                  }}>
                    <div style={{ fontSize: '9px', color: '#555', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      Settlement
                    </div>
                    <div style={{
                      fontSize: '13px', fontWeight: '800', color: '#fff',
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                      <Zap size={11} color="#fbbf24" />
                      {c.time}
                    </div>
                  </div>
                </div>

                {/* ── CTA ── */}
                <a
                  href={c.link === '#' ? undefined : c.link}
                  target={c.link !== '#' && !c.link.startsWith('/') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={`start-btn ${c.link === '#' ? 'start-btn-ghost' : 'start-btn-primary'}`}
                  style={{ pointerEvents: c.link === '#' ? 'none' : 'auto', opacity: c.link === '#' ? 0.4 : 1 }}
                >
                  {c.link === '#' ? 'Coming Soon' : 'Start Now'}
                  {c.link !== '#' && <ArrowUpRight size={15} />}
                </a>
              </div>
            );
          })}
        </div>

        {/* ── EMPTY STATE ── */}
        {filtered.length === 0 && (
          <div style={{
            padding: '80px 20px', textAlign: 'center',
            animation: 'fadeUp 0.4s ease both',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Search size={22} color="#333" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>No offers found</div>
            <div style={{ fontSize: '12px', color: '#444', fontWeight: '600' }}>Try a different search or filter</div>
          </div>
        )}
      </div>
    </div>
  );
}