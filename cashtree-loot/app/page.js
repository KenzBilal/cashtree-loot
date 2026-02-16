'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Zap, ShieldCheck, Smartphone, Send, Menu, X, Globe, BarChart3, Lock } from 'lucide-react';
import LegalDocs from './LegalDocs';

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [dashboardLink, setDashboardLink] = useState("/login");

  useEffect(() => {
    const partnerId = localStorage.getItem("p_id");
    const oldCode = localStorage.getItem("cashttree_referral");
    if (partnerId) {
      setDashboardLink("/dashboard");
    } else if (oldCode) {
      setDashboardLink(`/dashboard?code=${oldCode}`);
    }
  }, []);

  return (
    <div className="main-wrapper">
      <Script src="https://nap5k.com/tag.min.js" strategy="lazyOnload" data-zone="10337480" />

      {/* --- HEADER --- */}
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">
            Cash<span>Tree</span>
          </Link>

          {/* Desktop Nav */}
          <div className="nav-links" style={{ display: isNavOpen ? 'none' : 'flex' }}>
            <Link href="/campaigns">Live Inventory</Link>
            <a href="#protocol">Protocol</a>
            <a href="#faq">FAQ</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link href={dashboardLink} id="menuDashboardLink" style={{ padding: '8px 24px', borderRadius: '50px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Dashboard <ArrowRight size={14} />
            </Link>
            <button className="nav-toggle" onClick={() => setIsNavOpen(!isNavOpen)}>
              {isNavOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isNavOpen && (
          <div className="nav-links nav-open" style={{ display: 'flex' }}>
             <Link href="/campaigns" onClick={() => setIsNavOpen(false)}>Live Inventory</Link>
             <a href="#protocol" onClick={() => setIsNavOpen(false)}>Protocol</a>
             <a href="#faq" onClick={() => setIsNavOpen(false)}>FAQ</a>
          </div>
        )}
      </header>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="hero">
          <div className="container">
            <div className="animate-fluent">
              
              <h1>The Performance <br/> <span style={{color: '#00ff88'}}>Reward Layer.</span></h1>
              
              <p className="lead">
                The infrastructure for modern publishers to monetize traffic.<br/>
                Direct API connections. Instant liquidity. Enterprise-grade tracking.
              </p>
              
              <div className="hero-actions-equal" style={{display: 'flex', justifyContent: 'center', gap: '15px', maxWidth: '100%', flexWrap: 'wrap'}}>
                <Link href="/campaigns" className="btn primary" style={{minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                  View Inventory <ArrowRight size={18} />
                </Link>
                
                <Link href={dashboardLink} className="hero-btn" style={{minWidth: '200px', flexDirection: 'row', gap: '10px'}}>
                  Partner Login
                </Link>
              </div>
            </div>

            {/* STATS */}
            <div className="stats-row animate-fluent delay-200">
              <div className="stat-item"><div className="stat-value">5K+</div><div className="stat-label">Active Nodes</div></div>
              <div className="stat-item"><div className="stat-value">12ms</div><div className="stat-label">Latency</div></div>
              <div className="stat-item"><div className="stat-value">100%</div><div className="stat-label">Verified</div></div>
              <div className="stat-item"><div className="stat-value">T+0</div><div className="stat-label">Settlement</div></div>
            </div>
          </div>
        </section>

        {/* --- THE PROTOCOL --- */}
        <section id="protocol" className="section" style={{background: 'rgba(255,255,255,0.02)'}}>
          <div className="container">
            <h2 className="section-title">The Protocol</h2>
            <p className="section-sub">Streamlined monetization infrastructure.</p>
            
            <div className="steps">
              <div className="step animate-fluent delay-100">
                <div style={{color: '#fbbf24', marginBottom: '20px', display: 'flex', justifyContent: 'center'}}><Globe size={32}/></div>
                <h3>1. Source</h3>
                <p>Access high-yield CPA campaigns from Tier-1 financial institutions and global app partners.</p>
              </div>
              <div className="step animate-fluent delay-200">
                <div style={{color: '#3b82f6', marginBottom: '20px', display: 'flex', justifyContent: 'center'}}><BarChart3 size={32}/></div>
                <h3>2. Execute</h3>
                <p>Drive traffic via tracking links. Our S2S (Server-to-Server) engine validates conversions in real-time.</p>
              </div>
              <div className="step animate-fluent delay-300">
                <div style={{color: '#00ff88', marginBottom: '20px', display: 'flex', justifyContent: 'center'}}><Lock size={32}/></div>
                <h3>3. Settle</h3>
                <p>Automated payout processing via UPI. Zero-fee withdrawal architecture.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- COMMUNITY (Replaced Pay Button) --- */}
        <section className="access-section">
          <div className="container">
            <div className="access-card animate-fluent" style={{padding: '80px 40px'}}>
              <div className="access-glow"></div>
              
              <h2 className="section-title" style={{fontSize: '2.5rem'}}>Join the Ecosystem</h2>
              <p className="section-sub" style={{maxWidth: '600px', margin: '0 auto 50px'}}>
                Connect with thousands of publishers. Get real-time updates on high-converting offers, maintenance alerts, and optimization strategies.
              </p>

              <div style={{display: 'flex', justifyContent: 'center'}}>
                <a 
                  href="https://t.me/CashtTree_bot" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: '#229ED9',
                    color: 'white',
                    padding: '16px 40px',
                    borderRadius: '50px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    textDecoration: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 10px 30px -5px rgba(34, 158, 217, 0.4)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Send size={20} /> Join Official Channel
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* --- PROFESSIONAL FAQ --- */}
        <section id="faq" className="section">
          <div className="container" style={{maxWidth: '800px'}}>
            <h2 className="section-title">System FAQ</h2>
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
        <footer className="footer" style={{borderTop: '1px solid #222', marginTop: 'auto', background: '#020202', padding: '80px 0 40px'}}>
          <div className="container">
            
            <div style={{
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '40px', 
              marginBottom: '60px', 
              textAlign: 'left'
            }}>
              
              {/* Brand */}
              <div>
                <Link href="/" className="brand" style={{fontSize: '1.5rem', marginBottom: '15px', display: 'block'}}>
                  Cash<span style={{color: '#00ff88'}}>Tree</span>
                </Link>
                <p style={{color: '#666', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '300px'}}>
                  The performance reward layer for the modern internet. 
                  Connecting creators with instant liquidity.
                </p>
              </div>

              {/* Platform */}
              <div>
                <h4 style={{color: '#fff', fontSize: '1rem', marginBottom: '20px', fontWeight: '700'}}>Platform</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#888'}}>
                  <Link href="/campaigns" style={{transition: '0.2s', color: '#aaa'}}>Live Inventory</Link>
                  <a href="#protocol" style={{transition: '0.2s', color: '#aaa'}}>The Protocol</a>
                  <Link href={dashboardLink} style={{transition: '0.2s', color: '#aaa'}}>Partner Login</Link>
                </div>
              </div>

              {/* Support */}
              <div>
                <h4 style={{color: '#fff', fontSize: '1rem', marginBottom: '20px', fontWeight: '700'}}>Support</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#888'}}>
                  <Link href="/contact" style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', transition: 'color 0.2s'}}>
                     📞 Contact Us
                  </Link>
                  <a href="mailto:help@cashttree.online" style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa'}}>
                     📧 help@cashttree.online
                  </a>
                  <a href="https://t.me/CashtTree_bot" target="_blank" style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa'}}>
                     ✈️ Telegram Support
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
              borderTop: '1px solid #222', 
              paddingTop: '30px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '20px'
            }}>
              <LegalDocs />
              <div style={{color: '#444', fontSize: '0.8rem'}}>
                © 2024 CashTree Network. All rights reserved.
              </div>
            </div>

          </div>
        </footer>
      </main>
    </div>
  );
}

// --- HELPER COMPONENT ---
function FaqItem({ question, answer, isOpen, onClick }) {
  return (
    <div className={`faq-item ${isOpen ? 'active' : ''}`}>
      <button className="faq-question" onClick={onClick}>
        {question}
        <span style={{color: '#00ff88'}}>{isOpen ? '−' : '+'}</span>
      </button>
      <div className="faq-answer" style={{maxHeight: isOpen ? '500px' : '0', paddingBottom: isOpen ? '20px' : '0'}}>
        <p>{answer}</p>
      </div>
    </div>
  );
}