'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function LandingPage() {
  // --- STATE ---
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showMobileCta, setShowMobileCta] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/login'); // Default to login

  // --- LOGIC: REPLICATING SCRIPT.JS ---
  useEffect(() => {
    // 1. DASHBOARD REDIRECT LOGIC (From your script.js Section D)
    // Checks if user is already a partner stored in local browser
    const partnerId = localStorage.getItem("p_id");
    const oldCode = localStorage.getItem("cashttree_referral");
    
    if (partnerId) {
      setDashboardUrl('/dashboard');
    } else if (oldCode) {
      // If migrating old users, we can handle params later, 
      // but for now send them to dashboard/login
      setDashboardUrl('/dashboard'); 
    }

    // 2. SMART CTA SCROLL LOGIC (From your script.js Section C)
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    
    const handleScroll = () => {
      const mobileCta = document.getElementById("mobileCta");
      if (!mobileCta) return;

      // Check cooldown
      const lastClosed = localStorage.getItem("ctaClosedTime");
      const now = new Date().getTime();
      if (lastClosed && (now - lastClosed < ONE_DAY_MS)) return;

      // Check 50% Scroll
      const scrollPercentage = ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100;
      
      if (scrollPercentage > 50) {
        setShowMobileCta(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- HANDLERS ---
  const toggleNav = (e) => {
    e.preventDefault();
    setIsNavOpen(!isNavOpen);
  };

  const closeMenu = () => setIsNavOpen(false);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const closeMobileCta = () => {
    setShowMobileCta(false);
    localStorage.setItem("ctaClosedTime", new Date().getTime());
  };

  // --- JSON-LD SCHEMA ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CashTree Loot",
    "url": "https://cashttree.online/",
    "logo": "https://cashttree.online/logo.webp",
    "description": "CashTree Loot curates verified refer & earn apps, cashback offers, and earning guides for Indian users."
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="ad-sandbox">
        <Script 
          src="https://nap5k.com/tag.min.js" 
          strategy="lazyOnload" 
          data-zone="10337480"
        />
      </div>

      {/* HEADER */}
      <header className="nav" role="banner">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <img src="/logo.webp" alt="CashTree Logo" className="brand-logo" />
            <span className="brand-text">Cash<span>Tree</span></span>
          </Link>

          <button 
            id="navToggle" 
            className="nav-toggle" 
            aria-label="Toggle navigation"
            onClick={toggleNav}
          >
            ☰
          </button>

          {/* Mobile Menu Logic */}
          <div id="navLinks" className={`nav-links ${isNavOpen ? 'nav-open' : ''}`}>
            <a href="#how-it-works" onClick={closeMenu}>How it Works</a>
            <a href="#faq" onClick={closeMenu}>FAQ</a>
            {/* DYNAMIC DASHBOARD LINK */}
            <Link href={dashboardUrl} id="menuDashboardLink" className="dashboard-link"> 
               📊 Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main onClick={() => isNavOpen && closeMenu()}> {/* Close menu when clicking outside */}
        
        {/* HERO */}
        <section className="hero" id="hero">
          <div className="container hero-inner">
            <div className="hero-left">
              <h1>
                Fast, verified referral offers<br />
                <span className="hero-highlight">that actually work</span>
              </h1>
              <p className="lead">
                Discover <strong>tested earning campaigns</strong>, clear instructions,
                and optional tools used by people monetizing traffic online.
              </p>
              <div className="hero-actions-equal">
                <a href="#offers" className="hero-btn">Explore Offers</a>
                <a href="#how-it-works" className="hero-btn">How it works</a>
                <a href="#faq" className="hero-btn">FAQ</a>
              </div>
              <div className="cta-center">
                <a className="create-link-cta" href="#create-link">
                  🚀 Create your own referral link
                </a>
              </div>
              <p className="hero-trust">
                ✔ One-time access • ✔ No income guarantee • ✔ Telegram support
              </p>
            </div>
          </div>
        </section>

        {/* OFFERS GRID */}
        <section id="offers" className="section">
          <div className="container">
            <h2 className="section-title">Top Verified Offers</h2>
            <p className="section-sub">
              Carefully selected official campaigns. No forced tasks.
            </p>

            <div className="offer-grid">
              
              {/* COPY-PASTE YOUR OFFER CARDS HERE EXACTLY FROM HTML */}
              {/* Example Card 1 */}
              <article className="offer-card">
                <div className="offer-head">  
                  <h3>Airtel Thanks – App Task Offer</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Install & login with Airtel number</li>
                  <li>Complete simple tasks inside the app</li>
                  <li>Reward after task approval</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹100</strong></div>
                  <a className="btn primary full-width" href="https://lootcampaign.in?camp=Atl&ref=VMIZAvSI" target="_blank" rel="noopener">Get ₹100 →</a>
                </div>
              </article>

               {/* Example Card 2 */}
               <article className="offer-card verified">
                <div className="offer-head">
                  <h3>Upstox – Free Demat Account</h3>
                  <span className="tag success">CashTree Verified</span>
                </div>
                <div className="payout">Earn <strong>₹200</strong></div>
                <ul className="offer-points">
                  <li>Install & sign up via referral</li>
                  <li>Complete KYC (no deposit)</li>
                  <li>Reward after approval</li>
                </ul>
                <div className="offer-meta">⚡ Payout: 24–48 hrs &nbsp;|&nbsp; 👤 New users only</div>
                <div className="offer-footer">
                  <a className="btn primary full-width" href="https://campguruji.in/camp/hw52jghh" target="_blank" rel="noopener">Get ₹200 →</a>
                </div>
              </article>

              {/* ... PASTE ALL OTHER CARDS HERE ... */}

            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="section">
          <div className="container">
            <h2 className="section-title">How it works</h2>
            <div className="steps">
              <div className="step">
                <h3>1. Open the Offer</h3>
                <p>Click an offer card to visit the official campaign page.</p>
              </div>
              <div className="step">
                <h3>2. Complete the Task</h3>
                <p>Install, register, verify, or complete the required action.</p>
              </div>
              <div className="step">
                <h3>3. Receive the Reward</h3>
                <p>Rewards are credited by the provider after verification.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section">
          <div className="container">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq">
              <FaqItem 
                question="Are these offers legitimate?" 
                answer="Yes. Every offer listed redirects you to an official campaign page." 
                isOpen={openFaqIndex === 0}
                onClick={() => toggleFaq(0)}
              />
              <FaqItem 
                question="Do I need to pay?" 
                answer="Most offers are free. Some require small actions." 
                isOpen={openFaqIndex === 1}
                onClick={() => toggleFaq(1)}
              />
              {/* Add other FAQs... */}
            </div>
          </div>
        </section>

        {/* CREATE LINK / PAYMENT */}
        <section id="create-link" className="section">
          <div className="container">
            <h2 className="section-title">Create Your Own Referral Link</h2>
            <div className="center-stack">
              <a href="https://razorpay.me/@cashttree?amount=rZC5NMufSVtgb9QV3szYxw%3D%3D" className="pay-btn" target="_blank" rel="noopener">
                <span className="price">
                  <span className="price-old"><s>₹99</s></span>
                  <span className="price-new">₹49</span>
                  <span className="label">Unlock Access</span>
                </span>
               
              </a>
            </div>
            <div className="center-stack">
              <a className="telegram-btn" href="https://t.me/CashtTree_bot" target="_blank" rel="noopener">
                Open Telegram Bot
              </a>
            </div>
            <div className="steps-box">
              <h3>How access works</h3>
              <ol>
                <li>Pay ₹49</li>
                <li>Open Bot</li>
                <li>Submit Payment ID</li>
                <li>Get Access</li>
              </ol>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="container footer-inner">
            <div>© CashTree Loot</div>
            <div className="footer-links">
              <a href="#offers">Offers</a>
              <a href="#how-it-works">How it works</a>
              <a href="#faq">FAQ</a>
              <Link href="/tools">Tools</Link>
            </div>
          </div>
        </footer>

        {/* MOBILE CTA (Condition matches script.js) */}
        <div 
          id="mobileCta" 
          className={`mobile-cta ${showMobileCta ? 'visible' : ''}`} 
          role="dialog"
        >
          <a href="https://t.me/CashtTree_bot" target="_blank" rel="noopener" className="cta-main">
            🚀 Join Telegram & Unlock Access
          </a>
          <button className="cta-close" type="button" onClick={closeMobileCta}>✕</button>
        </div>

      </main>
    </>
  );
}

// --- HELPER FOR FAQS ---
function FaqItem({ question, answer, isOpen, onClick }) {
  return (
    <div className={`faq-item ${isOpen ? 'active' : ''}`}>
      <button className="faq-question" onClick={onClick}>{question}</button>
      <div className="faq-answer" style={{ display: isOpen ? 'block' : 'none' }}>
        <p>{answer}</p>
      </div>
    </div>
  );
}