'use client';

import { useState } from 'react';
import { ExternalLink, Check, X } from 'lucide-react'; // Optional icons

export default function PayoutRow({ item, actions }) {
  const [status, setStatus] = useState('IDLE'); // IDLE | CONFIRMING | LOADING
  const [copied, setCopied] = useState(false);

  const isUser = item.type === 'USER';

  // --- 1. GENERATE SMART UPI LINK ---
  // This creates the deep link that opens PhonePe/GPay directly
  const generateDeepLink = () => {
    const payeeName = encodeURIComponent(item.name.replace(/[^a-zA-Z0-9 ]/g, '')); // Sanitize name
    const note = encodeURIComponent(isUser ? `CashTree Cashback - Ref #${item.id.slice(0,4)}` : `CashTree Payout - ${item.name}`);
    
    // The standard UPI Deep Link format
    return `upi://pay?pa=${item.upi_id}&pn=${payeeName}&am=${item.amount}&cu=INR&tn=${note}`;
  };

  // --- 2. HANDLE ACTIONS ---
  const handlePayClick = () => {
    const link = generateDeepLink();
    
    // Try to open the UPI app
    window.open(link, '_blank'); // Opens in new tab/app picker
    
    // Switch button to "Confirm" mode so admin can mark it done after paying
    setStatus('CONFIRMING');
  };

  const handleMarkAsDone = async () => {
    setStatus('LOADING');
    try {
      let result;
      if (isUser) {
        result = await actions.markLeadAsPaid(item.id);
      } else {
        result = await actions.processWithdrawal(item.id, 'paid', item.amount, item.accountId);
      }

      if (!result.success) {
        alert(`Error: ${result.error}`);
        setStatus('CONFIRMING'); // Go back if failed
      }
      // If success, the row will be removed automatically by the parent re-render
    } catch (err) {
      alert(`System Error: ${err.message}`);
      setStatus('CONFIRMING');
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to REJECT this request? Money will be refunded to wallet.")) return;
    setStatus('LOADING');
    await actions.processWithdrawal(item.id, 'rejected', item.amount, item.accountId);
  };

  // --- UTILS ---
  const copyUpi = () => {
    navigator.clipboard.writeText(item.upi_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- STYLES ---
  const badgeStyle = {
    fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px',
    border: isUser ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(168, 85, 247, 0.2)',
    background: isUser ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
    color: isUser ? '#60a5fa' : '#c084fc', display: 'inline-flex', alignItems: 'center', gap: '4px'
  };

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 2fr 1.5fr', 
      padding: '16px 24px', borderBottom: '1px solid #1a1a1a', alignItems: 'center',
      background: status === 'CONFIRMING' ? 'rgba(0, 255, 136, 0.05)' : 'transparent', // Highlight active rows
      transition: 'background 0.2s', fontSize: '13px'
    }}
    onMouseOver={(e) => status !== 'CONFIRMING' && (e.currentTarget.style.background = '#0e0e12')}
    onMouseOut={(e) => status !== 'CONFIRMING' && (e.currentTarget.style.background = 'transparent')}
    >
      
      {/* 1. TIMELINE */}
      <div>
        <div style={{color: '#fff', fontWeight: '600'}}>
          {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>
        <div style={{color: '#555', fontSize: '11px', marginTop: '2px'}}>
          {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>

      {/* 2. BENEFICIARY */}
      <div>
        <div style={{color: '#fff', fontWeight: '700', overflow:'hidden', textOverflow:'ellipsis'}}>
          {item.name}
        </div>
        <div style={{color: '#444', fontSize: '11px', fontFamily: 'monospace'}}>
          {item.details}
        </div>
      </div>

      {/* 3. TYPE */}
      <div>
         <span style={badgeStyle}>{item.type}</span>
      </div>

      {/* 4. BANKING */}
      <div>
         <div style={{fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '4px'}}>
            ₹{item.amount.toLocaleString()}
         </div>
         <div onClick={copyUpi} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}>
            <span style={{fontFamily: 'monospace', color: copied ? '#00ff88' : '#aaa', fontSize: '11px'}}>
              {item.upi_id}
            </span>
            {copied && <span style={{color: '#00ff88', fontSize: '10px'}}>✓</span>}
         </div>
      </div>

      {/* 5. ACTION BUTTONS (The Smart Part) */}
      <div style={{textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
        
        {status === 'IDLE' && (
          <>
             {/* REJECT BUTTON (Only for Promoters) */}
             {!isUser && (
              <button 
                onClick={handleReject}
                style={{
                  background: 'transparent', color: '#ef4444', border: '1px solid #333', 
                  padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                }}
                title="Reject Request"
              >
                <X size={14} />
              </button>
            )}

            {/* PAY BUTTON (Opens UPI) */}
            <button 
              onClick={handlePayClick}
              style={{
                background: '#00ff88', color: '#000', border: 'none', padding: '8px 16px', 
                borderRadius: '8px', fontWeight: '800', fontSize: '11px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)'
              }}
            >
              <span>⚡ PAY NOW</span>
            </button>
          </>
        )}

        {status === 'CONFIRMING' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end'}}>
             <span style={{fontSize: '9px', color: '#00ff88', fontWeight: '700'}}>PAYMENT INITIATED...</span>
             <div style={{display: 'flex', gap: '6px'}}>
                <button 
                  onClick={() => setStatus('IDLE')}
                  style={{
                    background: '#333', color: '#fff', border: 'none', padding: '8px 12px', 
                    borderRadius: '8px', fontSize: '10px', cursor: 'pointer', fontWeight: '700'
                  }}
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleMarkAsDone}
                  style={{
                    background: '#00ff88', color: '#000', border: 'none', padding: '8px 12px', 
                    borderRadius: '8px', fontSize: '10px', cursor: 'pointer', fontWeight: '800',
                    animation: 'pulse 1.5s infinite'
                  }}
                >
                  ✓ MARK PAID
                </button>
             </div>
          </div>
        )}

        {status === 'LOADING' && (
          <div style={{color: '#666', fontSize: '11px', fontWeight: '800'}}>PROCESSING...</div>
        )}

      </div>
      
      <style jsx>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}