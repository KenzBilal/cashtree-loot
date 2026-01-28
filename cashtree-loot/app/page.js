'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  // State for Mobile Menu
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // State for Mobile CTA Popup (Santa/Telegram)
  const [isMobileCtaVisible, setIsMobileCtaVisible] = useState(false);

  // Effect to show Mobile CTA after 2 seconds (simulating your old script)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileCtaVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="nav" role="banner">
        <div className="nav-inner">
          
          <Link href="/" className="brand">
            <img src="/logo.webp" alt="C" className="brand-logo" />
            <span className="brand-text">Cash<span>Tree</span></span>
          </Link>

          <button 
            id="navToggle" 
            className="nav-toggle" 
            aria-label="Toggle navigation"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            ☰
          </button>

          <div id="navLinks" className={`nav-links ${isNavOpen ? 'nav-open' : ''}`}>
            <a href="#how-it-works" onClick={() => setIsNavOpen(false)}>How it Works</a>
            <a href="#faq" onClick={() => setIsNavOpen(false)}>FAQ</a>
            <a href="/login" id="menuDashboardLink"> 📊 Dashboard</a>
          </div>

        </div>
      </header>
      
      {/* ================= AD SANDBOX ================= */}
      <div className="ad-sandbox">
        {/* Ad script executed via DangerouslySetInnerHTML to preserve behavior */}
        <div dangerouslySetInnerHTML={{ __html: `
          <script>
            (function () {
              var s = document.createElement('script');
              s.dataset.zone = '10337480';
              s.src = 'https://nap5k.com/tag.min.js';
              (document.currentScript ? document.currentScript.parentNode : document.body).appendChild(s);
            })();
          </script>
        `}} />
      </div>
      {/* ================= END AD SANDBOX ================= */}

      {/* ================= HERO ================= */}
      <main>
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
                No false promises. No forced tasks.
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
        {/* ================= END HERO ================= */}

        <section id="offers" className="section">
          <div className="container">

            <h2 className="section-title">
              Top Verified Offers
            </h2>

            <p className="section-sub">
              Carefully selected official campaigns from trusted platforms.
              Each offer redirects you to the provider’s own page — we do not host or modify any apps.
            </p>

            <p className="section-sub" style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>
              ✔ No forced tasks &nbsp;•&nbsp; ✔ No income guarantees &nbsp;•&nbsp; ✔ Follow instructions to qualify
            </p>

            <div className="offer-grid">

              {/* Airtel Thanks */}
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
                  <a className="btn primary full-width"
                     href="https://lootcampaign.in?camp=Atl&ref=VMIZAvSI"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹100 →
                  </a>
                </div>
              </article>

              {/* Upstox */}
              <article className="offer-card verified">
                <div className="offer-head">
                  <h3>Upstox – Free Demat Account</h3>
                  <span className="tag success">CashTree Verified</span>
                </div>
                <div className="payout">
                  Earn <strong>₹200</strong>
                </div>
                <ul className="offer-points">
                  <li>Install & sign up via referral</li>
                  <li>Complete KYC (no deposit)</li>
                  <li>Reward after approval</li>
                </ul>
                <div className="offer-meta">
                  ⚡ Payout: 24–48 hrs &nbsp;|&nbsp; 👤 New users only
                </div>
                <div className="offer-footer">
                  <a className="btn primary full-width"
                     href="https://campguruji.in/camp/hw52jghh"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹200 →
                  </a>
                </div>
              </article>

              {/* Angel One */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Angel One – Free Demat Account</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Sign up via referral link</li>
                  <li>Complete digital KYC (no deposit)</li>
                  <li>Account approved by Angel One</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹150</strong></div>
                  <a className="btn primary full-width"
                     href="https://lootcampaign.in?camp=Aone&ref=SueeEI63"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹150 →
                  </a>
                </div>
              </article>

              {/* Motwal */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Motwal – Install & Earn Offer</h3>
                  <span className="tag">CashtTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Install the Motwal app using the link</li>
                  <li>Complete the required in-app steps</li>
                  <li>No investment required</li>
                  <li>Earn <strong>₹70</strong> after verification</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹70</strong></div>
                  <a className="btn primary full-width"
                     href="/motwal"
                     rel="noopener noreferrer">
                     Earn ₹70 →
                  </a>
                </div>
              </article>

              {/* Qoneqt */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Qoneqt – Signup & Refer Offer</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Sign up on Qoneqt via referral link</li>
                  <li>Apply referral code during signup</li>
                  <li><strong>Referral Code:</strong> 8424042254214049</li>
                  <li>Get <strong>₹85</strong> signup bonus</li>
                  <li>Earn <strong>₹50</strong> for every referral</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹85+</strong></div>
                  <a className="btn primary full-width"
                     href="/qoneqt/"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹85 →
                  </a>
                </div>
              </article>

              {/* Tide */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Tide – Business Account Offer</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Open Tide account via referral link</li>
                  <li>Complete the required task to qualify</li>
                  <li>Reward after successful verification</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹300</strong></div>
                  <a className="btn primary full-width"
                     href="https://rfox.in/l/rmopqjkx"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹300 →
                  </a>
                </div>
              </article>
      
              {/* ZebPay */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>ZebPay – Instant UPI Cashback</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Enter UPI ID & mobile number, then submit</li>
                  <li>Install app & complete registration</li>
                  <li>Complete KYC (Aadhaar + PAN)</li>
                  <li>Get instant cashback in UPI</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹40</strong> (Instant)</div>
                  <a className="btn primary full-width"
                     href="https://campaigns.fast2cash.in/camp/tp32keOzRAxFzM1"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹40 →
                  </a>
                </div>
              </article>

              {/* Nielsen */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Nielsen – 3 day Cashback</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Enter UPI ID & mobile number, then submit</li>
                  <li>Complete Survey</li>
                  <li>Install app</li>
                  <li>Login for 3 days</li>
                  <li>Get cashback in UPI</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹70</strong> (within 3 days)</div>
                  <a className="btn primary full-width"
                     href="https://lootcampaign.in?camp=nsn3d&ref=OGkUSDyw"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹70 →
                  </a>
                </div>
              </article>

              {/* Royal */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Royal – 2 day Cashback</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Enter UPI ID & mobile number, then submit</li>
                  <li>Fill simple basic information</li>
                  <li>That&apos;s It</li>
                  <li>You will get a call after 2 days</li>
                  <li>Tell them you are interested in laminates</li>
                  <li>No need to buy,invest,install app nothing</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹70</strong> (within 3 days)</div>
                  <a className="btn primary full-width"
                     href="https://campguruji.in/camp/xu6fxt8y"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹70 →
                  </a>
                </div>
              </article>

              {/* IndusInd Indie Account */}
              <article className="offer-card premium-offer indusind">
                <div className="premium-badge">EXCLUSIVE</div>
                <div className="offer-head">
                  <h3>IndusInd Bank Account</h3>
                  <span className="tag gold">Premium </span>
                </div>
                <ul className="offer-points">
                  <li>Enter UPI ID & mobile number to start</li>
                  <li>Open Indie Zero Balance account</li>
                  <li>Deposit ₹5000 via UPI (withdrawable anytime)</li>
                  <li>Complete mandatory video KYC</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn premium-earn">
                    Earn <strong>₹500</strong>
                  </div>
                  <a className="btn primary premium-btn"
                     href="YOUR_INDUSIND_REFERRAL_LINK"
                     target="_blank"
                     rel="noopener noreferrer">
                    Open IndusInd Account
                  </a>
                </div>
              </article>

              {/* Media Rewards */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Media Rewards – Easy Signup Task</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Sign up & verify with Gmail</li>
                  <li>No Aadhaar • No PAN required</li>
                  <li>Login daily for 7 days</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹50</strong></div>
                  <a className="btn primary full-width"
                     href="https://campaign.cashwala.in/campaigns/Sh4sct2s7?as=2n0tg1g1i"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹50 →
                  </a>
                </div>
              </article>

              {/* 5Paisa Offer */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>5Paisa Demat Account</h3>
                  <span className="tag">High Cashback</span>
                </div>
                <ul className="offer-points">
                  <li>Install & open 5Paisa app</li>
                  <li>Complete signup</li>
                  <li>KYC using Aadhaar + PAN</li>
                  <li>₹80 cashback after approval</li>
                  <li>Optional bonuses available</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">
                    Earn Up To <strong>₹380</strong>
                  </div>
                  <a className="btn primary full-width"
                     href="https://clickmudra.co/camp/MBVZJME"
                     target="_blank"
                     rel="noopener noreferrer">
                    Apply Now
                  </a>
                </div>
              </article>

              {/* TimesPrime Xmas */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>TimesPrime – Xmas Flash Sale</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Buy TimesPrime subscription using coupon</li>
                  <li>Pay ₹749 after instant discount</li>
                  <li>Get Amazon voucher + cashback benefits</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Benefit <strong>₹750+</strong></div>
                  <a className="btn primary full-width"
                     href="https://campguruji.com/camp/qbjybwmw"
                     target="_blank"
                     rel="noopener noreferrer">
                     Unlock Deal →
                  </a>
                </div>
              </article>

              {/* CoinSwitch */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>CoinSwitch – New User Crypto Offer</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Sign up & verify via OTP</li>
                  <li>Complete KYC (PAN + Aadhaar)</li>
                  <li>Add ₹110+ & make one trade</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹150</strong></div>
                  <a className="btn primary full-width"
                     href="https://campaigns.fast2cash.in/camp/o3t1X8zCeW9S3W3"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹150 →
                  </a>
                </div>
              </article>

              {/* Bajaj EMI */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Bajaj EMI – Finance App Offer</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Open Bajaj EMI via referral link</li>
                  <li>Follow the simple on-screen steps</li>
                  <li>Reward after successful completion</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹125</strong></div>
                  <a className="btn primary full-width"
                     href="https://rechargefox.com/camp/rzryyek5"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹125 →
                  </a>
                </div>
              </article>

              {/* Bajaj Demat */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Bajaj Demat – Easy Signup Offer</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Open Bajaj Demat via referral link</li>
                  <li>Complete the required signup steps</li>
                  <li>Reward after successful verification</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹60</strong></div>
                  <a className="btn primary full-width"
                     href="https://campguruji.com/camp/kgwnocyl"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹60 →
                  </a>
                </div>
              </article>

              {/* Kotak 811 */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Kotak 811 – Digital Savings Account</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Open Kotak 811 account via referral link</li>
                  <li>Complete full KYC as required by Kotak</li>
                  <li>Reward after successful account approval</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹200</strong></div>
                  <a className="btn primary full-width"
                     href="https://cgrj.in/c/rnf6yrzd"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹200 →
                  </a>
                </div>
              </article>

              {/* Bajaj EMI Card */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Bajaj EMI Card – Finance Offer</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Apply for Bajaj EMI Card via referral link</li>
                  <li>Complete the required application steps</li>
                  <li>Reward after successful approval</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹500</strong></div>
                  <a className="btn primary full-width"
                     href="https://campguruji.in/camp/im6robpt"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹500 →
                  </a>
                </div>
              </article>

              {/* Rio Money */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Rio Money – High Reward Offer</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Open Rio Money via referral link</li>
                  <li>Complete the required provider steps</li>
                  <li>Reward after successful verification</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹800</strong></div>
                  <a className="btn primary full-width"
                     href="https://campguruji.in/camp/j8kam6c9"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹800 →
                  </a>
                </div>
              </article>

              {/* AU CC Limit */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>AU Credit Card – Limit Check Offer</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Check AU Credit Card limit via referral link</li>
                  <li>Complete the required eligibility steps</li>
                  <li>Reward after successful verification</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹180</strong></div>
                  <a className="btn primary full-width"
                     href="https://campguruji.in/camp/uctpuhvp"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹180 →
                  </a>
                </div>
              </article>

              {/* Credilio Flash */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>Credilio Flash – High Reward Offer</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Open Credilio Flash via referral link</li>
                  <li>Complete the required provider steps</li>
                  <li>Reward after successful verification</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹900</strong></div>
                  <a className="btn primary full-width"
                     href="https://campguruji.in/camp/u1phzg18"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹900 →
                  </a>
                </div>
              </article>

              {/* Phonepay */}
              <article className="offer-card">
                <div className="offer-head">
                  <h3>PhonePe Signup Offer</h3>
                  <span className="tag">CashTree Verified</span>
                </div>
                <ul className="offer-points">
                  <li>Install PhonePe via referral link</li>
                  <li>Complete signup & verification</li>
                  <li>Bonus credited after success</li>
                </ul>
                <div className="offer-footer">
                  <div className="earn">Earn <strong>₹150</strong></div>
                  <a className="btn primary full-width"
                     href="/phonepay/"
                     target="_blank"
                     rel="noopener noreferrer">
                     Get ₹150 →
                  </a>
                </div>
              </article>

            </div>
          </div>
        </section>
        
        {/* HOW IT WORKS */}
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

        {/* TOOLS PROMO */}
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
              <article className="offer-card">
                <h3>Traffic & Referral Monetization Tools</h3>
                <p className="lead">
                  Explore ad networks and monetization tools used by publishers
                  to convert traffic into measurable revenue.
                  Suitable for websites, blogs, and social platforms.
                </p>
                <ul className="offer-points">
                  <li>Ad networks & traffic monetization platforms</li>
                  <li>Referral & publisher tools</li>
                  <li>Beginner-friendly setup guides</li>
                </ul>
                <a href="/tools" className="btn primary full-width">
                  Explore Tools & Guides
                </a>
              </article>
            </div>

          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section">
          <div className="container">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq">

              {/* Q1 */}
              <div className="faq-item">
                <button className="faq-question">
                  Are these offers legitimate?
                </button>
                <div className="faq-answer">
                  <p>
                    Yes. Every offer listed redirects you to an
                    <strong> official campaign page</strong> of the respective provider.
                    We do not host apps, files, or modified links.
                  </p>
                </div>
              </div>

              {/* Q2 */}
              <div className="faq-item">
                <button className="faq-question">
                  Do I need to pay to use these offers?
                </button>
                <div className="faq-answer">
                  <p>
                    Most offers are completely free. Some campaigns may require
                    a small action such as account verification, installation,
                    or a minimum activity as specified by the provider.
                  </p>
                </div>
              </div>

              {/* Q3 */}
              <div className="faq-item">
                <button className="faq-question">
                  Is any income or reward guaranteed?
                </button>
                <div className="faq-answer">
                  <p>
                    No income or earnings are guaranteed.
                    Rewards depend on successful task completion,
                    provider verification, and campaign rules.
                  </p>
                </div>
              </div>

              {/* Q4 */}
              <div className="faq-item">
                <button className="faq-question">
                  How long does it take to receive rewards?
                </button>
                <div className="faq-answer">
                  <p>
                    Reward timelines vary by platform.
                    Some campaigns credit rewards instantly,
                    while others may take a few hours or days
                    after verification.
                  </p>
                </div>
              </div>

              {/* Q5 */}
              <div className="faq-item">
                <button className="faq-question">
                  What are the monetization tools mentioned on this site?
                </button>
                <div className="faq-answer">
                  <p>
                    Monetization tools are optional third-party platforms
                    commonly used by publishers to monetize website traffic,
                    referrals, and social visitors.
                  </p>
                  <p>
                    These tools are independent of CashTree Loot and are shared
                    for educational purposes only.
                  </p>
                </div>
              </div>

              {/* Q6 */}
              <div className="faq-item">
                <button className="faq-question">
                  Can I monetize my own website or traffic?
                </button>
                <div className="faq-answer">
                  <p>
                    Yes, many people monetize their traffic using ad networks
                    and referral tools.
                    One commonly used platform is Monetag.
                  </p>
                  <p>
                    If you’re exploring traffic monetization tools,
                    you can learn more through their official publisher program:
                    <br /><br />
                    <a href="https://monetag.com/?ref_id=zc3e" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="btn secondary">
                      👉 Explore Monetag Publisher Tools
                    </a>
                  </p>
                </div>
              </div>

              {/* Q7 */}
              <div className="faq-item">
                <button className="faq-question">
                  Does CashTree Loot collect personal data?
                </button>
                <div className="faq-answer">
                  <p>
                    We do not collect sensitive personal information such as
                    Aadhaar, PAN, or bank details.
                    Payments, if any, are processed securely by third-party providers.
                  </p>
                </div>
              </div>

              {/* Q8 */}
              <div className="faq-item">
                <button className="faq-question">
                  Who should use this website?
                </button>
                <div className="faq-answer">
                  <p>
                    This site is intended for users looking to explore
                    verified referral offers, understand earning mechanisms,
                    and learn about traffic monetization tools.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CREATE LINK / ACCESS SECTION */}
        <section id="create-link" className="section">
          <div className="container">

            <h2 className="section-title">Create Your Own Referral Link</h2>
            <p className="section-sub">
              One-time access to referral guidance, verified resources, and private Telegram support.
            </p>

            {/* STEP EXPLANATION */}
            <div className="info-stack">
              <p>
                This access is designed for users who want to understand
                <strong> how referral systems work</strong>, explore verified offers,
                and learn how people monetize traffic responsibly.
              </p>

              <p>
                After payment, you’ll use our Telegram bot to verify your payment
                and receive access to the private Telegram group.
              </p>
            </div>

            {/* CTA STACK */}
            <div className="center-stack">
              {/* PAYMENT */}
              <a href="https://razorpay.me/@cashttree?amount=rZC5NMufSVtgb9QV3szYxw%3D%3D"
                 className="pay-btn"
                 id="payBtn"
                 target="_blank"
                 rel="noopener noreferrer">

                <span className="price">
                  <span className="price-old"><s>₹99</s></span>
                  <span className="price-new">₹49</span>
                  <span className="label">Unlock Access</span>
                </span>

                <img src="/assets/santa-hat.png" alt="" className="santa-hat" />
              </a>

              <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
                • One-time access • Limited time
              </p>
            </div>

            <div className="center-stack">
              {/* TELEGRAM BOT */}
              <a className="telegram-btn"
                 href="https://t.me/CashtTree_bot"
                 target="_blank"
                 rel="noopener noreferrer">
                  Open Telegram Bot
              </a>
            </div>

            {/* HOW IT WORKS (CLEAR FLOW) */}
            <div className="steps-box">
              <h3>How access works</h3>
              <ol>
                <li>Pay a one-time access fee of <strong>₹49</strong></li>
                <li>Open the Telegram bot using the button above</li>
                <li>Submit your Razorpay Payment ID inside the bot</li>
                <li>Receive private Telegram group access after verification</li>
              </ol>
            </div>

            {/* TRANSPARENCY NOTE */}
            <p className="small-note">
              This payment provides access to information and community only.
              No job, salary, or guaranteed earnings are offered.
            </p>

          </div>
        </section>

        {/* LEGAL / COMPLIANCE BOX */}
        <div className="legal-box">
          <h4>Terms, Privacy & Refund Policy</h4>

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
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="container footer-inner">
          <div>© CashTree Loot</div>
          <div className="footer-links">
            <a href="#offers">Offers</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQ</a>
            <a href="/tools">Tools</a>
          </div>
        </div>
      </footer>

      {/* ================= MOBILE FLOATING CTA ================= */}
      <div
        id="mobileCta"
        className={`mobile-cta ${isMobileCtaVisible ? 'visible' : ''}`}
        role="dialog"
        aria-label="Join CashTree Telegram"
        aria-live="polite"
      >
        <a
          href="https://t.me/CashtTree_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-main"
          aria-label="Open CashTree Telegram Bot"
        >
          🚀 Join Telegram & Unlock Access
        </a>

        <button
          className="cta-close"
          aria-label="Close"
          type="button"
          onClick={() => setIsMobileCtaVisible(false)}
        >
          ✕
        </button>
      </div>
      {/* ================= END MOBILE CTA ================= */}
    </>
  );
}