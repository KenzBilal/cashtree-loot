'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  // --- STATE ---
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showMobileCta, setShowMobileCta] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/login');

  // --- MAIN LOGIC (THE BRAIN) ---
  useEffect(() => {
    // 1. CAPTURE REFERRAL CODE (The Fix 🛠️)
    // This looks at the URL for ?ref=... and saves it immediately
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');

      if (refCode) {
        localStorage.setItem("cashttree_referral", refCode);
        console.log("Referral Captured:", refCode);
      }
    }

    // 2. DASHBOARD REDIRECT LOGIC
    // If they are already a partner, send them straight to dashboard
    const partnerId = localStorage.getItem("p_id");
    
    if (partnerId) {
      setDashboardUrl('/dashboard');
    }

    // 3. SCROLL CTA LOGIC
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    
    const handleScroll = () => {
      const mobileCta = document.getElementById("mobileCta");
      if (!mobileCta) return;

      const lastClosed = localStorage.getItem("ctaClosedTime");
      const now = new Date().getTime();
      if (lastClosed && (now - lastClosed < ONE_DAY_MS)) return;

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

  // --- JSON-LD SCHEMA (SEO) ---
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
      
      {/* HEADER */}
      <header className="nav" role="banner">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <span style={{fontSize:'24px'}}>⚡</span>
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

          <div id="navLinks" className={`nav-links ${isNavOpen ? 'nav-open' : ''}`}>
            <a href="#how-it-works" onClick={closeMenu}>How it Works</a>
            <a href="#faq" onClick={closeMenu}>FAQ</a>
            <Link href={dashboardUrl} id="menuDashboardLink" className="dashboard-link"> 
               📊 Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main onClick={() => isNavOpen && closeMenu()}>
        
        {/* HERO */}
        <section className="hero" id="hero">
          <div className="container hero-inner">
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
                <Link className="create-link-cta" href="/dashboard/campaigns">
                  🚀 Create your own referral link
                </Link>
              </div>
              <p className="hero-trust">
                ✔ One-time access • ✔ No income guarantee • ✔ Telegram support
              </p>
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
              
              {/* Card 1: Airtel */}
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
                  <a className="btn primary" href="https://lootcampaign.in?camp=Atl&ref=VMIZAvSI" target="_blank" rel="noopener">Get ₹100 →</a>
                </div>
              </article>

               {/* Card 2: Upstox */}
               <article className="offer-card">
                <div className="offer-head">
                  <h3>Upstox – Free Demat Account</h3>
                  <span className="tag success">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Install & sign up via referral</li>
                  <li>Complete KYC (no deposit)</li>
                  <li>Reward after approval</li>
                </ul>
                <div className="offer-footer">
                   <div className="earn">Earn <strong>₹200</strong></div>
                  <a className="btn primary" href="https://campguruji.in/camp/hw52jghh" target="_blank" rel="noopener">Get ₹200 →</a>
                </div>
              </article>

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
            </div>
          </div>
        </section>

        {/* MOBILE CTA */}
        <div 
          id="mobileCta" 
          className={`mobile-cta ${showMobileCta ? 'visible' : ''}`} 
          role="dialog"
        >
          <a href="/dashboard" className="cta-main">
            🚀 Go to Dashboard
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