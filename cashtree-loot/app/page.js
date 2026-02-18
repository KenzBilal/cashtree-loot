'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { 
  ArrowRight, Menu, X, Globe, BarChart3, Lock, 
  Send, ChevronDown, ChevronUp, Zap, ShieldCheck 
} from 'lucide-react';
import LegalDocs from './LegalDocs';

// --- DATA CONSTANTS (Preserved) ---
const STATS = [
  { value: "5K+", label: "Active Nodes" },
  { value: "12ms", label: "Global Latency" },
  { value: "100%", label: "Verified Traffic" },
  { value: "T+0", label: "Instant Settlement" }
];

const FEATURES = [
  {
    icon: <Globe size={24} />,
    color: "var(--color-yellow)",
    title: "1. Source",
    desc: "Access high-yield CPA campaigns from Tier-1 financial institutions and global app partners directly via our marketplace."
  },
  {
    icon: <BarChart3 size={24} />,
    color: "var(--color-blue)",
    title: "2. Execute",
    desc: "Drive traffic via smart tracking links. Our Server-to-Server (S2S) engine validates conversions in real-time with 99.9% uptime."
  },
  {
    icon: <Lock size={24} />,
    color: "var(--color-green)",
    title: "3. Settle",
    desc: "Automated payout processing via UPI and Bank Transfer. Zero-fee withdrawal architecture for verified publishers."
  }
];

const FAQS = [
  {
    q: "What type of traffic is accepted?",
    a: "We accept organic traffic from Social Media (YouTube, Telegram, Instagram), SEO (Blogs/Websites), and Email Lists. Incentivized traffic is permitted only for specific 'Task' campaigns marked in the dashboard."
  },
  {
    q: "What is the payout cycle?",
    a: "We operate on a T+0 (Instant) model for verified publishers. Once a conversion is approved by the advertiser postback, funds are available for immediate withdrawal to your linked UPI account."
  },
  {
    q: "Do you provide API access?",
    a: "Yes. High-volume partners can request Postback/Webhook integration to track conversions on their own internal dashboards. Contact support for documentation."
  },
  {
    q: "Why was my conversion rejected?",
    a: "Rejections occur if the advertiser detects fraud (VPN/Proxy), duplicate IPs, or if the user fails to meet the KPI (Key Performance Indicator) such as 'New User Only' or 'Minimum Deposit'."
  },
  {
    q: "Is there a minimum withdrawal limit?",
    a: "The minimum withdrawal threshold is dynamic based on your publisher tier, typically starting at ₹50. This ensures efficient processing of thousands of daily transactions."
  },
  {
    q: "How do I verify my account?",
    a: "Verification is automated. Simply link a valid phone number and complete your first campaign. For high-ticket payouts, additional KYC may be requested for compliance."
  }
];

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [dashboardLink, setDashboardLink] = useState("/login");
  const [scrolled, setScrolled] = useState(false);

  // ⚡ LOADING STATE (Splash Screen)
  const [isLoading, setIsLoading] = useState(true);

  // --- LOGIC: Session & Scroll Detection ---
  useEffect(() => {
    // 1. SPLASH SCREEN TIMER (Matches Animation Duration)
    // The animation is ~2.2s, so we give it 2.5s to finish smoothly
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    // 2. SCROLL DETECTION
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 3. PARTNER LOGIC (Preserved)
    const partnerId = localStorage.getItem("p_id");
    const oldCode = localStorage.getItem("cashttree_referral");
    if (partnerId) {
      setDashboardLink("/dashboard");
    } else if (oldCode) {
      setDashboardLink(`/dashboard?code=${oldCode}`);
    }

    return () => {
      clearTimeout(timer); 
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="root-layout">
      <Script src="https://nap5k.com/tag.min.js" strategy="lazyOnload" data-zone="10337480" />

      {/* --------------------------------------------------------- */}
      {/* ⚡ NEW: PREMIUM LIQUID SPLASH SCREEN (From loading.js) */}
      {/* --------------------------------------------------------- */}
      <div className={`splash-screen ${!isLoading ? 'fade-out' : ''}`}>
        <div style={{position: 'relative'}}>
          
          {/* 1. The Base Text (Dimmed Background) */}
          <h1 style={{
            fontSize: '40px', fontWeight: '900', color: '#111', 
            margin: 0, letterSpacing: '4px', position: 'relative', zIndex: 1
          }}>
            CASHTREE
          </h1>

          {/* 2. The "Hollow" Overlay (Outline) */}
          <h1 style={{
            fontSize: '40px', fontWeight: '900', color: 'transparent', 
            WebkitTextStroke: '1px #333',
            margin: 0, letterSpacing: '4px', position: 'absolute', top: 0, left: 0, zIndex: 2
          }}>
            CASHTREE
          </h1>

          {/* 3. The Neon Liquid Fill (Animated Reveal) */}
          <h1 className="liquid-text" style={{
            fontSize: '40px', fontWeight: '900', 
            margin: 0, letterSpacing: '4px', position: 'absolute', top: 0, left: 0, zIndex: 3,
            overflow: 'hidden', width: '0%', whiteSpace: 'nowrap',
            borderRight: '2px solid #00ff88', // The Laser Line
            animation: 'fillUp 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' // 'forwards' keeps it full at end
          }}>
            {/* Dual Color Logic: CASH (White) + TREE (Green) */}
            <span style={{color: '#fff'}}>CASH</span>
            <span style={{color: '#00ff88'}}>TREE</span>
          </h1>
          
          {/* 4. Reflection/Glow below */}
          <div style={{
             position: 'absolute', bottom: '-10px', left: '0', right: '0', 
             height: '20px', background: '#00ff88', filter: 'blur(30px)', opacity: 0.2,
             animation: 'glowPulse 2.2s infinite' 
          }}></div>

        </div>
      </div>

      {/* --- BACKGROUND FX --- */}
      <div className="ambient-glow" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />

      {/* --- NAVIGATION --- */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link href="/" className="brand">
            Cash<span className="text-neon">Tree</span>
          </Link>

          {/* Desktop Links */}
          <nav className="nav-links desktop-only">
            <Link href="/campaigns" className="nav-item">Live Inventory</Link>
            <a href="#protocol" className="nav-item">Protocol</a>
            <a href="#faq" className="nav-item">FAQ</a>
          </nav>

          {/* Actions */}
          <div className="nav-actions">
            <Link href={dashboardLink} className="btn-glass btn-sm dashboard-btn">
              <span>Dashboard</span>
              <ArrowRight size={14} className="icon-slide" />
            </Link>
            <button 
              className="menu-toggle" 
              onClick={() => setIsNavOpen(!isNavOpen)}
              aria-label="Toggle Menu"
              aria-expanded={isNavOpen}
            >
              {isNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu ${isNavOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
             <Link href="/campaigns" onClick={() => setIsNavOpen(false)} className="mobile-link">Live Inventory</Link>
             <a href="#protocol" onClick={() => setIsNavOpen(false)} className="mobile-link">Protocol</a>
             <a href="#faq" onClick={() => setIsNavOpen(false)} className="mobile-link">FAQ</a>
             <Link href={dashboardLink} onClick={() => setIsNavOpen(false)} className="mobile-link highlight">
               Partner Dashboard
             </Link>
          </div>
        </div>
      </header>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="hero">
          <div className="container hero-container">
            <div className="hero-content">
              {/* Animation logic: Wait for splash screen to finish (!isLoading) */}
              <div className={`status-badge ${!isLoading ? 'fade-in-up' : ''}`}>
                <span className="pulse-dot"></span>
                <span className="status-text">v2.0 Protocol Live</span>
              </div>
              
              <h1 className={`hero-title ${!isLoading ? 'fade-in-up delay-1' : ''}`}>
                The Performance <br/>
                <span className="text-gradient">Reward Layer.</span>
              </h1>
              
              <p className={`hero-sub ${!isLoading ? 'fade-in-up delay-2' : ''}`}>
                The infrastructure for modern publishers to monetize traffic.<br className="md-visible"/>
                Direct API connections. Instant liquidity. Enterprise-grade tracking.
              </p>
              
              <div className={`cta-group ${!isLoading ? 'fade-in-up delay-3' : ''}`}>
                <Link href="/campaigns" className="btn-primary">
                  View Inventory <ArrowRight size={18} />
                </Link>
                
                <Link href={dashboardLink} className="btn-glass">
                  Partner Login
                </Link>
              </div>
            </div>

            <div className={`stats-hud ${!isLoading ? 'fade-in-up delay-4' : ''}`}>
              {STATS.map((stat, idx) => (
                <div key={idx} className="stat-cell">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PROTOCOL SECTION --- */}
        <section id="protocol" className="section protocol">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">The Protocol</h2>
              <p className="section-desc">Streamlined monetization infrastructure built for scale.</p>
            </div>
            
            <div className="features-grid">
              {FEATURES.map((feature, idx) => (
                <div key={idx} className="feature-card glass-panel" style={{ '--accent': feature.color }}>
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-glow" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- ECOSYSTEM BANNER --- */}
        <section className="section ecosystem">
          <div className="container">
            <div className="ecosystem-card glass-panel-heavy">
              <div className="card-shine" />
              <div className="ecosystem-content">
                <h2 className="banner-title">Join the Ecosystem</h2>
                <p className="banner-desc">
                  Connect with thousands of publishers. Get real-time updates on high-converting offers, maintenance alerts, and optimization strategies.
                </p>
                <a 
                  href="https://t.me/CashtTree_bot" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-telegram"
                >
                  <Send size={18} /> <span style={{marginLeft: '8px'}}>Join Official Channel</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section id="faq" className="section faq">
          <div className="container faq-container">
            <div className="section-header">
              <h2 className="section-title">System FAQ</h2>
              <p className="section-desc">Technical & Operational Specifications.</p>
            </div>
            
            <div className="faq-list">
              {FAQS.map((item, idx) => (
                <div key={idx} className={`faq-item glass-panel ${activeFaq === idx ? 'active' : ''}`}>
                  <button 
                    className="faq-trigger" 
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={activeFaq === idx}
                  >
                    <span className="faq-q">{item.q}</span>
                    <span className="faq-icon-wrapper">
                      {activeFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>
                  <div className="faq-content-wrapper">
                    <div className="faq-answer">
                      {item.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-col brand-col">
                <Link href="/" className="footer-brand">
                  Cash<span className="text-neon">Tree</span>
                </Link>
                <p className="footer-desc">
                  The performance reward layer for the modern internet. 
                  Connecting creators with instant liquidity.
                </p>
              </div>

              <div className="footer-col">
                <h4 className="footer-heading">Platform</h4>
                <ul className="footer-links-list">
                  <li><Link href="/campaigns">Live Inventory</Link></li>
                  <li><a href="#protocol">The Protocol</a></li>
                  <li><Link href={dashboardLink}>Partner Login</Link></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4 className="footer-heading">Support</h4>
                <ul className="footer-links-list">
                  <li><Link href="/contact">Contact Us</Link></li>
                  <li><a href="mailto:help@cashttree.online">help@cashttree.online</a></li>
                  <li><a href="https://t.me/CashtTree_bot" target="_blank">Telegram Support</a></li>
                </ul>
              </div>
            </div>

            <div className="footer-bottom">
              <LegalDocs />
              <div className="copyright">
                © {new Date().getFullYear()} CashTree Network. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* --- DESIGN SYSTEM & STYLES --- */}
      <style jsx global>{`
        :root {
          --bg-dark: #050505;
          --neon-green: #00ff88;
          --color-yellow: #fbbf24;
          --color-blue: #3b82f6;
          --color-green: #00ff88;
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.08);
          --glass-highlight: rgba(255, 255, 255, 0.12);
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --font-mono: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
          --text-primary: #ffffff;
          --text-secondary: #949494;
          --text-tertiary: #525252;
          --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
        }

        html { scroll-behavior: smooth; }
        body {
          background-color: var(--bg-dark);
          color: var(--text-primary);
          font-family: var(--font-sans);
          margin: 0;
          overflow-x: hidden;
          line-height: 1.5;
        }

        /* --------------------------------------------------------- */
        /* ⚡ ANIMATION: SPLASH SCREEN (Ported from loading.js) */
        /* --------------------------------------------------------- */
        .splash-screen {
          position: fixed;
          inset: 0;
          background-color: #000; /* Solid Black Background */
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.8s ease-out, visibility 0.8s;
        }
        .splash-screen.fade-out {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        
        /* Keyframes from loading.js */
        @keyframes fillUp {
          0% { width: 0%; opacity: 0; }
          10% { opacity: 1; }
          50% { width: 100%; opacity: 1; }
          90% { width: 100%; opacity: 1; }
          100% { width: 100%; opacity: 1; } /* Keep full at end */
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }

        /* --- EXISTING STYLES (Preserved) --- */
        .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        .text-neon { color: var(--neon-green); text-shadow: 0 0 20px rgba(0, 255, 136, 0.4); }
        .text-gradient {
          background: linear-gradient(180deg, #fff 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .glass-panel {
          background: var(--glass-bg);
          border: 1px solid var(--border-light);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          transition: all 0.3s var(--ease-out);
        }
        
        /* --- BACKGROUNDS --- */
        .ambient-glow {
          position: fixed; top: -20%; left: 50%; transform: translateX(-50%);
          width: 1200px; height: 1000px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.06) 0%, transparent 60%);
          pointer-events: none; z-index: -1;
        }
        .grid-overlay {
          position: fixed; inset: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
          pointer-events: none; z-index: -1;
        }

        /* --- NAVBAR --- */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; height: 72px;
          display: flex; align-items: center; z-index: 100;
          transition: all 0.3s ease; border-bottom: 1px solid transparent;
        }
        .navbar.scrolled {
          background: rgba(5, 5, 5, 0.7);
          backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-light);
        }
        .nav-inner { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .brand { font-size: 1.5rem; font-weight: 800; text-decoration: none; color: white; letter-spacing: -0.04em; }
        .nav-links {
          display: flex; gap: 40px; background: rgba(255, 255, 255, 0.03);
          padding: 8px 32px; border-radius: 100px; border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .nav-item { color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
        .nav-item:hover { color: white; }
        .nav-actions { display: flex; align-items: center; gap: 16px; }
        .menu-toggle { display: none; background: none; border: none; color: white; padding: 4px; cursor: pointer; }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed; inset: 0; top: 72px; background: var(--bg-dark);
          z-index: 90; padding: 24px; transform: translateY(-20px); opacity: 0;
          pointer-events: none; transition: all 0.3s var(--ease-out);
        }
        .mobile-menu.open { transform: translateY(0); opacity: 1; pointer-events: auto; }
        .mobile-menu-content { display: flex; flex-direction: column; gap: 24px; }
        .mobile-link {
          font-size: 1.25rem; font-weight: 600; color: white;
          text-decoration: none; padding-bottom: 16px; border-bottom: 1px solid var(--glass-border);
        }
        .mobile-link.highlight { color: var(--neon-green); border-color: rgba(0, 255, 136, 0.2); }

        /* --- HERO --- */
        .hero { padding: 160px 0 100px; text-align: center; position: relative; }
        .badge {
          display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px;
          background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-light);
          border-radius: 100px; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 32px;
        }
        .status-badge {
          display: inline-flex; align-items: center; gap: 10px; padding: 6px 16px;
          background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 100px; margin-bottom: 40px;
        }
        .pulse-dot {
          width: 8px; height: 8px; background: var(--neon-green); border-radius: 50%;
          box-shadow: 0 0 10px var(--neon-green); animation: pulse 2s infinite;
        }
        .status-text { font-size: 0.8rem; font-weight: 600; color: var(--neon-green); letter-spacing: 0.05em; text-transform: uppercase; }
        
        .hero-title { font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1.1; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 24px; }
        .hero-sub { font-size: clamp(1.1rem, 2vw, 1.25rem); color: var(--text-secondary); line-height: 1.6; max-width: 600px; margin: 0 auto 48px; }
        .cta-group { display: flex; justify-content: center; gap: 20px; margin-bottom: 100px; flex-wrap: wrap; }
        
        .btn-primary {
          background: var(--neon-green); color: #000; padding: 14px 32px;
          border-radius: 12px; font-weight: 700; text-decoration: none;
          display: inline-flex; align-items: center; gap: 10px; transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0, 255, 136, 0.2); }
        .btn-glass {
          background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-light);
          color: white; padding: 14px 32px; border-radius: 12px; font-weight: 600;
          text-decoration: none; transition: background 0.2s, border-color 0.2s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-glass:hover { background: rgba(255, 255, 255, 0.1); border-color: var(--border-hover); }
        .btn-sm { padding: 10px 24px; border-radius: 50px; font-size: 0.9rem; }
        .icon-slide { transition: transform 0.2s; }
        .btn-glass:hover .icon-slide { transform: translateX(3px); }

        /* Stats Grid */
        .stats-hud {
          display: grid; grid-template-columns: repeat(4, 1fr);
          background: rgba(0,0,0,0.4); border: 1px solid var(--border-light);
          border-radius: 20px; backdrop-filter: blur(10px); overflow: hidden;
        }
        .stat-cell {
          padding: 40px 20px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; border-right: 1px solid var(--border-light);
          transition: background 0.3s;
        }
        .stat-cell:last-child { border-right: none; }
        .stat-cell:hover { background: rgba(255,255,255,0.02); }
        .stat-value { font-family: var(--font-mono); font-size: 2.5rem; font-weight: 700; color: white; margin-bottom: 8px; letter-spacing: -0.05em; }
        .stat-label { font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }

        /* --- SECTIONS --- */
        .section { padding: 100px 0; }
        .section-header { text-align: center; margin-bottom: 64px; }
        .section-title { font-size: 2.5rem; margin-bottom: 16px; letter-spacing: -0.02em; }
        .section-desc { color: var(--text-secondary); font-size: 1.1rem; max-width: 600px; margin: 0 auto; }

        /* --- FEATURES --- */
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .feature-card { padding: 40px; display: flex; flex-direction: column; align-items: flex-start; height: 100%; }
        .feature-card:hover { transform: translateY(-4px); border-color: var(--border-hover); }
        .feature-icon { margin-bottom: 24px; color: var(--accent); background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 12px; }
        .feature-title { font-size: 1.5rem; margin-bottom: 12px; font-weight: 700; }
        .feature-desc { color: var(--text-secondary); line-height: 1.6; font-size: 1rem; }

        /* --- ECOSYSTEM --- */
        .ecosystem-card { position: relative; padding: 80px 40px; text-align: center; overflow: hidden; }
        .glow-effect {
          position: absolute; top: -50%; left: 50%; transform: translateX(-50%);
          width: 600px; height: 600px; background: radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%);
          z-index: 0; pointer-events: none;
        }
        .ecosystem-content { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .banner-title { font-size: 2.5rem; margin-bottom: 24px; letter-spacing: -0.02em; }
        .banner-desc { color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 40px; line-height: 1.6; }
        .btn-telegram {
          display: inline-flex; align-items: center; gap: 10px;
          background: #229ED9; color: white; padding: 16px 32px; border-radius: 50px;
          font-weight: 600; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-telegram:hover { transform: translateY(-2px); box-shadow: 0 10px 30px -5px rgba(34, 158, 217, 0.4); }

        /* --- FAQ --- */
        .faq-container { max-width: 800px; }
        .faq-list { display: flex; flex-direction: column; gap: 16px; }
        .faq-item { overflow: hidden; transition: border-color 0.2s; }
        .faq-item.active { border-color: var(--neon-green); background: rgba(0, 255, 136, 0.02); }
        .faq-trigger {
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          padding: 24px; background: none; border: none; color: white; cursor: pointer; text-align: left;
        }
        .faq-q { font-size: 1.1rem; font-weight: 600; }
        .faq-icon-wrapper { color: var(--text-secondary); transition: transform 0.3s; }
        .faq-item.active .faq-icon-wrapper { color: var(--neon-green); transform: rotate(180deg); }
        .faq-content-wrapper { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.4s var(--ease-out); }
        .faq-item.active .faq-content-wrapper { grid-template-rows: 1fr; }
        .faq-answer { overflow: hidden; padding: 0 24px 24px; color: var(--text-secondary); line-height: 1.6; }

        /* --- FOOTER --- */
        .footer { border-top: 1px solid var(--border-light); padding: 80px 0 40px; background: #020202; font-size: 0.95rem; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 80px; margin-bottom: 80px; }
        .footer-brand { font-size: 1.75rem; font-weight: 800; color: white; text-decoration: none; margin-bottom: 24px; display: block; }
        .footer-desc { color: var(--text-secondary); max-width: 320px; line-height: 1.6; font-size: 1rem; }
        .footer-heading { font-size: 0.9rem; font-weight: 700; color: white; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 0.1em; }
        .footer-links-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 20px; }
        .footer-links-list a { color: var(--text-secondary); text-decoration: none; transition: color 0.2s; }
        .footer-links-list a:hover { color: white; }
        .footer-bottom { border-top: 1px solid var(--border-light); padding-top: 40px; display: flex; flex-direction: column; align-items: center; gap: 24px; text-align: center; }
        .copyright { color: var(--text-tertiary); font-size: 0.9rem; }

        /* --- RESPONSIVE --- */
        @media (max-width: 1024px) {
           .nav-links { display: none; }
           .menu-toggle { display: block; }
           .stats-hud { grid-template-columns: 1fr 1fr; }
           .stat-cell:nth-child(2) { border-right: none; }
           .stat-cell { border-bottom: 1px solid var(--border-light); }
           .stat-cell:nth-last-child(-n+2) { border-bottom: none; }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 2.75rem; }
          .footer-grid { grid-template-columns: 1fr; gap: 40px; }
          .cta-group { flex-direction: column; width: 100%; }
          .btn-primary, .btn-glass { width: 100%; justify-content: center; }
          .md-visible { display: none; }
        }

        /* --- ANIMATIONS --- */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 1s var(--ease-out) forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 255, 136, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
        }
      `}</style>
    </div>
  );
}