'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { submitMotwalLead } from './actions';

export default function MotwalPage() {
  return (
    <Suspense fallback={<div style={{color:'#fff', padding:'20px', textAlign:'center'}}>Loading Offer...</div>}>
      <MotwalContent />
    </Suspense>
  );
}

function MotwalContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  const OFFER_LINK = "https://trkkcoin.com/IT3779ZXP1/JAM0MN?ln=English";
  const refCode = searchParams.get('ref') || '';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(''); // Reset msg

    const formData = new FormData(e.target);
    
    // Call Server Action
    const res = await submitMotwalLead(formData);

    if (res.success) {
      setStatusMsg('✅ Redirecting to Offer...');
      // 1.5s Delay exactly like your script
      setTimeout(() => {
        window.location.href = OFFER_LINK;
      }, 1500);
    } else {
      alert(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="motwal-body">
      {/* INJECTING YOUR EXACT CSS HERE */}
      <style jsx global>{`
        :root{
          --bg: #02050a;
          --card: #0b121a;
          --border: rgba(255, 255, 255, 0.08);
          --text: #eaf2f8;
          --muted: #9aa4af;
          --green: #22c55e;
        }
        .motwal-body {
          margin: 0;
          min-height: 100vh;
          background: radial-gradient(circle at top, #111827, #02050a);
          font-family: system-ui, -apple-system, sans-serif;
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .motwal-card {
          width: 100%; max-width: 440px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 26px;
          backdrop-filter: blur(10px);
        }
        .brand { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-weight: 800; font-size: 20px; }
        .brand span { color: var(--green); }
        .motwal-h1 { margin: 0; font-size: 1.8rem; font-weight: 800; color: #fff; }
        .badge { display: inline-block; margin-top: 6px; padding: 6px 12px; border-radius: 999px; background: rgba(34, 197, 94, 0.15); color: var(--green); font-size: 0.85rem; font-weight: 700; }
        .earn-box { margin-top: 20px; background: linear-gradient(135deg, rgba(34,197,94,0.1), transparent); border: 1px solid rgba(34,197,94,0.2); padding: 15px; border-radius: 12px; font-size: 0.95rem; line-height: 1.6; }
        .info-box { margin-top: 15px; padding: 15px; border-radius: 12px; background: rgba(0,0,0,0.3); border: 1px dashed var(--border); font-size: 0.9rem; color: var(--muted); line-height: 1.6; }
        .section { margin-top: 20px; }
        .motwal-label { display: block; font-size: 0.85rem; color: var(--muted); margin-bottom: 6px; margin-left: 4px; }
        .motwal-input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid var(--border); background: #0b121a; color: var(--text); font-size: 16px; }
        .motwal-input:focus { outline: none; border-color: var(--green); }
        .submit-btn { width: 100%; margin-top: 25px; padding: 16px; border-radius: 14px; border: none; background: var(--green); color: #000; font-weight: 800; font-size: 16px; cursor: pointer; transition: 0.2s; }
        .submit-btn:hover { box-shadow: 0 0 15px rgba(34,197,94,0.3); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .status-msg { font-size: 14px; text-align: center; margin-top: 15px; color: #22c55e; font-weight: bold; }
      `}</style>

      <div className="motwal-card">
        <div className="brand">🌱 CashTree <span>Loot</span></div>

        <h1 className="motwal-h1">Motwal</h1>
        <div className="badge">Verified App Offer</div>

        <div className="earn-box">
          <strong>How you earn ₹70:</strong><br/>
          • Click the button below<br/>
          • Register using your Phone Number<br/>
          • Complete the basic profile setup<br/>
          • Reward credited to UPI after verification
        </div>

        <div className="info-box">
          <strong>Requirements:</strong><br/>
          • Aadhaar linked to Mobile<br/>
          • Valid PAN Card<br/>
          • New Users Only<br/>
          • <strong>Reward: ₹70</strong>
        </div>

        <form onSubmit={handleSubmit}>
          {/* HIDDEN REF CODE */}
          <input type="hidden" name="ref_code" value={refCode} />

          <div className="section">
            <label className="motwal-label">Phone Number (Used for Motwal)</label>
            <input 
              className="motwal-input" 
              type="tel" 
              name="phone" 
              placeholder="Enter 10-digit mobile number" 
              required 
            />
          </div>

          <div className="section">
            <label className="motwal-label">Your UPI ID (For Payment)</label>
            <input 
              className="motwal-input" 
              type="text" 
              name="upi" 
              placeholder="Ex: name@upi" 
            />
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Submit & Download App'}
          </button>

          {statusMsg && (
            <p className="status-msg">
              {statusMsg}
            </p>
          )}
        </form>

      </div>
    </div>
  );
}