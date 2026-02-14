'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Users, 
  HelpCircle,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import LegalDocs from './LegalDocs';

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [dashboardLink, setDashboardLink] = useState("/login");

  // --- LOGIC: Runs once when page loads ---
  useEffect(() => {
    // 1. Dashboard Link Logic (Smart Redirect)
    const partnerId = localStorage.getItem("p_id");
    const oldCode = localStorage.getItem("cashttree_referral");
    if (partnerId) {
      setDashboardLink("/dashboard");
    } else if (oldCode) {
      setDashboardLink(`/dashboard?code=${oldCode}`);
    }
  }, []);

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-black text-lg">C</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Cash<span className="text-emerald-400">Tree</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
            <a href="/tools" className="hover:text-emerald-400 transition-colors">Tools</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link 
              href={dashboardLink}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all"
            >
              Dashboard <ArrowRight size={14} />
            </Link>

            {/* Mobile Toggle */}
            <button 
              className="md:hidden text-gray-300 p-2"
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              {isNavOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isNavOpen && (
          <div className="md:hidden bg-zinc-900 border-b border-white/10 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <a href="#how-it-works" className="text-gray-300" onClick={() => setIsNavOpen(false)}>How it Works</a>
            <a href="#faq" className="text-gray-300" onClick={() => setIsNavOpen(false)}>FAQ</a>
            <Link href={dashboardLink} className="text-emerald-400 font-semibold" onClick={() => setIsNavOpen(false)}>
              Go to Dashboard
            </Link>
          </div>
        )}
      </header>

      <main className="pt-24 pb-20">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto text-center">
          
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Network Status: Online
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            The Performance <br />
            <span className="text-emerald-400">Reward Network.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with verified financial and gaming campaigns. 
            Automated tracking. Transparent payouts. Built for Indian creators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={dashboardLink}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Start Earning Now <ArrowRight size={18} />
            </Link>
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
            >
              How it Works
            </a>
          </div>

          {/* Stats Grid */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10">
            <StatItem label="Active Users" value="5,000+" />
            <StatItem label="Payout Speed" value="Instant" />
            <StatItem label="Campaigns" value="Verified" />
            <StatItem label="Support" value="24/7" />
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="py-24 bg-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">The Protocol</h2>
              <p className="text-gray-400">Three steps to monetize your influence.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Zap className="text-yellow-400" size={32} />}
                title="1. Discover"
                desc="Browse verified campaigns from top brands like Kotak, Angel One, and Gaming Apps."
              />
              <FeatureCard 
                icon={<Smartphone className="text-blue-400" size={32} />}
                title="2. Complete"
                desc="Follow the simple instructions (Install, Register, or KYC) to qualify for the reward."
              />
              <FeatureCard 
                icon={<ShieldCheck className="text-emerald-400" size={32} />}
                title="3. Earn"
                desc="Get tracked instantly via our Postback engine. Withdraw to UPI immediately."
              />
            </div>
          </div>
        </section>

        {/* ================= ACCESS / COMMUNITY ================= */}
        <section className="py-24 px-6 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            
            {/* Decorative BG */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />

            <h2 className="text-3xl font-bold mb-6">Unlock Full Access</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Get lifetime access to our <strong>Private Telegram Community</strong>, verified earning guides, and direct support.
            </p>

            <div className="flex flex-col items-center gap-6">
              
              {/* Price Tag */}
              <div className="text-center">
                <span className="text-gray-500 line-through text-lg">₹99</span>
                <div className="text-5xl font-bold text-white mt-1">₹49 <span className="text-sm font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">One-time</span></div>
              </div>

              {/* Action Button */}
              <a 
                href="https://razorpay.me/@cashttree?amount=rZC5NMufSVtgb9QV3szYxw%3D%3D" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-10 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                Pay & Unlock Access
              </a>

              <a href="https://t.me/CashtTree_bot" target="_blank" className="text-sm text-gray-400 hover:text-white underline underline-offset-4">
                Verify Payment via Telegram Bot
              </a>

            </div>

            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Verified Methods</div>
              <div className="flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Community Support</div>
              <div className="flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Instant Updates</div>
            </div>

          </div>
        </section>

        {/* ================= FAQ SECTION ================= */}
        <section id="faq" className="py-20 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center">System FAQ</h2>
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

        {/* ================= LEGAL FOOTER ================= */}
        <footer className="border-t border-white/10 pt-16 pb-8 px-6 text-center text-gray-600 text-sm">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mb-12 text-left">
            <div>
              <h4 className="text-white font-semibold mb-4">CashTree</h4>
              <p>The next-gen reward discovery platform for India.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><button className="hover:text-white">Terms of Service</button></li>
                <li><button className="hover:text-white">Privacy Policy</button></li>
                <li><button className="hover:text-white">Refund Policy</button></li>
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

      {/* Legal Popup Component */}
      <LegalDocs />
      
    </>
  );
}

// --- SUB-COMPONENTS (Keep code clean) ---

function StatItem({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl md:text-3xl font-bold text-white">{value}</span>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-emerald-500/30 transition-all group">
      <div className="mb-4 p-3 bg-white/5 w-fit rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function FaqItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
      <button 
        className="w-full flex items-center justify-between p-4 text-left font-medium text-white hover:bg-white/5 transition-colors"
        onClick={onClick}
      >
        {question}
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5">
          {answer}
        </div>
      )}
    </div>
  );
}