'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Zap, ShieldCheck, Smartphone, CheckCircle2, Menu, X } from 'lucide-react';
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
            <Link href="/campaigns">Live Offers</Link>
            <a href="#how-it-works">Protocol</a>
            <a href="#faq">FAQ</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link href={dashboardLink} id="menuDashboardLink" style={{ padding: '8px 20px', borderRadius: '50px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
             <Link href="/campaigns" onClick={() => setIsNavOpen(false)}>Live Offers</Link>
             <a href="#how-it-works" onClick={() => setIsNavOpen(false)}>Protocol</a>
             <a href="#faq" onClick={() => setIsNavOpen(false)}>FAQ</a>
          </div>
        )}
      </header>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="hero">
          <div className="container">
            <div className="animate-fluent">
              <div className="tag success" style={{display: 'inline-block', marginBottom: '20px'}}>
                ● Network Status: Online
              </div>
              
              <h1>The Performance <br/> <span style={{color: '#00ff88'}}>Reward Layer.</span></h1>
              
              <p className="lead">
                The infrastructure for Indian creators to monetize traffic. <br/>
                Direct bank connections. Zero friction. Instant settlement.
              </p>
              
              <div className="hero-actions-equal" style={{display: 'flex', justifyContent: 'center', gap: '15px', maxWidth: '100%', flexWrap: 'wrap'}}>
                <Link href="/campaigns" className="btn primary" style={{minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                  View Live Campaigns <ArrowRight size={18} />
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
              <div className="stat-item"><div className="stat-value">T+0</div><div className="stat-label">Payout</div></div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="how-it-works" className="section" style={{background: 'rgba(255,255,255,0.02)'}}>
          <div className="container">
            <h2 className="section-title">The Protocol</h2>
            <p className="section-sub">Three-step high-frequency earning mechanism.</p>
            
            <div className="steps">
              <div className="step animate-fluent delay-100">
                <div style={{color: '#fbbf24', marginBottom: '15px', display: 'flex', justifyContent: 'center'}}><Zap size={32}/></div>
                <h3>1. Discover</h3>
                <p>Access high-yield financial offers from verified institutions like Kotak & Angel One.</p>
              </div>
              <div className="step animate-fluent delay-200">
                <div style={{color: '#3b82f6', marginBottom: '15px', display: 'flex', justifyContent: 'center'}}><Smartphone size={32}/></div>
                <h3>2. Execute</h3>
                <p>Complete the digital task (Install/KYC). Our postback engine tracks it in real-time.</p>
              </div>
              <div className="step animate-fluent delay-300">
                <div style={{color: '#00ff88', marginBottom: '15px', display: 'flex', justifyContent: 'center'}}><ShieldCheck size={32}/></div>
                <h3>3. Settlement</h3>
                <p>Funds are credited instantly. Withdraw to any UPI ID immediately.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- ACCESS / PAYMENT --- */}
        <section className="access-section">
          <div className="container">
            <div className="access-card animate-fluent">
              <div className="access-glow"></div>
              <h2 className="section-title">Unlock Full Access</h2>
              <p className="section-sub" style={{maxWidth: '600px', margin: '0 auto 40px'}}>
                Join the <strong>Private Telegram Community</strong>. Get insider guides, priority support, and verified earning methods.
              </p>

              <div className="price-tag">
                 <div className="price-left">
                    <div className="price-strike">Standard Fee ₹99</div>
                    <div className="price-main">₹49</div>
                 </div>
                 <div className="price-divider"></div>
                 <div className="price-right">
                    One-time<br/>Lifetime Access
                 </div>
              </div>

              <div className="center-stack">
                <a href="https://razorpay.me/@cashttree?amount=rZC5NMufSVtgb9QV3szYxw%3D%3D" target="_blank" rel="noopener noreferrer" className="pay-btn">
                  ⚡ Unlock Access Now
                </a>
                
                <a href="https://t.me/CashtTree_bot" target="_blank" style={{marginTop: '20px', color: '#666', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}>
                  <CheckCircle2 size={16}/> Verify Payment via Telegram Bot
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* --- FAQ --- */}
        <section id="faq" className="section">
          <div className="container" style={{maxWidth: '800px'}}>
            <h2 className="section-title">System FAQ</h2>
            <div className="faq-list">
              <FaqItem 
                question="Is this platform legitimate?" 
                answer="Yes. We act as a technology partner for major ad networks. All offers redirect to official brand pages. We do not host any files ourselves." 
                isOpen={activeFaq === 1} onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
              />
              <FaqItem 
                question="Do I need to pay to earn?" 
                answer="No. The campaigns (tasks) are free to do. The ₹49 fee is strictly for access to our premium community and educational guides." 
                isOpen={activeFaq === 2} onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
              />
              <FaqItem 
                question="How do I withdraw?" 
                answer="We support instant UPI withdrawals (GPay, PhonePe, Paytm). Minimum withdrawal limits apply based on your activity level." 
                isOpen={activeFaq === 3} onClick={() => setActiveFaq(activeFaq === 3 ? null : 3)}
              />
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="footer">
          <div className="container">
            <div className="footer-inner">
              <div style={{textAlign: 'left'}}>
                <h4 style={{color: '#fff', marginBottom: '10px'}}>CashTree</h4>
                <p>The performance reward layer for the modern internet.</p>
              </div>
              <div className="footer-links">
                <button style={{background:'none', border:'none', color:'#666', marginRight:'20px', cursor: 'pointer'}}>Terms</button>
                <button style={{background:'none', border:'none', color:'#666', marginRight:'20px', cursor: 'pointer'}}>Privacy</button>
                <button style={{background:'none', border:'none', color:'#666', cursor: 'pointer'}}>Refunds</button>
              </div>
            </div>
            <div style={{marginTop: '40px', fontSize: '0.8rem', opacity: 0.5}}>© 2024 CashTree. All rights reserved.</div>
          </div>
        </footer>
      </main>

      <LegalDocs />
    </div>
  );
}

// --- SUB-COMPONENT (Helper) ---
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