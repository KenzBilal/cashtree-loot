'use client';

import { useState } from 'react';
import { X, Shield, FileText, RefreshCcw } from 'lucide-react';

export default function LegalDocs() {
  const [activePolicy, setActivePolicy] = useState(null);

  // --- CONTENT DATA ---
  const policies = {
    privacy: {
      title: "Privacy Policy",
      icon: <Shield size={28} className="text-neon" />,
      content: (
        <div className="policy-content">
          <p className="policy-date">Last Updated: February 2026</p>
          <p>At CashTree, we prioritize user privacy. We collect minimal data (Phone/UPI) solely to process payouts.</p>
          <h4>1. Data Collection</h4>
          <p>We do not sell your data. We only track task completion via secure server-to-server postbacks.</p>
          <h4>2. Security</h4>
          <p>All data is encrypted via SSL and stored in secure Supabase clusters with Row Level Security (RLS).</p>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      icon: <FileText size={28} className="text-neon" />,
      content: (
        <div className="policy-content">
          <h4>1. User Agreement</h4>
          <p>By using CashTree, you agree to act as an independent publisher. You are not an employee.</p>
          <h4>2. Prohibited Activity</h4>
          <p>VPNs, Emulators, and Bot traffic are strictly banned. Accounts flagged for fraud will be frozen immediately.</p>
        </div>
      )
    },
    refund: {
      title: "Refund Policy",
      icon: <RefreshCcw size={28} className="text-neon" />,
      content: (
        <div className="policy-content">
          <h4>1. Access Fee</h4>
          <p>The ₹49 fee grants lifetime access to our community. It is a digital service, deemed "consumed" upon login.</p>
          <h4>2. Eligibility</h4>
          <p>Refunds are only issued if a technical error prevents access within 24 hours of payment.</p>
        </div>
      )
    }
  };

  // --- RENDER: THE SLEEK FOOTER MENU ---
  if (!activePolicy) return (
    <div className="legal-menu">
      <button onClick={() => setActivePolicy('privacy')}>Privacy Policy</button>
      <span className="divider">•</span>
      <button onClick={() => setActivePolicy('terms')}>Terms of Service</button>
      <span className="divider">•</span>
      <button onClick={() => setActivePolicy('refund')}>Refund Policy</button>

      <style jsx>{`
        .legal-menu {
          display: flex; gap: 15px; justify-content: center; align-items: center;
          margin-bottom: 20px; font-size: 0.85rem;
        }
        .legal-menu button {
          background: none; border: none; color: #666; cursor: pointer;
          font-weight: 500; transition: color 0.3s; padding: 0;
        }
        .legal-menu button:hover { color: #00ff88; text-decoration: underline; text-underline-offset: 4px; }
        .divider { color: #333; }
      `}</style>
    </div>
  );

  // --- RENDER: THE POPUP MODAL ---
  return (
    <div className="modal-overlay">
      <div className="modal-card animate-fluent">
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            {policies[activePolicy].icon}
            <h2>{policies[activePolicy].title}</h2>
          </div>
          <button onClick={() => setActivePolicy(null)} className="close-btn">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body custom-scrollbar">
          {policies[activePolicy].content}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={() => setActivePolicy(null)} className="done-btn">
            Close Document
          </button>
        </div>

      </div>

      {/* --- CSS FOR MODAL --- */}
      <style jsx>{`
        .modal-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .modal-card {
          background: #0a0a0f; border: 1px solid rgba(255,255,255,0.1);
          width: 100%; max-width: 550px; border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.7); overflow: hidden;
          display: flex; flex-direction: column; max-height: 80vh;
        }
        .modal-header {
          padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(255,255,255,0.02);
        }
        .modal-title-box { display: flex; align-items: center; gap: 12px; }
        .modal-title-box h2 { font-size: 1.2rem; font-weight: 700; color: white; margin: 0; }
        .text-neon { color: #00ff88; }
        
        .close-btn {
          background: none; border: none; color: #666; cursor: pointer; transition: 0.2s;
          padding: 8px; border-radius: 50%;
        }
        .close-btn:hover { background: rgba(255,255,255,0.1); color: white; }

        .modal-body { padding: 30px; overflow-y: auto; color: #ccc; line-height: 1.7; font-size: 0.95rem; }
        .policy-content h4 { color: white; margin-top: 20px; margin-bottom: 8px; font-weight: 700; }
        .policy-date { font-size: 0.8rem; color: #666; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }

        .modal-footer {
          padding: 20px; border-top: 1px solid rgba(255,255,255,0.05); text-align: right;
        }
        .done-btn {
          background: white; color: black; font-weight: 700; border: none;
          padding: 12px 24px; border-radius: 12px; cursor: pointer; transition: 0.2s;
        }
        .done-btn:hover { background: #ccc; }

        /* Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0f; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}