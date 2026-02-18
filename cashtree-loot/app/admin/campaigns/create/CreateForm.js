'use client';

import { useState, useEffect } from 'react';
import { createCampaign } from './actions';
import { Save, Search, Zap } from 'lucide-react';

const NEON = '#00ff88';

export default function CreateForm() {
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [brandInput, setBrandInput]     = useState('');
  const [detectedIcon, setDetectedIcon] = useState('');
  const [isVector, setIsVector]         = useState(false);

  // Auto-fetch brand logo with 500ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!brandInput) {
        setDetectedIcon('');
        return;
      }
      const clean = brandInput.toLowerCase().trim();
      if (clean.includes('.')) {
        setDetectedIcon(
          `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${clean}&size=256`
        );
        setIsVector(false);
      } else {
        setDetectedIcon(`https://cdn.simpleicons.org/${clean}/white`);
        setIsVector(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [brandInput]);

  async function handleSubmit(formData) {
    setLoading(true);
    setError(null);

    // Inject auto-detected icon if no custom one was pasted
    if (!formData.get('icon_url') && detectedIcon) {
      formData.set('icon_url', detectedIcon);
    }

    const result = await createCampaign(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, createCampaign calls redirect() — this line never runs
  }

  return (
    <div style={{ maxWidth: '600px' }}>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Error banner */}
      {error && (
        <div style={{
          padding: '14px 16px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px',
          color: '#ef4444',
          marginBottom: '20px',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          ⚠ {error}
        </div>
      )}

      <form
        action={handleSubmit}
        style={{
          background: '#0a0a0f',
          border: '1px solid #1e1e1e',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}
      >

        {/* ── 1. BRAND IDENTITY ── */}
        <section style={{ marginBottom: '28px', background: '#0f0f0f', padding: '20px', borderRadius: '18px', border: '1px dashed #2a2a2a' }}>
          <div style={{
            fontSize: '11px', fontWeight: '800', color: '#444', textTransform: 'uppercase',
            letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Zap size={12} color={NEON} /> Brand Identity
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <FormInput
                label="Brand Name or Domain"
                name="temp_brand_search"
                placeholder="e.g. Binance  or  kotak.com"
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                hint="Auto-detects logos and icons"
              />
            </div>

            <div style={{
              flexShrink: 0,
              width: '76px',
              height: '76px',
              borderRadius: '16px',
              background: '#000',
              border: `1px solid ${detectedIcon ? NEON : '#222'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: detectedIcon ? `0 0 18px ${NEON}30` : 'none',
              transition: 'border-color 0.25s, box-shadow 0.25s',
              marginTop: '22px', // align with input (label height offset)
            }}>
              {detectedIcon ? (
                <img
                  src={detectedIcon}
                  alt="Logo preview"
                  style={{
                    width: '40px',
                    height: '40px',
                    objectFit: 'contain',
                    filter: isVector ? 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' : 'none',
                  }}
                  onError={() => setDetectedIcon('')}
                />
              ) : (
                <Search size={20} color="#2a2a2a" />
              )}
            </div>
          </div>

          <input type="hidden" name="icon_url" value={detectedIcon} />
        </section>

        {/* ── 2. CORE DETAILS ── */}
        <section style={{ marginBottom: '28px' }}>
          <SectionTitle>Core Details</SectionTitle>
          <FormInput label="Campaign Title"    name="title"         placeholder="e.g. Install ByBit App" required />
          <FormInput
            label="URL Slug"
            name="landing_url"
            placeholder="motwal"
            required
            hint="Creates: cashtree.online/motwal"
          />
          <FormInput
            label="Affiliate / Target Link"
            name="affiliate_link"
            placeholder="https://tracking.com/click?id=..."
            hint="Where the user lands after signup"
          />
          <FormInput label="Category" name="category" placeholder="e.g. Finance" />
        </section>

        {/* ── 3. BUDGET & PAYOUTS ── */}
        <section style={{ marginBottom: '28px' }}>
          <SectionTitle>Budget &amp; Payouts</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput
              label="Total Limit ₹"
              name="payout_amount"
              type="number"
              placeholder="100"
              required
              hint="Max total (user + promoter)"
            />
            <FormInput
              label="Default Cashback ₹"
              name="user_reward"
              type="number"
              placeholder="20"
              required
              hint="What users receive by default"
            />
          </div>
        </section>

        {/* ── 4. INSTRUCTIONS ── */}
        <section style={{ marginBottom: '28px' }}>
          <SectionTitle>User Instructions</SectionTitle>
          <textarea
            name="description"
            rows={4}
            placeholder={'1. Download the app\n2. Register with phone\n3. Verify OTP'}
            style={{
              width: '100%',
              background: '#000',
              border: '1px solid #1e1e1e',
              borderRadius: '12px',
              padding: '14px 16px',
              color: '#fff',
              outline: 'none',
              fontSize: '13px',
              lineHeight: 1.6,
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
            onFocus={(e)  => e.target.style.borderColor = '#333'}
            onBlur={(e)   => e.target.style.borderColor = '#1e1e1e'}
          />
        </section>

        {/* ── SUBMIT ── */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '17px',
            borderRadius: '14px',
            border: 'none',
            background: loading ? '#111' : NEON,
            color: loading ? '#555' : '#000',
            fontWeight: '900',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'background 0.2s, color 0.2s',
            boxShadow: loading ? 'none' : `0 0 20px ${NEON}30`,
          }}
        >
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.7s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Deploying…
            </>
          ) : (
            <>
              <Save size={17} />
              Launch Campaign
            </>
          )}
        </button>

      </form>
    </div>
  );
}

// ── Section title ──
function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: '11px',
      fontWeight: '800',
      color: '#444',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '16px',
      paddingBottom: '10px',
      borderBottom: '1px solid #111',
    }}>
      {children}
    </div>
  );
}

// ── Form input helper ──
function FormInput({ label, name, type = 'text', placeholder, required, hint, value, onChange }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '10px',
        fontWeight: '800',
        color: '#444',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
      }}>
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
          width: '100%',
          background: '#000',
          border: '1px solid #1e1e1e',
          borderRadius: '10px',
          padding: '13px 14px',
          color: '#fff',
          outline: 'none',
          fontSize: '13px',
          fontWeight: '600',
          transition: 'border-color 0.18s',
        }}
        onFocus={(e)  => e.target.style.borderColor = '#333'}
        onBlur={(e)   => e.target.style.borderColor = '#1e1e1e'}
      />
      {hint && (
        <div style={{ fontSize: '10px', color: NEON, marginTop: '5px', fontWeight: '600', opacity: 0.75 }}>
          {hint}
        </div>
      )}
    </div>
  );
}