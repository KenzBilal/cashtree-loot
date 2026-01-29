'use client';

import { useState } from 'react';
import { createCampaign } from './actions';
import { Save, Loader2 } from 'lucide-react';

export default function CreateForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(formData) {
    setLoading(true);
    setError(null);

    // Call Server Action
    // Note: If successful, the action will redirect us.
    const result = await createCampaign(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  // --- STYLES ---
  const neonGreen = '#00ff88';

  return (
    <div className="fade-in" style={{maxWidth: '600px'}}>
      
      {/* ERROR MESSAGE */}
      {error && (
        <div style={{
          padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', 
          borderRadius: '12px', color: '#ef4444', marginBottom: '20px', 
          fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <form action={handleSubmit} style={{
        background: '#0a0a0f', border: '1px solid #222', borderRadius: '24px', padding: '30px',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
      }}>
        
        {/* SECTION 1: CORE INFO */}
        <div style={{marginBottom: '24px'}}>
          <h3 style={{color: '#fff', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px', letterSpacing: '1px'}}>Core Details</h3>
          
          <Input label="Campaign Title" name="title" placeholder="e.g. Install ByBit App" required />
          
          {/* ✅ UPDATED LABEL WITH HINT */}
          <Input 
            label="Tracking Link (Landing URL)" 
            name="landing_url" 
            placeholder="e.g. https://... OR just type 'motwal'" 
            required 
            hint="💡 Pro Tip: Type 'motwal' to auto-generate https://cashttree.online/motwal"
          />
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px'}}>
            <Input label="Icon URL" name="icon_url" placeholder="https://imgur..." />
            <Input label="Category" name="category" placeholder="e.g. Finance" />
          </div>
        </div>

        {/* SECTION 2: FINANCE */}
        <div style={{marginBottom: '24px'}}>
          <h3 style={{color: '#fff', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px', letterSpacing: '1px'}}>Financials</h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            <Input label="Payout (You Earn) ₹" name="payout_amount" type="number" placeholder="0.00" required />
            <Input label="User Reward (They Get) ₹" name="user_reward" type="number" placeholder="0.00" required />
          </div>
        </div>

        {/* SECTION 3: INSTRUCTIONS */}
        <div style={{marginBottom: '30px'}}>
          <label style={{display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '8px', textTransform: 'uppercase'}}>User Instructions</label>
          <textarea 
            name="description" 
            rows="4" 
            placeholder="1. Download the app&#10;2. Register with phone number&#10;3. Verify OTP"
            style={{
              width: '100%', background: '#000', border: '1px solid #222', borderRadius: '12px', padding: '16px', 
              color: '#fff', outline: 'none', fontSize: '14px', lineHeight: '1.6', fontFamily: 'sans-serif', resize: 'vertical'
            }} 
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
          background: neonGreen, color: '#000', 
          fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px',
          cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          opacity: loading ? 0.7 : 1, transition: 'all 0.2s', boxShadow: loading ? 'none' : `0 0 20px ${neonGreen}40`
        }}>
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {loading ? 'DEPLOYING...' : 'LAUNCH CAMPAIGN'}
        </button>

      </form>
    </div>
  );
}

// Helper Input Component
function Input({ label, name, type = "text", placeholder, required, hint }) {
  return (
    <div style={{marginBottom: '16px'}}>
      <label style={{display: 'block', fontSize: '10px', fontWeight: '800', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
        {label}
      </label>
      
      <input 
        type={type} 
        name={name} 
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%', background: '#000', border: '1px solid #222', borderRadius: '12px', padding: '14px', 
          color: '#fff', outline: 'none', fontSize: '14px', fontWeight: '600', transition: 'border 0.2s'
        }} 
        onFocus={(e) => e.target.style.borderColor = '#444'}
        onBlur={(e) => e.target.style.borderColor = '#222'}
      />
      
      {hint && (
        <div style={{fontSize: '10px', color: '#00ff88', marginTop: '6px', fontWeight: '600', opacity: 0.8}}>
          {hint}
        </div>
      )}
    </div>
  );
}