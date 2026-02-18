'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Zap, ShieldCheck, Smartphone, Send, Menu, X, Globe, BarChart3, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import LegalDocs from './LegalDocs';

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [dashboardLink, setDashboardLink] = useState("/login");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Scroll listener for Navbar Glass effect
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Partner Logic
    const partnerId = localStorage.getItem("p_id");
    const oldCode = localStorage.getItem("cashttree_referral");
    if (partnerId) {
      setDashboardLink("/dashboard");
    } else if (oldCode) {
      setDashboardLink(`/dashboard?code=${oldCode}`);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container">
      <Script src="https://nap5k.com/tag.min.js" strategy="lazyOnload" data-zone="10337480" />

      {/* --- AMBIENT BACKGROUND GLOW --- */}
      <div className="ambient-glow" />

      {/* --- NAVIGATION --- */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link href="/" className="brand">
            Cash<span className="text-neon">Tree</span>
          </Link>

          {/* Desktop Links */}
          <nav className="nav-links desktop-only">
            <Link href="/campaigns" className="nav-link">Live Inventory</Link>
            <a href="#protocol" className="nav-link">Protocol</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </nav>

          {/* Actions */}
          <div className="nav-actions">
            <Link href={dashboardLink} className="btn-glass dashboard-btn">
              Dashboard <ArrowRight size={14} />
            </Link>
            <button className="mobile-toggle" onClick={() => setIsNavOpen(!isNavOpen)}>
              {isNavOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu ${isNavOpen ? 'open' : ''}`}>
          <div className="mobile-links">
             <Link href="/campaigns" onClick={() => setIsNavOpen(false)}>Live Inventory</Link>
             <a href="#protocol" onClick={() => setIsNavOpen(false)}>Protocol</a>
             <a href="#faq" onClick={() => setIsNavOpen(false)}>FAQ</a>
          </div>
        </div>
      </header>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="hero-section">
          <div className="container hero-content">
            <div className="badge animate-in fade-down">
              <span className="badge-dot"></span> v2.0 Protocol Live
            </div>
            
            <h1 className="hero-title animate-in fade-up">
              The Performance <br/>
              <span className="text-gradient">Reward Layer.</span>
            </h1>
            
            <p className="hero-subtitle animate-in fade-up delay-100">
              The infrastructure for modern publishers to monetize traffic.<br className="hidden-mobile"/>
              Direct API connections. Instant liquidity. Enterprise-grade tracking.
            </p>
            
            <div className="hero-cta-group animate-in fade-up delay-200">
              <Link href="/campaigns" className="btn-primary">
                View Inventory <ArrowRight size={18} />
              </Link>
              
              <Link href={dashboardLink} className="btn-glass">
                Partner Login
              </Link>
            </div>

            {/* STATS GRID */}
            <div className="stats-grid animate-in fade-up delay-300">
              <div className="stat-card">
                <div className="stat-value">5K+</div>
                <div className="stat-label">Active Nodes</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">12ms</div>
                <div className="stat-label">Global Latency</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">100%</div>
                <div className="stat-label">Verified Traffic</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">T+0</div>
                <div className="stat-label">Instant Settlement</div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PROTOCOL SECTION --- */}
        <section id="protocol" className="section protocol-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">The Protocol</h2>
              <p className="section-desc">Streamlined monetization infrastructure built for scale.</p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card glass-panel">
                <div className="icon-wrapper color-yellow">
                  <Globe size={32}/>
                </div>
                <h3>1. Source</h3>
                <p>Access high-yield CPA campaigns from Tier-1 financial institutions and global app partners directly via our marketplace.</p>
              </div>
              
              <div className="feature-card glass-panel">
                <div className="icon-wrapper color-blue">
                  <BarChart3 size={32}/>
                </div>
                <h3>2. Execute</h3>
                <p>Drive traffic via smart tracking links. Our Server-to-Server (S2S) engine validates conversions in real-time with 99.9% uptime.</p>
              </div>
              
              <div className="feature-card glass-panel">
                <div className="icon-wrapper color-green">
                  <Lock size={32}/>
                </div>
                <h3>3. Settle</h3>
                <p>Automated payout processing via UPI and Bank Transfer. Zero-fee withdrawal architecture for verified publishers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- ECOSYSTEM BANNER --- */}
        <section className="section ecosystem-section">
          <div className="container">
            <div className="ecosystem-banner glass-panel">
              <div className="banner-content">
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
                  <Send size={18} /> Join Official Channel
                </a>
              </div>
              <div className="banner-glow" />
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section id="faq" className="section faq-section">
          <div className="container max-w-lg">
            <div className="section-header">
              <h2 className="section-title">System FAQ</h2>
            </div>
            
            <div className="faq-list">
              <FaqItem 
                question="What type of traffic is accepted?" 
                answer="We accept organic traffic from Social Media (YouTube, Telegram, Instagram), SEO (Blogs/Websites), and Email Lists. Incentivized traffic is permitted only for specific 'Task' campaigns marked in the dashboard." 
                isOpen={activeFaq === 1} onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
              />
              <FaqItem 
                question="What is the payout cycle?" 
                answer="We operate on a T+0 (Instant) model for verified publishers. Once a conversion is approved by the advertiser postback, funds are available for immediate withdrawal to your linked UPI account." 
                isOpen={activeFaq === 2} onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
              />
              <FaqItem 
                question="Do you provide API access?" 
                answer="Yes. High-volume partners can request Postback/Webhook integration to track conversions on their own internal dashboards. Contact support for documentation." 
                isOpen={activeFaq === 3} onClick={() => setActiveFaq(activeFaq === 3 ? null : 3)}
              />
              <FaqItem 
                question="Why was my conversion rejected?" 
                answer="Rejections occur if the advertiser detects fraud (VPN/Proxy), duplicate IPs, or if the user fails to meet the KPI (Key Performance Indicator) such as 'New User Only' or 'Minimum Deposit'." 
                isOpen={activeFaq === 4} onClick={() => setActiveFaq(activeFaq === 4 ? null : 4)}
              />
              <FaqItem 
                question="Is there a minimum withdrawal limit?" 
                answer="The minimum withdrawal threshold is dynamic based on your publisher tier, typically starting at ₹50. This ensures efficient processing of thousands of daily transactions." 
                isOpen={activeFaq === 5} onClick={() => setActiveFaq(activeFaq === 5 ? null : 5)}
              />
              <FaqItem 
                question="How do I verify my account?" 
                answer="Verification is automated. Simply link a valid phone number and complete your first campaign. For high-ticket payouts, additional KYC may be requested for compliance." 
                isOpen={activeFaq === 6} onClick={() => setActiveFaq(activeFaq === 6 ? null : 6)}
              />
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="footer-section">
          <div className="container">
            <div className="footer-grid">
              
              {/* Brand Column */}
              <div className="footer-col brand-col">
                <Link href="/" className="footer-brand">
                  Cash<span className="text-neon">Tree</span>
                </Link>
                <p className="footer-desc">
                  The performance reward layer for the modern internet. 
                  Connecting creators with instant liquidity.
                </p>
              </div>

              {/* Links Column */}
              <div className="footer-col">
                <h4>Platform</h4>
                <div className="footer-links">
                  <Link href="/campaigns">Live Inventory</Link>
                  <a href="#protocol">The Protocol</a>
                  <Link href={dashboardLink}>Partner Login</Link>
                </div>
              </div>

              {/* Support Column */}
              <div className="footer-col">
                <h4>Support</h4>
                <div className="footer-links">
                  <Link href="/contact">Contact Us</Link>
                  <a href="mailto:help@cashttree.online">help@cashttree.online</a>
                  <a href="https://t.me/CashtTree_bot" target="_blank">Telegram Support</a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
              <LegalDocs />
              <div className="copyright">
                © 2026 CashTree Network. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* --- PREMIUM STYLESHEET (GLASS DESIGN SYSTEM) --- */}
      <style jsx global>{`
        :root {
          --bg-dark: #050505;
          --glass-border: rgba(255, 255, 255, 0.08);
          --glass-surface: rgba(255, 255, 255, 0.03);
          --glass-highlight: rgba(255, 255, 255, 0.08);
          --neon-green: #00ff88;
          --text-primary: #ffffff;
          --text-secondary: #888888;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Base Reset */
        body {
          background-color: var(--bg-dark);
          color: var(--text-primary);
          font-family: var(--font-sans);
          margin: 0;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .app-container {
          position: relative;
          min-height: 100vh;
        }

        /* Ambient Background */
        .ambient-glow {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 100vh;
          background: radial-gradient(circle at 50% -20%, rgba(0, 255, 136, 0.08), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Layout Utils */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }
        .max-w-lg { max-width: 800px; }

        /* Typography */
        h1, h2, h3 { letter-spacing: -0.02em; font-weight: 800; margin: 0; }
        .text-neon { color: var(--neon-green); }
        .text-gradient {
          background: linear-gradient(135deg, #fff 30%, #888 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* --- NAVBAR --- */
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 70px;
          display: flex;
          align-items: center;
          z-index: 100;
          transition: all 0.3s ease;
          border-bottom: 1px solid transparent;
        }
        .navbar.scrolled {
          background: rgba(5, 5, 5, 0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
        }
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .brand {
          font-size: 1.5rem;
          font-weight: 800;
          text-decoration: none;
          color: white;
          letter-spacing: -1px;
        }
        .nav-links.desktop-only {
          display: flex;
          gap: 32px;
        }
        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover { color: white; }
        
        /* Mobile Menu */
        .mobile-toggle { display: none; background: none; border: none; color: white; }
        .mobile-menu {
          position: fixed; top: 70px; left: 0; right: 0; bottom: 0;
          background: var(--bg-dark);
          transform: translateY(-100%);
          transition: transform 0.3s ease;
          z-index: 90;
          padding: 40px;
          display: flex;
          flex-direction: column;
        }
        .mobile-menu.open { transform: translateY(0); }
        .mobile-links a {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          text-decoration: none;
          margin-bottom: 24px;
          display: block;
        }

        /* --- HERO --- */
        .hero-section {
          padding: 160px 0 100px;
          text-align: center;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 100px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }
        .badge-dot { width: 6px; height: 6px; background: var(--neon-green); border-radius: 50%; box-shadow: 0 0 10px var(--neon-green); }
        
        .hero-title {
          font-size: 4rem;
          line-height: 1.1;
          margin-bottom: 24px;
        }
        .hero-subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto 40px;
        }
        .hero-cta-group {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 80px;
        }

        /* Buttons */
        .btn-primary {
          background: var(--neon-green);
          color: #000;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        }
        .btn-glass {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-glass:hover { background: rgba(255, 255, 255, 0.1); }
        .dashboard-btn { padding: 8px 20px; font-size: 0.9rem; border-radius: 50px; }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          border-top: 1px solid var(--glass-border);
          padding-top: 40px;
        }
        .stat-value { font-size: 2rem; font-weight: 800; color: white; margin-bottom: 4px; }
        .stat-label { font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }

        /* --- FEATURES --- */
        .section { padding: 100px 0; }
        .section-header { text-align: center; margin-bottom: 60px; }
        .section-title { font-size: 2.5rem; margin-bottom: 16px; }
        .section-desc { color: var(--text-secondary); font-size: 1.1rem; }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .glass-panel {
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          padding: 40px;
          transition: transform 0.3s, border-color 0.3s;
        }
        .glass-panel:hover {
          transform: translateY(-5px);
          border-color: var(--glass-highlight);
        }
        .icon-wrapper { margin-bottom: 24px; display: inline-flex; }
        .color-yellow { color: #fbbf24; }
        .color-blue { color: #3b82f6; }
        .color-green { color: #00ff88; }
        
        .feature-card h3 { font-size: 1.5rem; margin-bottom: 12px; }
        .feature-card p { color: var(--text-secondary); line-height: 1.6; }

        /* --- ECOSYSTEM --- */
        .ecosystem-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 60px;
          position: relative;
          overflow: hidden;
        }
        .banner-content { position: relative; z-index: 2; max-width: 600px; }
        .banner-glow {
          position: absolute; right: -100px; top: -100px; width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(0,255,136,0.1), transparent 70%);
          z-index: 1;
        }
        .btn-telegram {
          display: inline-flex; alignItems: center; gap: 10px;
          background: #229ED9; color: white; padding: 14px 30px;
          border-radius: 50px; font-weight: 700; text-decoration: none;
          margin-top: 30px; transition: transform 0.2s;
        }
        .btn-telegram:hover { transform: translateY(-2px); }

        /* --- FAQ --- */
        .faq-item {
          border-bottom: 1px solid var(--glass-border);
        }
        .faq-question {
          width: 100%; text-align: left; background: none; border: none;
          color: white; font-size: 1.1rem; font-weight: 600;
          padding: 24px 0; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
        }
        .faq-answer {
          color: var(--text-secondary); line-height: 1.6;
          overflow: hidden; transition: all 0.3s ease;
        }

        /* --- FOOTER --- */
        .footer-section {
          border-top: 1px solid var(--glass-border);
          padding: 80px 0 40px;
          background: #020202;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 60px;
        }
        .footer-brand { font-size: 1.5rem; font-weight: 800; color: white; text-decoration: none; }
        .footer-desc { margin-top: 16px; color: var(--text-secondary); line-height: 1.6; max-width: 300px; }
        .footer-links { display: flex; flexDirection: column; gap: 16px; margin-top: 24px; }
        .footer-links a { color: var(--text-secondary); text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: white; }
        .footer-bottom {
          border-top: 1px solid var(--glass-border);
          padding-top: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .copyright { font-size: 0.8rem; color: #444; }

        /* --- MOBILE RESPONSIVENESS --- */
        @media (max-width: 768px) {
          .nav-links.desktop-only { display: none; }
          .mobile-toggle { display: block; }
          .hero-title { font-size: 2.5rem; }
          .hero-subtitle { font-size: 1rem; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .hero-cta-group { flex-direction: column; }
          .footer-grid { grid-template-columns: 1fr; gap: 40px; }
          .ecosystem-banner { flex-direction: column; text-align: center; padding: 40px 20px; }
          .btn-telegram { width: 100%; justify-content: center; }
          .hidden-mobile { display: none; }
        }

        /* --- ANIMATIONS --- */
        .animate-in { animation-duration: 0.6s; animation-fill-mode: both; ease-out; }
        .fade-up { animation-name: fadeUp; }
        .fade-down { animation-name: fadeDown; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function FaqItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={onClick}>
        {question}
        {isOpen ? <ChevronUp size={20} color="#00ff88"/> : <ChevronDown size={20} color="#666"/>}
      </button>
      <div style={{ maxHeight: isOpen ? '200px' : '0', opacity: isOpen ? 1 : 0, transition: 'all 0.3s ease' }}>
        <p style={{ paddingBottom: '24px', margin: 0 }}>{answer}</p>
      </div>
    </div>
  );
}