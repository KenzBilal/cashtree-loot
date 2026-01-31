'use client';

import { useState, useEffect } from 'react';
import { createCampaign } from './actions'; // Ensure this points to the file below
import { Save, Loader2, Search, Zap } from 'lucide-react';

export default function CreateForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // --- BRAND INTELLIGENCE STATE ---
  const [brandInput, setBrandInput] = useState('');
  const [detectedIcon, setDetectedIcon] = useState('');
  const [isVector, setIsVector] = useState(false);

  // --- THE MAGIC LOGIC (Auto-Fetch Logo) ---
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (!brandInput) {
        setDetectedIcon('');
        return;
      }

      const cleanInput = brandInput.toLowerCase().trim();

      // 1. Check if it looks like a domain (has dot) -> e.g. "angelone.in"
      if (cleanInput.includes('.')) {
        setDetectedIcon(`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanInput}&size=256`);
        setIsVector(false);
      } 
      // 2. Else assume it's a famous tech/crypto brand -> e.g. "binance"
      else {
        setDetectedIcon(`https://cdn.simpleicons.org/${cleanInput}/white`);
        setIsVector(true);
      }
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [brandInput]);

  async function handleSubmit(formData) {
    setLoading(true);
    setError(null);

    // Inject the auto-detected icon if user didn't paste a custom one
    if (!formData.get('icon_url') && detectedIcon) {
      formData.set('icon_url', detectedIcon);
    }

    const result = await createCampaign(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

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
        
        {/* --- 1. BRAND INTELLIGENCE --- */}
        <div style={{marginBottom: '30px', background: '#111', padding: '20px', borderRadius: '20px', border: '1px dashed #333'}}>
          <h3 style={{color: '#fff', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Zap size={14} color={neonGreen} /> Brand Identity
          </h3>

          <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
             <div style={{flex: 1}}>
                <Input 
                   label="Brand Name OR Domain" 
                   name="temp_brand_search" 
                   placeholder="e.g. 'Binance' OR 'kotak.com'" 
                   value={brandInput}
                   onChange={(e) => setBrandInput(e.target.value)}
                   hint="✨ Auto-detects Vectors & Logos"
                />
             </div>

             <div style={{
                width: '80px', height: '80px', borderRadius: '16px', 
                background: '#000', border: detectedIcon ? `1px solid ${neonGreen}` : '1px solid #333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: detectedIcon ? `0 0 20px ${neonGreen}40` : 'none',
                transition: 'all 0.3s'
             }}>
                {detectedIcon ? (
                  <img 
                    src={detectedIcon} 
                    alt="Preview" 
                    style={{
                      width: '40px', height: '40px', objectFit: 'contain',
                      filter: isVector ? 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' : 'none'
                    }} 
                    onError={(e) => {
                      e.target.style.display='none';
                      setDetectedIcon(''); 
                    }}
                  />
                ) : (
                  <Search size={20} color="#333" />
                )}
             </div>
          </div>
          <input type="hidden" name="icon_url" value={detectedIcon} />
        </div>

        {/* --- 2. CORE DETAILS --- */}
        <div style={{marginBottom: '24px'}}>
          <h3 style={{color: '#fff', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px', letterSpacing: '1px'}}>Core Details</h3>
          
          <Input label="Campaign Title" name="title" placeholder="e.g. Install ByBit App" required />
          <Input 
            label="URL Slug (e.g. motwal)" 
            name="landing_url" 
            placeholder="motwal" 
            required 
            hint="This creates: cashttree.online/motwal"
          />
          <Input 
            label="Target / Affiliate Link" 
            name="affiliate_link" 
            placeholder="https://tracking.com/click?id=..." 
            required 
            hint="Where the user goes after the Signup Page"
          />
          
          <div style={{marginTop: '16px'}}>
            <Input label="Category" name="category" placeholder="e.g. Finance" />
          </div>
        </div>

        {/* --- 3. FINANCE (UPDATED LABELS) --- */}
        <div style={{marginBottom: '24px'}}>
          <h3 style={{color: '#fff', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px', letterSpacing: '1px'}}>
            Budget & Payouts
          </h3>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            {/* ✅ FIXED: Renamed to "Total Limit" so you know this is the Ceiling */}
            <Input 
              label="Total Limit (Max Budget) ₹" 
              name="payout_amount" 
              type="number" 
              placeholder="100" 
              required 
              hint="Max total allowed (User + Promoter)"
            />
            {/* ✅ FIXED: Renamed to "Default Cashback" */}
            <Input 
              label="Default User Cashback ₹" 
              name="user_reward" 
              type="number" 
              placeholder="20" 
              required 
              hint="What users get if Promoter changes nothing"
            />
          </div>
        </div>

        {/* --- 4. INSTRUCTIONS --- */}
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

// Helper Input Component (Unchanged)
function Input({ label, name, type = "text", placeholder, required, hint, value, onChange }) {
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
        value={value}
        onChange={onChange}
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