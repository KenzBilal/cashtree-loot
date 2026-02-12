'use client';

import { useState } from 'react';
import { X, Shield, FileText, RefreshCcw } from 'lucide-react';

export default function LegalDocs() {
  const [activePolicy, setActivePolicy] = useState(null);

  const policies = {
    privacy: {
      title: "Privacy Policy",
      icon: <Shield size={24} className="text-neon" />,
      content: (
        <div className="space-y-4 text-sm text-gray-300">
          <p><strong>Last Updated: February 2026</strong></p>
          <p>At CashTree, we take your privacy seriously. This policy explains how we handle your data.</p>
          
          <h4 className="text-white font-bold mt-4">1. Data Collection</h4>
          <p>We collect your Name, Phone Number, and UPI ID solely for the purpose of tracking your referral tasks and processing your payouts. We do NOT share this data with third parties for marketing purposes.</p>

          <h4 className="text-white font-bold mt-4">2. Cookies & Tracking</h4>
          <p>We use cookies and tracking parameters (such as 'sub_aff_id') to attribute your tasks to our affiliate partners (like Uprise Media). This is essential for the service to function.</p>

          <h4 className="text-white font-bold mt-4">3. Data Security</h4>
          <p>Your data is stored securely using Supabase with Row Level Security (RLS) encryption. We do not store sensitive bank passwords or OTPs.</p>
        </div>
      )
    },
    terms: {
      title: "Terms & Conditions",
      icon: <FileText size={24} className="text-neon" />,
      content: (
        <div className="space-y-4 text-sm text-gray-300">
          <h4 className="text-white font-bold">1. Independent Contractor</h4>
          <p>By using CashTree, you agree that you are an independent contractor, not an employee. You are responsible for your own taxes on any earnings.</p>

          <h4 className="text-white font-bold mt-4">2. No Earnings Guarantee</h4>
          <p>We provide access to third-party offers. We do not guarantee that you will earn a specific amount of money. Earnings depend entirely on your successful completion of tasks as verified by our partners.</p>

          <h4 className="text-white font-bold mt-4">3. Fraud & Bans</h4>
          <p>Any attempt to use VPNs, emulators, or fake identities to complete tasks will result in an immediate permanent ban and forfeiture of all wallet balances.</p>
        </div>
      )
    },
    refund: {
      title: "Refund & Cancellation Policy",
      icon: <RefreshCcw size={24} className="text-neon" />,
      content: (
        <div className="space-y-4 text-sm text-gray-300">
          <h4 className="text-white font-bold">1. The Access Fee</h4>
          <p>The ₹49 fee is a <strong>one-time access fee</strong> for our platform and community. It is NOT an investment.</p>

          <h4 className="text-white font-bold mt-4">2. Refund Eligibility</h4>
          <p> refunds are ONLY granted if you are unable to access the platform due to a technical error on our side within 24 hours of payment.</p>
          
          <h4 className="text-white font-bold mt-4">3. No Refunds for "Change of Mind"</h4>
          <p>Once you have logged in and accessed the dashboard or Telegram group, the service is considered "delivered" and no refund will be issued.</p>
        </div>
      )
    }
  };

  if (!activePolicy) return (
    <div className="flex gap-4 justify-center text-xs text-gray-500 mt-8">
      <button onClick={() => setActivePolicy('privacy')} className="hover:text-neon transition">Privacy Policy</button>
      <span>•</span>
      <button onClick={() => setActivePolicy('terms')} className="hover:text-neon transition">Terms of Service</button>
      <span>•</span>
      <button onClick={() => setActivePolicy('refund')} className="hover:text-neon transition">Refund Policy</button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0a0a0f] border border-gray-800 w-full max-w-lg rounded-2xl p-6 relative shadow-2xl">
        <button 
          onClick={() => setActivePolicy(null)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          {policies[activePolicy].icon}
          <h2 className="text-xl font-bold text-white">{policies[activePolicy].title}</h2>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {policies[activePolicy].content}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 text-center">
          <button 
            onClick={() => setActivePolicy(null)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition"
          >
            Close Document
          </button>
        </div>
      </div>
      <style jsx global>{`
        .text-neon { color: #00ff88; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; borderRadius: 4px; }
      `}</style>
    </div>
  );
}