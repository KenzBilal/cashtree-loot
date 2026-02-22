'use client';

import { useState } from 'react';
import { submitLead } from './actions';
import { Loader2, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';

export default function OfferForm({ campaignId, refCode, redirectUrl, referrerId, payoutAmount }) {
  const [status, setStatus]           = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(e.target);
    formData.append('campaign_id',   campaignId);
    formData.append('referral_code', refCode || '');
    formData.append('redirect_url',  redirectUrl);
    if (referrerId)   formData.append('referrer_id',   referrerId);
    if (payoutAmount) formData.append('payout_amount', payoutAmount);

    const result = await submitLead(formData);

    if (result.success) {
      setStatus('success');
      setTimeout(() => { window.location.href = result.redirectUrl; }, 1500);
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Submission failed. Please try again.');
      setTimeout(() => setStatus('idle'), 5000);
    }
  }

  // ── SUCCESS STATE ──
  if (status === 'success') {
    return (
      <div style={{
        height: '280px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        animation: 'ctFadeIn 0.5s ease',
      }}>
        <style>{`
          @keyframes ctFadeIn  { from { opacity:0; } to { opacity:1; } }
          @keyframes ctPopIn   { from { transform:scale(0); } to { transform:scale(1); } }
          @keyframes ctSpin    { to { transform:rotate(360deg); } }
        `}</style>
        <div style={{
          marginBottom: '20px',
          filter: 'drop-shadow(0 0 15px #00ff88)',
          animation: 'ctPopIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275)',
          color: '#00ff88',
        }}>
          <CheckCircle2 size={64} />
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#fff' }}>
          Offer Unlocked!
        </h3>
        <p style={{ color: '#888', marginTop: '8px', fontSize: '14px' }}>
          Redirecting you securely...
        </p>
      </div>
    );
  }

  // ── FORM STATE ──
  const inputStyle = {
    width: '100%', background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '14px 16px', borderRadius: '12px',
    color: '#fff', fontSize: '15px', fontWeight: '500',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    opacity: status === 'loading' ? 0.5 : 1,
  };

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: '700',
    color: '#6b7280', textTransform: 'uppercase',
    marginBottom: '6px', letterSpacing: '0.5px',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <style>{`
        @keyframes ctFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes ctSpin   { to { transform:rotate(360deg); } }
        .ct-input:focus {
          border-color: #00ff88 !important;
          box-shadow: 0 0 0 4px rgba(0,255,136,0.1) !important;
          background: rgba(0,0,0,0.6) !important;
        }
        .ct-input:disabled { cursor: not-allowed; }
        .ct-neon-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px -10px rgba(0,255,136,0.6) !important;
        }
        .ct-neon-btn:disabled {
          background: #333 !important;
          color: #666 !important;
          box-shadow: none !important;
          cursor: not-allowed;
        }
      `}</style>

      {/* Name */}
      <div>
        <label style={labelStyle}>Full Name</label>
        <input
          className="ct-input"
          name="user_name" type="text"
          placeholder="e.g. Rahul Kumar"
          required disabled={status === 'loading'}
          style={inputStyle}
        />
      </div>

      {/* Phone */}
      <div>
        <label style={labelStyle}>Phone Number</label>
        <input
          className="ct-input"
          name="phone" type="tel"
          placeholder="98765 XXXXX"
          required disabled={status === 'loading'}
          style={inputStyle}
        />
      </div>

      {/* UPI */}
      <div>
        <label style={labelStyle}>UPI ID (For Payment)</label>
        <input
          className="ct-input"
          name="upi_id" type="text"
          placeholder="username@upi"
          required disabled={status === 'loading'}
          style={inputStyle}
        />
      </div>

      {/* Referral badge */}
      {refCode && (
        <div style={{
          background: 'rgba(0,255,136,0.05)',
          border: '1px dashed rgba(0,255,136,0.2)',
          borderRadius: '12px', padding: '12px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '11px', color: '#00ff88', fontWeight: '700', textTransform: 'uppercase' }}>
            Referral Applied
          </span>
          <span style={{ fontSize: '13px', color: '#fff', fontWeight: '700', letterSpacing: '1px', fontFamily: 'monospace' }}>
            {refCode.toUpperCase()}
          </span>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        className="ct-neon-btn"
        disabled={status === 'loading'}
        style={{
          width: '100%', background: '#00ff88', color: '#000',
          fontSize: '14px', fontWeight: '800',
          textTransform: 'uppercase', letterSpacing: '1px',
          padding: '16px', borderRadius: '14px', border: 'none',
          cursor: 'pointer', marginTop: '8px',
          boxShadow: '0 0 20px -5px rgba(0,255,136,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          fontFamily: 'inherit',
        }}
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={18} style={{ animation: 'ctSpin 1s linear infinite' }} />
            Processing...
          </>
        ) : (
          <>
            Submit &amp; Continue <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* Error */}
      {status === 'error' && (
        <div style={{
          padding: '12px', borderRadius: '10px',
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444', fontSize: '12px', fontWeight: '600',
          textAlign: 'center', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '8px',
          animation: 'ctFadeIn 0.3s ease',
        }}>
          <AlertTriangle size={16} />
          {errorMessage}
        </div>
      )}
    </form>
  );
}