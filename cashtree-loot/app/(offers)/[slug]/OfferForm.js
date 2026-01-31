'use client';

import { useState } from 'react';
import { submitLead } from './actions';
import { Loader2, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';

export default function OfferForm({ campaignId, refCode, redirectUrl }) {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState(''); // ✅ Holds the real error text

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage(''); // Reset error

    const formData = new FormData(e.target);
    
    // Add hidden fields manually
    formData.append('campaign_id', campaignId);
    formData.append('referral_code', refCode || '');
    formData.append('redirect_url', redirectUrl);

    const result = await submitLead(formData);

    if (result.success) {
      setStatus('success');
      // Wait 1.5s for the animation, then go
      setTimeout(() => {
        window.location.href = result.redirectUrl;
      }, 1500);
    } else {
      setStatus('error');
      // ✅ CAPTURE THE REAL ERROR FROM SERVER
      setErrorMessage(result.error || 'Submission failed. Please try again.');
      
      // Keep the error visible for 5 seconds so you can read it
      setTimeout(() => setStatus('idle'), 5000);
    }
  }

  // --- SUCCESS STATE ---
  if (status === 'success') {
    return (
      <div className="success-overlay">
        <div className="success-icon">
          <CheckCircle2 size={64} className="text-neon" />
        </div>
        <h3>Offer Unlocked!</h3>
        <p>Redirecting you securely...</p>
        <style jsx>{`
          .success-overlay {
            height: 300px; display: flex; flex-direction: column; 
            align-items: center; justify-content: center; text-align: center;
            animation: fadeIn 0.5s ease;
          }
          .success-icon {
            margin-bottom: 20px;
            filter: drop-shadow(0 0 15px var(--neon));
            animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          h3 { font-size: 24px; font-weight: 800; margin: 0; color: #fff; }
          p { color: #888; margin-top: 8px; font-size: 14px; }
          .text-neon { color: #00ff88; }
          @keyframes popIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }
          @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // --- FORM STATE ---
  return (
    <form onSubmit={handleSubmit} className="form-stack">
      <div className="input-group">
        <label>Full Name</label>
        <input name="user_name" type="text" placeholder="e.g. Rahul Kumar" required disabled={status === 'loading'} />
      </div>

      <div className="input-group">
        <label>Phone Number</label>
        <input name="phone" type="tel" placeholder="98765 XXXXX" required disabled={status === 'loading'} />
      </div>

      <div className="input-group">
        <label>UPI ID (For Payment)</label>
        <input name="upi_id" type="text" placeholder="username@upi" required disabled={status === 'loading'} />
      </div>

      {refCode && (
         <div className="referral-box">
            <span className="label">Referral Applied</span>
            <span className="code">{refCode.toUpperCase()}</span>
         </div>
      )}

      <button type="submit" className="neon-btn" disabled={status === 'loading'}>
        {status === 'loading' ? (
          <span className="flex-center"><Loader2 className="spin" size={18} /> Processing...</span>
        ) : (
          <span className="flex-center">Submit & Download <ArrowRight size={18} /></span>
        )}
      </button>

      {/* ✅ ERROR MESSAGE DISPLAY */}
      {status === 'error' && (
        <div className="error-box">
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <style jsx>{`
        .form-stack { display: flex; flex-direction: column; gap: 16px; }
        .input-group label { display: block; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
        .input-group input {
          width: 100%; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.1);
          padding: 14px 16px; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 500;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-group input:focus { outline: none; border-color: #00ff88; box-shadow: 0 0 0 4px rgba(0, 255, 136, 0.1); background: rgba(0,0,0,0.6); }
        .input-group input:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .referral-box { background: rgba(0, 255, 136, 0.05); border: 1px dashed rgba(0, 255, 136, 0.2); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
        .referral-box .label { font-size: 11px; color: #00ff88; font-weight: 700; text-transform: uppercase; }
        .referral-box .code { font-size: 13px; color: #fff; font-weight: 700; letter-spacing: 1px; font-family: monospace; }

        .neon-btn {
          width: 100%; background: #00ff88; color: #000; font-size: 14px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 1px; padding: 16px; border-radius: 14px;
          border: none; cursor: pointer; margin-top: 8px; transition: all 0.3s;
          box-shadow: 0 0 20px -5px rgba(0, 255, 136, 0.4); position: relative; overflow: hidden;
        }
        .neon-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 40px -10px rgba(0, 255, 136, 0.6); }
        .neon-btn:disabled { background: #333; color: #666; box-shadow: none; cursor: not-allowed; }
        
        .flex-center { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spin { animation: spin 1s linear infinite; }
        
        .error-box { 
          margin-top: 12px; padding: 12px; background: rgba(239, 68, 68, 0.15); 
          border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; color: #ef4444; 
          font-size: 12px; font-weight: 600; text-align: center; display: flex; 
          align-items: center; justify-content: center; gap: 8px; animation: fadeIn 0.3s ease;
        }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}