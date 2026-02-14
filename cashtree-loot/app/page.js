'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script'; // ⚡ FAST AD LOADING
import { 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Menu, 
  X,
  Smartphone
} from 'lucide-react';
import LegalDocs from './LegalDocs'; // Keeps your legal popup working

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [dashboardLink, setDashboardLink] = useState("/login");

  // --- LOGIC: Runs once when page loads ---
  useEffect(() => {
    // Smart Redirect: If logged in, go to Dashboard. If new, go to Login.
    const partnerId = localStorage.getItem("p_id");
    const oldCode = localStorage.getItem("cashttree_referral");
    if (partnerId) {
      setDashboardLink("/dashboard");
    } else if (oldCode) {
      setDashboardLink(`/dashboard?code=${oldCode}`);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-emerald-500/30 font-sans">
      
      {/* ⚡ OPTIMIZED AD SCRIPT (Loads lazily to keep site fast) */}
      <Script 
        src="https://nap5k.com/tag.min.js" 
        strategy="lazyOnload" 
        data-zone="10337480"
      />

      {/* ================= HEADER ================= */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="font-bold text-black text-lg">C</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Cash<span className="text-emerald-500">Tree</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link href="/campaigns" className="text-white hover:text-emerald-400 transition-colors">Live Offers</Link>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Protocol</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">
            <Link 
              href={dashboardLink}
              className="hidden md:flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-emerald-500 hover:text-black border border-white/10 rounded-full text-emerald-400 text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Dashboard <ArrowRight size={14} />
            </Link>

            <button 
              className="md:hidden text-gray-300 p-2"
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              {isNavOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isNavOpen && (
          <div className="md:hidden bg-zinc-950 border-b border-white/10 p-4 flex flex-col gap-4 animate-fluent">
            <Link href="/campaigns" className="text-white font-medium" onClick={() => setIsNavOpen(false)}>Live Offers</Link>
            <a href="#how-it-works" className="text-gray-300" onClick={() => setIsNavOpen(false)}>Protocol</a>
            <Link href={dashboardLink} className="text-emerald-400 font-semibold" onClick={() => setIsNavOpen(false)}>
              Go to Dashboard
            </Link>
          </div>
        )}
      </header>

      <main className="flex-grow pt-24 pb-20 overflow-x-hidden">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative px-6 py-16 md:py-32 max-w-7xl mx-auto text-center">
          
          {/* Performance Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

          <div className="animate-fluent inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-xs font-medium text-emerald-400 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            Network Status: Online
          </div>

          <h1 className="animate-fluent delay-100 text-5xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            The Performance <br />
            <span className="text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">Reward Layer.</span>
          </h1>

          <p className="animate-fluent delay-200 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The infrastructure for Indian creators to monetize traffic. <br className="hidden md:block"/>
            Direct bank connections. Zero friction. Instant settlement.
          </p>

          <div className="animate-fluent delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/campaigns"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              View Live Campaigns <ArrowRight size={18} />
            </Link>
            
            <Link 
              href={dashboardLink}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all hover:border-white/20"
            >
              Partner Login
            </Link>
          </div>

          {/* TRUST STATS */}
          <div className="animate-fluent delay-300 mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10">
            <StatItem label="Active Nodes" value="5,400+" />
            <StatItem label="Latency" value="12ms" />
            <StatItem label="Campaigns" value="Verified" />
            <StatItem label="Payout" value="T+0" />
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="py-24 bg-white/[0.02] relative border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-white">The Protocol</h2>
              <p className="text-gray-400">Three-step high-frequency earning mechanism.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Zap className="text-yellow-400" size={32} />}
                title="1. Discover"
                desc="Access high-yield financial offers from verified institutions like Kotak & Angel One."
                delay="delay-100"
              />
              <FeatureCard 
                icon={<Smartphone className="text-blue-400" size={32} />}
                title="2. Execute"
                desc="Complete the digital task (Install/KYC). Our postback engine tracks it in real-time."
                delay="delay-200"
              />
              <FeatureCard 
                icon={<ShieldCheck className="text-emerald-400" size={32} />}
                title="3. Settlement"
                desc="Funds are credited instantly. Withdraw to any UPI ID immediately."
                delay="delay-300"
              />
            </div>
          </div>
        </section>

        {/* ================= ACCESS / PAYMENT SECTION ================= */}
        <section className="py-24 px-6 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-8 md:p-16 relative overflow-hidden group">
            
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />

            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-6 tracking-tight text-white">Unlock Full Access</h2>
              <p className="text-gray-400 mb-10 max-w-2xl mx-auto text-lg">
                Join the <strong>Private Telegram Community</strong>. Get insider guides, priority support, and verified earning methods.
              </p>

              <div className="flex flex-col items-center gap-8">
                
                {/* Price Box */}
                <div className="flex items-center gap-4 bg-black/50 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md">
                   <div className="text-left">
                      <div className="text-gray-500 text-sm line-through">Standard Fee ₹99</div>
                      <div className="text-4xl font-bold text-white">₹49</div>
                   </div>
                   <div className="h-10 w-[1px] bg-white/10" />
                   <div className="text-left text-sm text-emerald-400 font-medium">
                      One-time<br/>Lifetime Access
                   </div>
                </div>

                {/* Payment Button */}
                <a 
                  href="https://razorpay.me/@cashttree?amount=rZC5NMufSVtgb9QV3szYxw%3D%3D" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto px-12 py-5 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                >
                  ⚡ Unlock Access Now
                </a>

                {/* Verification Link */}
                <a href="https://t.me/CashtTree_bot" target="_blank" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <CheckCircle2 size={14} /> Verify Payment via Telegram Bot
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ================= FAQ SECTION ================= */}
        <section id="faq" className="py-20 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center text-white">System FAQ</h2>
          <div className="space-y-4">
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
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-white/10 pt-16 pb-8 px-6 text-center text-gray-600 text-sm bg-black">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mb-12 text-left">
            <div>
              <h4 className="text-white font-semibold mb-4">CashTree</h4>
              <p>The performance reward layer for the modern internet.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><button className="hover:text-emerald-400 transition-colors">Terms of Service</button></li>
                <li><button className="hover:text-emerald-400 transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-emerald-400 transition-colors">Refund Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p>Support: help@cashttree.online</p>
              <p>Telegram: @CashTreeSupport</p>
            </div>
          </div>
          <p>© 2024 CashTree. All rights reserved.</p>
        </footer>

      </main>

      {/* Keeps your Legal Popup Component alive */}
      <LegalDocs />
      
    </div>
  );
}

// --- SUB-COMPONENTS (Pure Functional for Speed) ---

function StatItem({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
      <span className="text-xs font-medium text-gray-600 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div className={`p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1 animate-fluent ${delay}`}>
      <div className="mb-4 p-3 bg-black rounded-xl border border-white/10 w-fit group-hover:scale-110 transition-transform shadow-lg">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function FaqItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
      <button 
        className="w-full flex items-center justify-between p-4 text-left font-medium text-white hover:bg-white/5 transition-colors"
        onClick={onClick}
      >
        {question}
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-emerald-500`}>▼</span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-4 pt-0 text-gray-400 text-sm leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}