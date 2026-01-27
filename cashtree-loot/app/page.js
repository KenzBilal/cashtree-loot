'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function LandingPage() {
  // --- STATE ---
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showMobileCta, setShowMobileCta] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/login');

  // --- LOGIC ---
  useEffect(() => {
    // 1. CAPTURE REFERRAL CODE (Stored for Sign-Up)
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem("cashttree_referral", refCode.toUpperCase());
    }

    // 2. DASHBOARD REDIRECT LOGIC
    const partnerId = localStorage.getItem("p_id");
    if (partnerId) setDashboardUrl('/dashboard');

    // 3. SMART MOBILE CTA LOGIC
    const handleScroll = () => {
      const lastClosed = localStorage.getItem("ctaClosedTime");
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (lastClosed && (Date.now() - lastClosed < ONE_DAY)) return;

      const scrollPercentage = ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100;
      if (scrollPercentage > 50) setShowMobileCta(true);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index) => setOpenFaqIndex(openFaqIndex === index ? null : index);

  return (
    <>
      {/* SEO & SCHEMA */}
      <Script id="json-ld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "CashTree Loot",
          "url": "https://cashttree.online/",
          "logo": "https://cashttree.online/logo.webp"
        })}
      </Script>

{/* NAVIGATION */}
<header className="nav">
  <div className="nav-inner">
    <Link href="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img 
        src="/logo.webp" 
        alt="CashTree Logo" 
        style={{ height: '30px', width: 'auto', display: 'block' }} 
      />
      <span className="brand-text" style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>
        Cash<span style={{ color: 'var(--accent)' }}>Tree</span>
      </span>
    </Link>

    <button className="nav-toggle" onClick={() => setIsNavOpen(!isNavOpen)}>☰</button>

    <div className={`nav-links ${isNavOpen ? 'nav-open' : ''}`}>
      <a href="#offers" onClick={() => setIsNavOpen(false)}>Offers</a>
      <a href="#how-it-works" onClick={() => setIsNavOpen(false)}>How it Works</a>
      <a href="#faq" onClick={() => setIsNavOpen(false)}>FAQ</a>
      <Link href={dashboardUrl} className="dashboard-link">📊 Dashboard</Link>
    </div>
  </div>
</header>

      <main>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="container">
            <h1 className="fade-in">
              Fast, verified referral offers<br />
              <span className="hero-highlight">that actually work</span>
            </h1>
            <p className="lead fade-in">
              Discover tested earning campaigns, clear instructions, and optional tools used by people monetizing traffic online.
            </p>
            <div className="hero-actions-equal">
              <a href="#offers" className="hero-btn">Explore Offers</a>
              <a href="#how-it-works" className="hero-btn">How it Works</a>
              <a href="#faq" className="hero-btn">FAQ</a>
            </div>
            <div className="cta-center">
              <Link href="/promoter" className="create-link-cta">
                🚀 Create your own referral link
              </Link>
            </div>
            <p className="hero-trust">✔ Verified Offers • ✔ No Investment • ✔ Telegram Support</p>
          </div>
        </section>

      
<section id="offers" className="section">
  <div className="container">
    <h2 className="section-title">Top Verified Offers</h2>
    <p className="section-sub">
      Carefully selected official campaigns. No forced tasks.
    </p>

    <div className="offer-grid">
      
      {/* 1. HIGH REWARD / PREMIUM */}
      <OfferCard 
        title="Credilio Flash" payout="900" tag="High Reward"
        points={["Open via referral link", "Complete provider steps", "Reward after verification"]}
        link="https://campguruji.in/camp/u1phzg18"
      />
      <OfferCard 
        title="Rio Money" payout="800" tag="High Reward"
        points={["Open via referral link", "Complete provider steps", "Verified by CashTree"]}
        link="https://campguruji.in/camp/j8kam6c9"
      />
      <OfferCard 
        title="IndusInd Bank" payout="500" tag="Premium"
        points={["Open Indie Zero Balance account", "Deposit ₹5000 (Withdrawable)", "Complete Video KYC"]}
        link="#" 
      />
      <OfferCard 
        title="Bajaj EMI Card" payout="500" tag="Finance"
        points={["Apply via referral link", "Complete application steps", "Reward after approval"]}
        link="https://campguruji.in/camp/im6robpt"
      />

      {/* 2. BANKING & DEMAT (BIG EARNERS) */}
      <OfferCard 
        title="Tide Business" payout="300" tag="Business"
        points={["Open account via link", "Complete required task", "Verified provider"]}
        link="https://rfox.in/l/rmopqjkx"
      />
      <OfferCard 
        title="Upstox" payout="200" tag="Success"
        points={["Free Demat Account", "Complete KYC (No Deposit)", "Top-tier platform"]}
        link="https://campguruji.in/camp/hw52jghh"
      />
      <OfferCard 
        title="Kotak 811" payout="200" tag="Banking"
        points={["Digital Savings Account", "Complete Full KYC", "No hidden charges"]}
        link="https://cgrj.in/c/rnf6yrzd"
      />
      <OfferCard 
        title="Angel One" payout="150" tag="Demat"
        points={["Sign up via referral link", "Digital KYC (No Deposit)", "Account approval reward"]}
        link="https://lootcampaign.in?camp=Aone&ref=SueeEI63"
      />

      {/* 3. INSTANT UPI & SURVEYS */}
      <OfferCard 
        title="ZebPay" payout="40" tag="Instant UPI"
        points={["Enter UPI & Mobile", "Install & KYC", "Instant UPI Cashback"]}
        link="https://campaigns.fast2cash.in/camp/tp32keOzRAxFzM1"
      />
      <OfferCard 
        title="Nielsen" payout="70" tag="3rd Day Pay"
        points={["Install & Survey", "Login for 3 days", "Cashback in UPI"]}
        link="https://lootcampaign.in?camp=nsn3d&ref=OGkUSDyw"
      />
      <OfferCard 
        title="Royal" payout="70" tag="No App"
        points={["Fill basic info", "Receive call in 2 days", "No app install required"]}
        link="https://campguruji.in/camp/xu6fxt8y"
      />

      {/* 4. APP TASKS & REFERRALS */}
      <OfferCard 
        title="Airtel Thanks" payout="100" tag="App Task"
        points={["Login with Airtel number", "Complete in-app tasks", "CashTree Verified"]}
        link="https://lootcampaign.in?camp=Atl&ref=VMIZAvSI"
      />
      <OfferCard 
        title="Qoneqt" payout="85+" tag="Signup"
        points={["Code: 8424042254214049", "₹85 Signup Bonus", "₹50 per Referral"]}
        link="/qoneqt"
      />
      <OfferCard 
        title="PhonePe" payout="150" tag="Referral"
        points={["Install via link", "Complete signup", "Bonus on success"]}
        link="/phonepay"
      />
      <OfferCard 
        title="Motwal" payout="70" tag="Install"
        points={["Install via link", "No investment", "Reward after verification"]}
        link="/motwal"
      />

      {/* 5. FINANCE & CRYPTO */}
      <OfferCard 
        title="AU Credit Card" payout="180" tag="Limit Check"
        points={["Check limit via link", "Complete eligibility", "Reward after verification"]}
        link="https://campguruji.in/camp/uctpuhvp"
      />
      <OfferCard 
        title="CoinSwitch" payout="150" tag="Crypto"
        points={["Verify OTP & KYC", "Add ₹110+ & trade", "New user offer"]}
        link="https://campaigns.fast2cash.in/camp/o3t1X8zCeW9S3W3"
      />
      <OfferCard 
        title="Bajaj EMI" payout="125" tag="Finance"
        points={["Open via link", "Follow screen steps", "Verified reward"]}
        link="https://rechargefox.com/camp/rzryyek5"
      />
      <OfferCard 
        title="5Paisa" payout="380" tag="Demat"
        points={["Aadhaar + PAN KYC", "₹80 after approval", "Up to ₹380 bonus"]}
        link="https://clickmudra.co/camp/MBVZJME"
      />
      
      {/* 6. MISC OFFERS */}
      <OfferCard 
        title="Media Rewards" payout="50" tag="Daily Task"
        points={["Verify with Gmail", "No PAN/Aadhaar", "Login daily for 7 days"]}
        link="https://campaign.cashwala.in/campaigns/Sh4sct2s7?as=2n0tg1g1i"
      />
      <OfferCard 
        title="Bajaj Demat" payout="60" tag="Fast Signup"
        points={["Open via link", "Complete signup", "Reward after verification"]}
        link="https://campguruji.com/camp/kgwnocyl"
      />
      <OfferCard 
        title="TimesPrime" payout="750+" tag="Xmas Flash"
        points={["Buy using coupon", "Pay ₹749", "Amazon Voucher + Benefits"]}
        link="https://campguruji.com/camp/qbjybwmw"
      />

    </div>
  </div>
</section>
        
<section id="how-it-works" className="section">
  <div className="container">

    <h2 className="section-title">
      How it works
    </h2>

    <p className="section-sub">
      A simple, transparent process used across all listed campaigns.
      Follow the steps carefully to qualify.
    </p>

    <p className="section-sub" style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>
      Time to reward varies by provider • No fixed income • Third-party platforms only
    </p>

    <div className="steps">

      <div className="step">
        <h3>1. Open the Offer</h3>
        <p>
          Click an offer card to visit the official campaign page.
          Review the requirements shown by the provider before proceeding.
        </p>
      </div>

      <div className="step">
        <h3>2. Complete the Task</h3>
        <p>
          Install, register, verify, or complete the required action
          exactly as instructed on the campaign page.
        </p>
      </div>

      <div className="step">
        <h3>3. Receive the Reward</h3>
        <p>
          After successful verification, rewards are credited by the provider.
          Processing time depends on the platform.
        </p>
      </div>

    </div>
    </div>
</section>


  
<section className="section">
  <div className="container">

    <h2 className="section-title">
      Tools Used by People Monetizing Traffic Online
    </h2>

    <p className="section-sub">
      Optional platforms commonly used to monetize website visits, referrals,
      and social traffic. These tools are independent and not required to use
      the offers listed above.
    </p>

    <p className="section-sub" style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>
      Educational resources • Third-party platforms • Results depend on usage and traffic quality
    </p>

    <div className="offer-grid">
      {/* Centering wrapper added below */}
      <div style={{ maxWidth: '600px', margin: '0 auto', gridColumn: '1 / -1' }}>
        <article className="offer-card">
          <h3>Traffic & Referral Monetization Tools</h3>

          <p className="lead" style={{ fontSize: '1rem', marginBottom: '20px' }}>
            Explore ad networks and monetization tools used by publishers
            to convert traffic into measurable revenue.
            Suitable for websites, blogs, and social platforms.
          </p>

          <ul className="offer-points">
            <li>Ad networks & traffic monetization platforms</li>
            <li>Referral & publisher tools</li>
            <li>Beginner-friendly setup guides</li>
          </ul>

          <Link href="/tools" className="btn primary" style={{ textAlign: 'center', width: '100%', display: 'block' }}>
            Explore Tools & Guides
          </Link>
        </article>
      </div>
    </div>

  </div>
</section>

<section id="faq" className="section">
  <div className="container">

    <h2 className="section-title">Frequently Asked Questions</h2>

    <div className="faq">

      <FaqItem 
        question="Are these offers legitimate?" 
        answer="Yes. Every offer listed redirects you to an official campaign page of the respective provider. We do not host apps, files, or modified links." 
        isOpen={openFaqIndex === 0}
        onClick={() => toggleFaq(0)}
      />

      <FaqItem 
        question="Do I need to pay to use these offers?" 
        answer="Most offers are completely free. Some campaigns may require a small action such as account verification, installation, or a minimum activity as specified by the provider." 
        isOpen={openFaqIndex === 1}
        onClick={() => toggleFaq(1)}
      />

      <FaqItem 
        question="Is any income or reward guaranteed?" 
        answer="No income or earnings are guaranteed. Rewards depend on successful task completion, provider verification, and campaign rules." 
        isOpen={openFaqIndex === 2}
        onClick={() => toggleFaq(2)}
      />

      <FaqItem 
        question="How long does it take to receive rewards?" 
        answer="Reward timelines vary by platform. Some campaigns credit rewards instantly, while others may take a few hours or days after verification." 
        isOpen={openFaqIndex === 3}
        onClick={() => toggleFaq(3)}
      />

      <FaqItem 
        question="What are the monetization tools mentioned on this site?" 
        answer="Monetization tools are optional third-party platforms commonly used by publishers to monetize website traffic, referrals, and social visitors. These tools are independent of CashTree Loot and are shared for educational purposes only." 
        isOpen={openFaqIndex === 4}
        onClick={() => toggleFaq(4)}
      />

      <FaqItem 
        question="Can I monetize my own website or traffic?" 
        answer={
          <>
            Yes, many people monetize their traffic using ad networks and referral tools. One commonly used platform is Monetag. If you’re exploring traffic monetization tools, you can learn more through their official publisher program:
            <br /><br />
            <a href="https://monetag.com/?ref_id=zc3e" target="_blank" rel="noopener" className="btn secondary" style={{display: 'inline-block'}}>
              👉 Explore Monetag Publisher Tools
            </a>
          </>
        } 
        isOpen={openFaqIndex === 5}
        onClick={() => toggleFaq(5)}
      />

      <FaqItem 
        question="Does CashTree Loot collect personal data?" 
        answer="We do not collect sensitive personal information such as Aadhaar, PAN, or bank details. Payments, if any, are processed securely by third-party providers." 
        isOpen={openFaqIndex === 6}
        onClick={() => toggleFaq(6)}
      />

      <FaqItem 
        question="Who should use this website?" 
        answer="This site is intended for users looking to explore verified referral offers, understand earning mechanisms, and learn about traffic monetization tools." 
        isOpen={openFaqIndex === 7}
        onClick={() => toggleFaq(7)}
      />

    </div>

  </div>
</section>


{/* =========================================
            TERMINAL ACCESS (CONTENT RESTORED)
            ========================================= */}
        <section id="create-link" className="section">
          <div className="container">
            <h2 className="section-title">Terminal Access</h2>
            <p className="section-sub">
              One-time access to referral guidance, verified resources, and private Telegram support.
            </p>

            <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              
              <div className="access-card-og">
                {/* RESTORED CONTENT FROM OLD SECTION */}
                <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '15px' }}>
                    This access is designed for users who want to understand <strong>how referral systems work</strong>, explore verified offers, and learn how people monetize traffic responsibly.
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                    After payment, you’ll use our Telegram bot to verify your payment and receive access to the private Telegram group.
                  </p>
                </div>

                {/* THE RECTANGLE PAY BUTTON (SOLID GREEN / BLACK TEXT) */}
                <div style={{ marginBottom: '24px' }}>
                  <a 
                    href="https://razorpay.me/@cashttree?amount=rZC5NMufSVtgb9QV3szYxw%3D%3D"
                    target="_blank"
                    rel="noopener"
                    className="pay-btn"
                    style={{ 
                      display: 'flex', 
                      background: 'var(--accent)', 
                      color: '#000', 
                      borderRadius: '8px',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="price">
                      <span className="price-old"><s>₹99</s></span>
                      <span className="price-new">₹49</span>
                      <span className="label">Unlock Access</span>
                    </span>
                  </a>
                  <p style={{ marginTop: '12px', fontSize: '11px', color: '#9ca3af', fontWeight: '800', textTransform: 'uppercase' }}>
                    • One-time access • Limited time
                  </p>
                </div>

                {/* THE RECTANGLE BOT BUTTON (RESTORED OG BLUE) */}
                <div className="center-stack" style={{ marginBottom: '40px' }}>
                  <a 
                    href="https://t.me/CashtTree_bot" 
                    target="_blank" 
                    rel="noopener"
                    className="telegram-btn"
                    style={{ 
                      background: '#229ED9', 
                      color: '#ffffff',      
                      borderRadius: '14px',  
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      textDecoration: 'none',
                      width: '100%',
                      maxWidth: '280px',
                      padding: '14px 40px'
                    }}
                  >
                    Open Telegram Bot
                  </a>
                </div>

                {/* RESTORED STEPS FROM OLD SECTION */}
                <div className="legal-box-og" style={{ marginTop: '40px', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#fff', marginBottom: '15px', textTransform: 'uppercase' }}>
                    How access works:
                  </h3>
                  <ol style={{ paddingLeft: '20px' }}>
                    <li>Pay a one-time access fee of <strong>₹49</strong></li>
                    <li>Open the Telegram bot using the button above</li>
                    <li>Submit your Razorpay Payment ID inside the bot</li>
                    <li>Receive private Telegram group access after verification</li>
                  </ol>
                </div>

                {/* RESTORED TRANSPARENCY NOTE */}
                <p style={{ marginTop: '20px', fontSize: '12px', color: '#555', fontStyle: 'italic' }}>
                  This payment provides access to information and community only. No job, salary, or guaranteed earnings are offered.
                </p>
              </div>
            </div>
          </div>
        </section>
      
        {/* =========================================
            LEGAL DISCLOSURE & POLICIES
            ========================================= */}
        <section className="section" style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div className="legal-box-og" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h4 style={{ color: '#888', textTransform: 'uppercase', marginBottom: '20px', fontSize: '14px', letterSpacing: '1px' }}>
                Terms, Privacy & Refund Policy
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '13px', lineHeight: '1.8' }}>
                <p>
                  ₹49 is a one-time access fee for referral guidance, tools information,
                  and a private Telegram group. This is <strong>not an investment</strong>
                  and does not guarantee any income.
                </p>

                <p>
                  Payments are processed securely via Razorpay.
                  We do not store sensitive personal data such as PAN, Aadhaar, or bank details.
                </p>

                <p>
                  Refunds are issued only if access is not provided after successful payment.
                  Refund requests must be made within 24 hours along with a valid Razorpay
                  Payment ID.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '900', color: '#fff', fontSize: '20px' }}>© CashTree Loot</div>
          <div className="footer-links" style={{ display: 'flex', gap: '20px' }}>
            <a href="#offers" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Offers</a>
            <a href="#faq" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>FAQ</a>
            <Link href="/tools" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tools</Link>
          </div>
        </div>
      </footer>


      {/* MOBILE FLOATING CTA (BLUE SIGNAL VARIETY) */}
<div 
  id="mobileCta" 
  className={`mobile-cta ${showMobileCta ? 'visible' : ''}`}
  style={{ 
    transform: showMobileCta ? 'translateY(0)' : 'translateY(150%)',
    display: 'flex',
    gap: '8px',
    position: 'fixed',
    bottom: '20px',
    left: '16px',
    right: '16px',
    zIndex: 9999
  }}
>
  <Link 
    href="/promoter" 
    className="cta-main"
    style={{ 
      borderRadius: '12px', 
      background: 'var(--blue)', // Electric Blue
      color: '#fff', 
      fontWeight: '800',
      textDecoration: 'none',
      flex: '1',
      padding: '16px',
      textAlign: 'center',
      boxShadow: '0 10px 30px var(--blue-glow)',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}
    onClick={() => setShowMobileCta(false)}
  >
    🚀 BECOME A PROMOTER
  </Link>
  
  <button 
    className="cta-close" 
    type="button" 
    style={{ 
      borderRadius: '12px',
      width: '54px',
      background: '#111',
      color: '#fff',
      border: '1px solid #333',
      cursor: 'pointer'
    }}
    onClick={() => {
      setShowMobileCta(false);
      localStorage.setItem("ctaClosedTime", Date.now().toString());
    }}
  >
    ✕
  </button>
</div>
    </>
  );
}

/* =========================================
   HELPER COMPONENTS
   ========================================= */

function OfferCard({ title, payout, points, link, tag, premium }) {
  return (
    <article className={`offer-card ${premium ? 'premium-offer' : ''}`}>
      {premium && <div className="premium-badge">EXCLUSIVE</div>}
      
      <div className="offer-head">
        <h3 style={{ margin: 0 }}>{title}</h3>
        {!premium && (
          <span className="tag" style={{ background: 'rgba(0, 255, 136, 0.1)', color: 'var(--accent)', borderRadius: '4px' }}>
            {tag || 'FAST SIGNUP'}
          </span>
        )}
      </div>

      <ul className="offer-points">
        {points.map((p, i) => <li key={i}>{p}</li>)}
      </ul>

      {/* FOOTER: Long rectangular button matching your Monetization Tools */}
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', width: '100%' }}>
        <a 
          href={link} 
          target="_blank" 
          rel="noopener" 
          className="btn-og-green"
          style={{ 
            width: '100%', 
            textAlign: 'center',
            padding: '16px',
            borderRadius: '12px',
            background: 'var(--accent)',
            color: '#000',
            fontWeight: '800',
            fontSize: '1rem',
            textDecoration: 'none',
            display: 'block'
          }}
        >
          Get ₹{payout}
        </a>
      </div>
    </article>
  );
}

function FaqItem({ question, answer, isOpen, onClick }) {
  return (
    <div className={`faq-item ${isOpen ? 'active' : ''}`}>
      <button 
        className="faq-question" 
        onClick={onClick}
        style={{ 
          width: '100%', 
          textAlign: 'left', 
          background: 'none', 
          border: 'none', 
          color: '#fff', 
          padding: '20px 0', 
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        {question}
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      
      {/* This block only shows when isOpen is true */}
      <div 
        className="faq-answer" 
        style={{ 
          display: isOpen ? 'block' : 'none', 
          color: 'var(--text-muted)', 
          paddingBottom: '20px',
          lineHeight: '1.6'
        }}
      >
        {typeof answer === 'string' ? <p>{answer}</p> : answer}
      </div>
    </div>
  );
}