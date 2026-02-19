'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import {
  ArrowRight, Menu, X, Globe, BarChart3, Lock,
  Send, ChevronDown, ChevronRight
} from 'lucide-react';
import LegalDocs from './LegalDocs';

// ── DATA ──
const STATS = [
  { value: '5K+',  label: 'Active Nodes' },
  { value: '12ms', label: 'Global Latency' },
  { value: '100%', label: 'Verified Traffic' },
  { value: 'T+0',  label: 'Instant Settlement' },
];

const FEATURES = [
  {
    icon: <Globe size={22} />,
    color: '#fbbf24', rgb: '251,191,36',
    title: '1. Source',
    desc: 'Access high-yield CPA campaigns from Tier-1 financial institutions and global app partners directly via our marketplace.',
  },
  {
    icon: <BarChart3 size={22} />,
    color: '#3b82f6', rgb: '59,130,246',
    title: '2. Execute',
    desc: 'Drive traffic via smart tracking links. Our Server-to-Server (S2S) engine validates conversions in real-time with 99.9% uptime.',
  },
  {
    icon: <Lock size={22} />,
    color: '#00ff88', rgb: '0,255,136',
    title: '3. Settle',
    desc: 'Automated payout processing via UPI and Bank Transfer. Zero-fee withdrawal architecture for verified publishers.',
  },
];

const FAQS = [
  { q: 'What type of traffic is accepted?', a: "We accept organic traffic from Social Media (YouTube, Telegram, Instagram), SEO (Blogs/Websites), and Email Lists. Incentivized traffic is permitted only for specific 'Task' campaigns marked in the dashboard." },
  { q: 'What is the payout cycle?',          a: 'We operate on a T+0 (Instant) model for verified publishers. Once a conversion is approved by the advertiser postback, funds are available for immediate withdrawal to your linked UPI account.' },
  { q: 'Do you provide API access?',          a: 'Yes. High-volume partners can request Postback/Webhook integration to track conversions on their own internal dashboards. Contact support for documentation.' },
  { q: 'Why was my conversion rejected?',     a: "Rejections occur if the advertiser detects fraud (VPN/Proxy), duplicate IPs, or if the user fails to meet the KPI such as 'New User Only' or 'Minimum Deposit'." },
  { q: 'Is there a minimum withdrawal limit?', a: 'The minimum withdrawal threshold is dynamic based on your publisher tier, typically starting at ₹50. This ensures efficient processing of thousands of daily transactions.' },
  { q: 'How do I verify my account?',         a: 'Verification is automated. Simply link a valid phone number and complete your first campaign. For high-ticket payouts, additional KYC may be requested for compliance.' },
];

export default function Home() {
  const [isNavOpen, setIsNavOpen]         = useState(false);
  const [activeFaq, setActiveFaq]         = useState(null);
  const [dashboardLink, setDashboardLink] = useState('/login');
  const [scrolled, setScrolled]           = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [ready, setReady]                 = useState(false);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setReady(true), 60);
    }, 1800);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });

    try {
      const pid  = localStorage.getItem('p_id');
      const code = localStorage.getItem('cashttree_referral');
      if (pid)        setDashboardLink('/dashboard');
      else if (code)  setDashboardLink(`/dashboard?code=${code}`);
    } catch {}

    return () => {
      clearTimeout(splashTimer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div>
      <Script src="https://nap5k.com/tag.min.js" strategy="lazyOnload" data-zone="10337480" />

      <style>{`
        :root {
          --neon:       #00ff88;
          --neon-glow:  rgba(0,255,136,0.32);
          --neon-dim:   rgba(0,255,136,0.1);
          --border-l:   rgba(255,255,255,0.07);
          --border-h:   rgba(255,255,255,0.14);
          --muted:      #777;
          --mid:        #aaa;
          --ease:       cubic-bezier(0.16,1,0.3,1);
          --mono:       'SF Mono','Menlo','Courier New',monospace;
        }

        /* SPLASH */
        .splash { position:fixed; inset:0; background:#000; z-index:99999; display:flex; align-items:center; justify-content:center; transition:opacity 0.9s ease, visibility 0.9s; }
        .splash.out { opacity:0; visibility:hidden; pointer-events:none; }
        @keyframes fillUp { 0%{width:0%;opacity:0} 8%{opacity:1} 60%{width:100%;opacity:1} 100%{width:100%;opacity:1} }
        @keyframes glowPulse { 0%,100%{opacity:.1} 50%{opacity:.3} }

        /* BG */
        .lp-ambient { position:fixed; top:-20%; left:50%; transform:translateX(-50%); width:1000px; height:900px; pointer-events:none; z-index:0; background:radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 65%); }
        .lp-grid { position:fixed; inset:0; pointer-events:none; z-index:0; background-image:linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px); background-size:52px 52px; mask-image:radial-gradient(circle at center,black 30%,transparent 78%); }

        /* NAV */
        .lp-nav { position:fixed; top:0; left:0; right:0; height:70px; display:flex; align-items:center; z-index:1000; border-bottom:1px solid transparent; transition:background 0.3s,border-color 0.3s; }
        .lp-nav.sc { background:rgba(3,3,5,0.82); backdrop-filter:blur(20px); border-color:var(--border-l); }
        .lp-nav-wrap { max-width:1280px; margin:0 auto; padding:0 24px; width:100%; display:flex; justify-content:space-between; align-items:center; }
        .lp-brand { font-size:1.4rem; font-weight:900; color:#fff; text-decoration:none; letter-spacing:-0.04em; }
        .lp-brand .g { color:var(--neon); text-shadow:0 0 20px var(--neon-glow); }
        .lp-navlinks { display:flex; gap:2px; align-items:center; background:rgba(255,255,255,0.03); padding:5px; border-radius:100px; border:1px solid var(--border-l); }
        .lp-navlink { color:#888; text-decoration:none; font-size:13px; font-weight:600; padding:8px 18px; border-radius:100px; transition:color 0.2s,background 0.2s; }
        .lp-navlink:hover { color:#fff; background:rgba(255,255,255,0.06); }
        .lp-dash-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 20px; border-radius:100px; background:rgba(255,255,255,0.05); border:1px solid var(--border-l); color:#fff; text-decoration:none; font-size:13px; font-weight:700; transition:border-color 0.2s,background 0.2s; }
        .lp-dash-btn:hover { border-color:var(--border-h); background:rgba(255,255,255,0.09); }
        .lp-dash-btn .arr { transition:transform 0.2s; }
        .lp-dash-btn:hover .arr { transform:translateX(3px); }
        .lp-menu-btn { display:none; background:none; border:none; color:#fff; padding:6px; cursor:pointer; }

        /* MOBILE NAV */
        .lp-mob { position:fixed; inset:0; top:70px; background:#030305; z-index:999; padding:24px; transform:translateY(-12px); opacity:0; pointer-events:none; transition:all 0.3s var(--ease); border-top:1px solid var(--border-l); }
        .lp-mob.open { transform:translateY(0); opacity:1; pointer-events:auto; }
        .lp-mob-link { display:flex; justify-content:space-between; align-items:center; font-size:1.1rem; font-weight:700; color:#999; text-decoration:none; padding:18px 0; border-bottom:1px solid var(--border-l); transition:color 0.2s; }
        .lp-mob-link:hover { color:#fff; }
        .lp-mob-link.hi { color:var(--neon); border-color:rgba(0,255,136,0.15); }

        /* HERO */
        .lp-hero { padding:148px 0 88px; text-align:center; position:relative; z-index:1; }
        .lp-badge { display:inline-flex; align-items:center; gap:10px; padding:6px 18px; border-radius:100px; margin-bottom:34px; background:rgba(0,255,136,0.06); border:1px solid rgba(0,255,136,0.18); }
        .lp-dot { width:7px; height:7px; background:var(--neon); border-radius:50%; box-shadow:0 0 10px var(--neon); animation:ring 2s infinite; }
        @keyframes ring { 0%{box-shadow:0 0 0 0 rgba(0,255,136,0.5)} 70%{box-shadow:0 0 0 8px rgba(0,255,136,0)} 100%{box-shadow:0 0 0 0 rgba(0,255,136,0)} }
        .lp-badge-text { font-size:11px; font-weight:800; color:var(--neon); text-transform:uppercase; letter-spacing:1.2px; }
        .lp-h1 { font-size:clamp(2.8rem,6vw,5rem); line-height:1.07; font-weight:900; letter-spacing:-0.03em; margin:0 0 26px; color:#fff; }
        .lp-h1 .grad { background:linear-gradient(168deg,#fff 25%,rgba(0,255,136,0.65) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .lp-sub { font-size:clamp(1rem,2vw,1.18rem); color:var(--mid); max-width:550px; margin:0 auto 50px; line-height:1.72; }
        .lp-ctas { display:flex; justify-content:center; gap:14px; flex-wrap:wrap; margin-bottom:86px; }
        .lp-btn-p { display:inline-flex; align-items:center; gap:10px; padding:14px 32px; border-radius:14px; background:var(--neon); color:#000; font-weight:800; font-size:14px; text-decoration:none; transition:transform 0.2s,box-shadow 0.2s; box-shadow:0 0 22px rgba(0,255,136,0.22); }
        .lp-btn-p:hover { transform:translateY(-2px); box-shadow:0 14px 36px rgba(0,255,136,0.34); }
        .lp-btn-g { display:inline-flex; align-items:center; gap:10px; padding:14px 32px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid var(--border-l); color:#fff; font-weight:700; font-size:14px; text-decoration:none; transition:background 0.2s,border-color 0.2s; }
        .lp-btn-g:hover { background:rgba(255,255,255,0.09); border-color:var(--border-h); }

        /* STATS */
        .lp-stats { display:grid; grid-template-columns:repeat(4,1fr); background:rgba(0,0,0,0.42); border:1px solid var(--border-l); border-radius:20px; backdrop-filter:blur(12px); overflow:hidden; }
        .lp-sc { padding:34px 20px; text-align:center; border-right:1px solid var(--border-l); transition:background 0.2s; }
        .lp-sc:last-child { border-right:none; }
        .lp-sc:hover { background:rgba(255,255,255,0.02); }
        .lp-sv { font-family:var(--mono); font-size:2.1rem; font-weight:700; color:#fff; letter-spacing:-0.05em; margin-bottom:6px; transition:color 0.2s,text-shadow 0.2s; }
        .lp-sc:hover .lp-sv { color:var(--neon); text-shadow:0 0 20px var(--neon-glow); }
        .lp-sl { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.08em; font-weight:700; }

        /* SCROLL HINT */
        .lp-scroll { position:absolute; bottom:-42px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:5px; opacity:0.3; animation:bob 2s infinite; }
        @keyframes bob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(7px)} }
        .lp-scroll span { font-size:9px; color:#555; text-transform:uppercase; letter-spacing:1px; font-weight:700; }

        /* SECTION */
        .lp-sec { padding:96px 0; position:relative; z-index:1; }
        .lp-sec-head { text-align:center; margin-bottom:58px; }
        .lp-eyebrow { display:inline-block; font-size:10px; font-weight:900; color:var(--neon); text-transform:uppercase; letter-spacing:2px; margin-bottom:12px; }
        .lp-sec-title { font-size:clamp(1.8rem,4vw,2.8rem); font-weight:900; letter-spacing:-0.02em; color:#fff; margin:0 0 14px; }
        .lp-sec-desc { color:var(--mid); font-size:1.02rem; max-width:500px; margin:0 auto; line-height:1.72; }

        /* FEATURES */
        .lp-feat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(270px,1fr)); gap:18px; }
        .lp-feat { background:rgba(255,255,255,0.02); border:1px solid var(--border-l); border-radius:22px; padding:34px 30px; display:flex; flex-direction:column; position:relative; overflow:hidden; transition:transform 0.3s var(--ease),border-color 0.3s,box-shadow 0.3s; }
        .lp-feat::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--fc,#00ff88),transparent); opacity:0; transition:opacity 0.3s; }
        .lp-feat:hover { transform:translateY(-5px); border-color:var(--border-h); box-shadow:0 20px 40px rgba(0,0,0,0.4); }
        .lp-feat:hover::before { opacity:1; }
        .lp-feat-ico { width:44px; height:44px; border-radius:12px; margin-bottom:22px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); transition:background 0.3s,border-color 0.3s; }
        .lp-feat:hover .lp-feat-ico { background:rgba(var(--fr,0,255,136),0.1); border-color:rgba(var(--fr,0,255,136),0.25); }
        .lp-feat-title { font-size:1.15rem; font-weight:800; color:#fff; margin:0 0 10px; letter-spacing:-0.02em; }
        .lp-feat-desc { color:var(--mid); line-height:1.65; font-size:14px; }

        /* ECO */
        .lp-eco { position:relative; border-radius:24px; overflow:hidden; background:rgba(255,255,255,0.02); border:1px solid var(--border-l); padding:80px 40px; text-align:center; }
        .lp-eco-glow { position:absolute; top:-40%; left:50%; transform:translateX(-50%); width:700px; height:580px; pointer-events:none; background:radial-gradient(circle, rgba(0,255,136,0.075) 0%,transparent 65%); }
        .lp-eco-inner { position:relative; z-index:1; max-width:560px; margin:0 auto; }
        .lp-eco-title { font-size:clamp(1.8rem,4vw,2.8rem); font-weight:900; letter-spacing:-0.02em; margin:0 0 16px; }
        .lp-eco-desc { color:var(--mid); font-size:1.02rem; margin:0 0 38px; line-height:1.72; }
        .lp-btn-tg { display:inline-flex; align-items:center; gap:10px; padding:15px 36px; border-radius:100px; background:#229ED9; color:#fff; font-weight:700; font-size:15px; text-decoration:none; transition:transform 0.2s,box-shadow 0.2s; }
        .lp-btn-tg:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(34,158,217,0.32); }

        /* FAQ */
        .lp-faq-list { max-width:740px; margin:0 auto; display:flex; flex-direction:column; gap:10px; }
        .lp-faq { background:rgba(255,255,255,0.02); border:1px solid var(--border-l); border-radius:16px; overflow:hidden; transition:border-color 0.25s,background 0.25s; }
        .lp-faq.open { border-color:rgba(0,255,136,0.22); background:rgba(0,255,136,0.02); }
        .lp-faq-line { height:2px; width:0%; background:linear-gradient(90deg,var(--neon),transparent); transition:width 0.4s var(--ease); }
        .lp-faq.open .lp-faq-line { width:100%; }
        .lp-faq-btn { width:100%; display:flex; justify-content:space-between; align-items:center; padding:22px 22px; background:none; border:none; color:#fff; cursor:pointer; text-align:left; gap:16px; }
        .lp-faq-q { font-size:15px; font-weight:700; line-height:1.4; }
        .lp-faq-ico { color:var(--muted); flex-shrink:0; transition:transform 0.3s,color 0.3s; }
        .lp-faq.open .lp-faq-ico { transform:rotate(180deg); color:var(--neon); }
        .lp-faq-body { display:grid; grid-template-rows:0fr; transition:grid-template-rows 0.38s var(--ease); }
        .lp-faq.open .lp-faq-body { grid-template-rows:1fr; }
        .lp-faq-inner { overflow:hidden; }
        .lp-faq-a { padding:0 22px 20px; color:var(--mid); line-height:1.7; font-size:14px; }

        /* FOOTER */
        .lp-footer { border-top:1px solid var(--border-l); padding:76px 0 38px; background:#020202; }
        .lp-footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:80px; margin-bottom:60px; }
        .lp-footer-brand { font-size:1.55rem; font-weight:900; color:#fff; text-decoration:none; display:block; margin-bottom:14px; letter-spacing:-0.04em; }
        .lp-footer-desc { color:var(--muted); font-size:14px; line-height:1.7; max-width:290px; }
        .lp-footer-h { font-size:10px; font-weight:800; color:#fff; margin:0 0 22px; text-transform:uppercase; letter-spacing:1.5px; }
        .lp-footer-links { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:14px; }
        .lp-footer-links a { color:var(--muted); font-size:14px; text-decoration:none; transition:color 0.2s; }
        .lp-footer-links a:hover { color:#fff; }
        .lp-footer-bottom { border-top:1px solid var(--border-l); padding-top:34px; display:flex; flex-direction:column; align-items:center; gap:18px; }
        .lp-copy { color:#3a3a3a; font-size:13px; }

        /* FADE-UP ENTRANCE */
        .fu { opacity:0; transform:translateY(26px); transition:opacity 0.8s var(--ease),transform 0.8s var(--ease); }
        .fu.in { opacity:1; transform:translateY(0); }
        .d1{transition-delay:.07s} .d2{transition-delay:.14s} .d3{transition-delay:.21s} .d4{transition-delay:.28s}

        /* RESPONSIVE */
        @media(max-width:1024px){
          .lp-navlinks{display:none}
          .lp-menu-btn{display:block}
          .lp-stats{grid-template-columns:1fr 1fr}
          .lp-sc:nth-child(2){border-right:none}
          .lp-sc{border-bottom:1px solid var(--border-l)}
          .lp-sc:nth-last-child(-n+2){border-bottom:none}
          .lp-sv{font-size:1.8rem}
        }
        @media(max-width:768px){
          .lp-hero{padding:118px 0 68px}
          .lp-sec{padding:66px 0}
          .lp-eco{padding:50px 22px}
          .lp-eco-glow{width:360px}
          .lp-ctas{flex-direction:column;padding:0 20px}
          .lp-btn-p,.lp-btn-g{width:100%;justify-content:center}
          .lp-footer-grid{grid-template-columns:1fr;gap:38px}
          .lp-footer{padding:56px 0 28px}
        }
      `}</style>

      {/* SPLASH */}
      <div className={`splash ${!isLoading ? 'out' : ''}`}>
        <div style={{ position:'relative' }}>
          <h1 style={{ fontSize:'42px', fontWeight:'900', color:'#111', margin:0, letterSpacing:'5px', position:'relative', zIndex:1 }}>CASHTREE</h1>
          <h1 style={{ fontSize:'42px', fontWeight:'900', color:'transparent', WebkitTextStroke:'1px #252525', margin:0, letterSpacing:'5px', position:'absolute', top:0, left:0, zIndex:2 }}>CASHTREE</h1>
          <h1 style={{ fontSize:'42px', fontWeight:'900', margin:0, letterSpacing:'5px', position:'absolute', top:0, left:0, zIndex:3, overflow:'hidden', width:'0%', whiteSpace:'nowrap', borderRight:'2px solid #00ff88', animation:'fillUp 1.8s cubic-bezier(0.4,0,0.2,1) forwards' }}>
            <span style={{ color:'#fff' }}>CASH</span><span style={{ color:'#00ff88' }}>TREE</span>
          </h1>
          <div style={{ position:'absolute', bottom:'-12px', left:0, right:0, height:'16px', background:'#00ff88', filter:'blur(26px)', opacity:.16, animation:'glowPulse 1.8s infinite' }} />
        </div>
      </div>

      {/* BG */}
      <div className="lp-ambient" aria-hidden="true" />
      <div className="lp-grid" aria-hidden="true" />

      {/* NAV */}
      <header className={`lp-nav ${scrolled ? 'sc' : ''}`}>
        <div className="lp-nav-wrap">
          <Link href="/" className="lp-brand">Cash<span className="g">Tree</span></Link>

          <nav className="lp-navlinks">
            <Link href="/campaigns" className="lp-navlink">Live Inventory</Link>
            <a href="#protocol" className="lp-navlink">Protocol</a>
            <a href="#faq" className="lp-navlink">FAQ</a>
          </nav>

          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <Link href={dashboardLink} className="lp-dash-btn">
              Dashboard <ArrowRight size={14} className="arr" />
            </Link>
            <button className="lp-menu-btn" onClick={() => setIsNavOpen(!isNavOpen)} aria-label="Toggle menu">
              {isNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div className={`lp-mob ${isNavOpen ? 'open' : ''}`}>
          <Link href="/campaigns" className="lp-mob-link" onClick={() => setIsNavOpen(false)}>Live Inventory <ChevronRight size={16} /></Link>
          <a href="#protocol" className="lp-mob-link" onClick={() => setIsNavOpen(false)}>Protocol <ChevronRight size={16} /></a>
          <a href="#faq" className="lp-mob-link" onClick={() => setIsNavOpen(false)}>FAQ <ChevronRight size={16} /></a>
          <Link href={dashboardLink} className="lp-mob-link hi" onClick={() => setIsNavOpen(false)}>Partner Dashboard <ChevronRight size={16} /></Link>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="lp-hero">
          <div className="container" style={{ position:'relative' }}>
            <div className={`lp-badge fu ${ready ? 'in' : ''}`}>
              <span className="lp-dot" />
              <span className="lp-badge-text">v2.0 Protocol Live</span>
            </div>

            <h1 className={`lp-h1 fu d1 ${ready ? 'in' : ''}`}>
              The Performance<br />
              <span className="grad">Reward Layer.</span>
            </h1>

            <p className={`lp-sub fu d2 ${ready ? 'in' : ''}`}>
              Infrastructure for modern publishers to monetize traffic.
              Direct API connections. Instant liquidity. Enterprise-grade tracking.
            </p>

            <div className={`lp-ctas fu d3 ${ready ? 'in' : ''}`}>
              <Link href="/campaigns" className="lp-btn-p">View Inventory <ArrowRight size={17} /></Link>
              <Link href={dashboardLink} className="lp-btn-g">Partner Login</Link>
            </div>

            <div className={`lp-stats fu d4 ${ready ? 'in' : ''}`}>
              {STATS.map((s, i) => (
                <div key={i} className="lp-sc">
                  <div className="lp-sv">{s.value}</div>
                  <div className="lp-sl">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="lp-scroll" aria-hidden="true">
              <ChevronDown size={15} color="#444" />
              <span>Scroll</span>
            </div>
          </div>
        </section>

        {/* PROTOCOL */}
        <section id="protocol" className="lp-sec">
          <div className="container">
            <div className="lp-sec-head">
              <span className="lp-eyebrow">The Protocol</span>
              <h2 className="lp-sec-title">Built for Scale</h2>
              <p className="lp-sec-desc">Streamlined monetization infrastructure from source to settlement.</p>
            </div>
            <div className="lp-feat-grid">
              {FEATURES.map((f, i) => (
                <div key={i} className="lp-feat" style={{ '--fc': f.color, '--fr': f.rgb }}>
                  <div className="lp-feat-ico" style={{ color: f.color }}>{f.icon}</div>
                  <h3 className="lp-feat-title">{f.title}</h3>
                  <p className="lp-feat-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ECOSYSTEM */}
        <section className="lp-sec">
          <div className="container">
            <div className="lp-eco">
              <div className="lp-eco-glow" />
              <div className="lp-eco-inner">
                <span className="lp-eyebrow">Community</span>
                <h2 className="lp-eco-title">Join the Ecosystem</h2>
                <p className="lp-eco-desc">Connect with thousands of publishers. Get real-time updates on high-converting offers, maintenance alerts, and optimization strategies.</p>
                <a href="https://t.me/CashtTree_bot" target="_blank" rel="noopener noreferrer" className="lp-btn-tg">
                  <Send size={17} /> Join Official Channel
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="lp-sec">
          <div className="container">
            <div className="lp-sec-head">
              <span className="lp-eyebrow">FAQ</span>
              <h2 className="lp-sec-title">System Specs</h2>
              <p className="lp-sec-desc">Technical &amp; operational answers for publishers.</p>
            </div>
            <div className="lp-faq-list">
              {FAQS.map((item, i) => (
                <div key={i} className={`lp-faq ${activeFaq === i ? 'open' : ''}`}>
                  <div className="lp-faq-line" />
                  <button className="lp-faq-btn" onClick={() => setActiveFaq(activeFaq === i ? null : i)} aria-expanded={activeFaq === i}>
                    <span className="lp-faq-q">{item.q}</span>
                    <ChevronDown size={17} className="lp-faq-ico" />
                  </button>
                  <div className="lp-faq-body">
                    <div className="lp-faq-inner">
                      <p className="lp-faq-a">{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div className="container">
            <div className="lp-footer-grid">
              <div>
                <Link href="/" className="lp-footer-brand">
                  Cash<span style={{ color:'#00ff88', textShadow:'0 0 20px rgba(0,255,136,0.3)' }}>Tree</span>
                </Link>
                <p className="lp-footer-desc">The performance reward layer for the modern internet. Connecting creators with instant liquidity.</p>
              </div>
              <div>
                <h4 className="lp-footer-h">Platform</h4>
                <ul className="lp-footer-links">
                  <li><Link href="/campaigns">Live Inventory</Link></li>
                  <li><a href="#protocol">The Protocol</a></li>
                  <li><Link href={dashboardLink}>Partner Login</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="lp-footer-h">Support</h4>
                <ul className="lp-footer-links">
                  <li><Link href="/contact">Contact Us</Link></li>
                  <li><a href="mailto:help@cashttree.online">help@cashttree.online</a></li>
                  <li><a href="https://t.me/CashtTree_bot" target="_blank" rel="noopener noreferrer">Telegram Support</a></li>
                </ul>
              </div>
            </div>
            <div className="lp-footer-bottom">
              <LegalDocs />
              <p className="lp-copy">© {new Date().getFullYear()} CashTree Network. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}