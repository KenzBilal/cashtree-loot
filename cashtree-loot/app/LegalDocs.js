'use client';

import { useState } from 'react';
import { X, Shield, FileText, RefreshCcw } from 'lucide-react';

export default function LegalDocs() {
  const [activePolicy, setActivePolicy] = useState(null);
  const [hovered, setHovered] = useState(null); // Tracks hover for neon effect

  // --- 1. PROFESSIONAL LEGAL CONTENT ---
  const policies = {
    privacy: {
      title: "Privacy Policy",
      icon: <Shield size={28} color="#00ff88" />,
      content: (
        <div>
          <p style={{marginBottom:'15px', color:'#666', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'1px'}}>Last Updated: February 2026</p>
          <p>At CashTree, we prioritize user privacy. We collect minimal data (Phone Number/UPI ID) solely for the purpose of processing payouts and tracking campaign completion.</p>
          
          <h4 style={{color:'#fff', margin:'25px 0 10px', fontSize:'1rem'}}>1. Data Collection & Usage</h4>
          <p>We do not sell, trade, or rent your personal identification information to others. We use secure Server-to-Server (S2S) postbacks to validate tasks without exposing sensitive user data.</p>
          
          <h4 style={{color:'#fff', margin:'25px 0 10px', fontSize:'1rem'}}>2. Security Measures</h4>
          <p>All data is encrypted via SSL (Secure Socket Layer) technology. We utilize enterprise-grade database clusters with Row Level Security (RLS) to prevent unauthorized access.</p>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      icon: <FileText size={28} color="#00ff88" />,
      content: (
        <div>
          <p style={{marginBottom:'15px', color:'#666', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'1px'}}>Effective Date: February 2026</p>
          
          <h4 style={{color:'#fff', margin:'25px 0 10px', fontSize:'1rem'}}>1. Acceptance of Terms</h4>
          <p>By accessing CashTree, you agree to act as an independent publisher. You acknowledge that you are not an employee or agent of CashTree Network.</p>
          
          <h4 style={{color:'#fff', margin:'25px 0 10px', fontSize:'1rem'}}>2. Prohibited Activities (Zero Tolerance)</h4>
          <p>The following activities will result in an immediate, permanent ban and forfeiture of earnings:</p>
          <ul style={{listStyle:'disc', paddingLeft:'20px', marginTop:'10px', color:'#aaa'}}>
            <li>Using VPNs, Proxies, or Emulators to fake tasks.</li>
            <li>Self-referral or creating multiple accounts.</li>
            <li>Incentivizing users on non-incentive offers.</li>
          </ul>
        </div>
      )
    },
    refund: {
      title: "Refund Policy",
      icon: <RefreshCcw size={28} color="#00ff88" />,
      content: (
        <div>
           <p style={{marginBottom:'15px', color:'#666', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'1px'}}>Digital Goods Policy</p>
           
           <h4 style={{color:'#fff', margin:'25px 0 10px', fontSize:'1rem'}}>1. Access Fees</h4>
           <p>The access fee (if applicable) grants lifetime entry to our private community and dashboard. As this is a digital service that is "consumed" immediately upon login, it is generally non-refundable.</p>
           
           <h4 style={{color:'#fff', margin:'25px 0 10px', fontSize:'1rem'}}>2. Exceptional Circumstances</h4>
           <p>Refunds may be issued at our sole discretion if a technical error prevents you from accessing the platform entirely within 24 hours of payment.</p>
        </div>
      )
    }
  };

  // --- 2. RENDER: FOOTER LINKS (Clean, Centered, Neon Hover) ---
  if (!activePolicy) return (
    <div style={{
      display: 'flex', 
      gap: '24px', 
      justifyContent: 'center', 
      alignItems: 'center', 
      flexWrap: 'wrap',
      marginTop: '10px'
    }}>
      {['privacy', 'terms', 'refund'].map((key) => (
        <button
          key={key}
          onClick={() => setActivePolicy(key)}
          onMouseEnter={() => setHovered(key)}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: 'transparent',
            border: 'none',
            color: hovered === key ? '#00ff88' : '#666', // Grey to Neon Green
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            padding: '5px',
            fontFamily: 'inherit',
            textDecoration: hovered === key ? 'underline' : 'none',
            textUnderlineOffset: '4px'
          }}
        >
          {policies[key].title}
        </button>
      ))}
    </div>
  );

  // --- 3. RENDER: THE GLASS MODAL (Popup) ---
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#0a0a0f', 
        border: '1px solid rgba(255,255,255,0.1)',
        width: '100%', maxWidth: '600px', 
        borderRadius: '24px', overflow: 'hidden', 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9)',
        display: 'flex', flexDirection: 'column', maxHeight: '85vh'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            {policies[activePolicy].icon}
            <h2 style={{fontSize: '1.4rem', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.5px'}}>
              {policies[activePolicy].title}
            </h2>
          </div>
          <button 
            onClick={() => setActivePolicy(null)} 
            style={{
              background:'rgba(255,255,255,0.05)', border:'none', color:'#ccc', 
              cursor:'pointer', padding:'8px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: '0.2s'
            }}
            onMouseOver={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'}}
            onMouseOut={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#ccc'}}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          padding: '40px', color: '#ccc', lineHeight: '1.7', 
          fontSize: '0.95rem', overflowY: 'auto'
        }}>
          {policies[activePolicy].content}
        </div>

        {/* Footer Action */}
        <div style={{
          padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'right',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <button 
            onClick={() => setActivePolicy(null)}
            style={{
              background: '#fff', color: '#000', fontWeight: '700',
              border: 'none', padding: '12px 30px', borderRadius: '12px',
              cursor: 'pointer', transition: '0.2s', fontSize: '0.9rem'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            I Understand
          </button>
        </div>

      </div>

      {/* Simple Animation Keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}