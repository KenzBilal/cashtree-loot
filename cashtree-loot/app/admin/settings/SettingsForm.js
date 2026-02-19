'use client';

import { useState } from 'react';
import { updateSystemConfig } from './actions';
import {
  Save, AlertTriangle, CheckCircle2, Activity,
  MessageCircle, CreditCard, Bell, Loader2, Shield, Zap
} from 'lucide-react';

const NEON = '#00ff88';

export default function SettingsForm({ config }) {
  const [status, setStatus]             = useState('idle'); // idle | loading | success | error
  const [toast, setToast]               = useState(null);
  const [isMaintenance, setIsMaintenance] = useState(config?.maintenance_mode || false);

  async function clientAction(formData) {
    setStatus('loading');
    setToast(null);

    const minLoad = new Promise(r => setTimeout(r, 600));
    const [result] = await Promise.all([updateSystemConfig(formData), minLoad]);

    if (result.success) {
      setStatus('success');
      setToast({ type: 'success', message: 'Configuration saved successfully.' });
      setTimeout(() => setStatus('idle'), 3000);
      setTimeout(() => setToast(null), 4000);
    } else {
      setStatus('error');
      setToast({ type: 'error', message: result.message || 'Failed to update settings.' });
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError   = status === 'error';

  return (
    <div>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin      { to { transform:rotate(360deg); } }
        @keyframes fadeIn    { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .s-card { transition: border-color 0.2s, box-shadow 0.2s; }
        .s-card:hover { border-color: #2a2a2a !important; }
        .s-input-group:focus-within { border-color: #2e2e2e !important; box-shadow: 0 0 0 3px rgba(0,255,136,0.05) !important; }
        .s-input-group:focus-within .s-input-icon { color: ${NEON} !important; }
        .s-input { background: transparent; border: none; color: #fff; font-size: 13px; outline: none; width: 100%; font-weight: 600; font-family: inherit; }
        .s-input::placeholder { color: #333; }
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          marginBottom: '24px',
          padding: '14px 18px',
          borderRadius: '14px',
          background: toast.type === 'success' ? 'rgba(0,255,136,0.06)' : 'rgba(239,68,68,0.06)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(0,255,136,0.2)' : 'rgba(239,68,68,0.2)'}`,
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'slideDown 0.3s ease-out',
        }}>
          {toast.type === 'success'
            ? <CheckCircle2 size={16} color={NEON} />
            : <AlertTriangle size={16} color="#ef4444" />}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {toast.type === 'success' ? 'Changes Saved' : 'Error'}
            </div>
            <div style={{ fontSize: '11px', color: toast.type === 'success' ? NEON : '#ef4444', marginTop: '2px', opacity: 0.85 }}>
              {toast.message}
            </div>
          </div>
        </div>
      )}

      <form action={clientAction}>
        <div style={{ display: 'grid', gap: '14px' }}>

          {/* ── 1. SYSTEM STATUS ── */}
          <Section icon={<Activity size={15} color={NEON} />} title="System Status" accent={NEON}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '16px',
              padding: '18px 20px',
              background: isMaintenance ? 'rgba(239,68,68,0.04)' : 'rgba(0,255,136,0.03)',
              border: `1px solid ${isMaintenance ? 'rgba(239,68,68,0.15)' : 'rgba(0,255,136,0.1)'}`,
              borderRadius: '12px',
              transition: 'all 0.3s',
            }}>
              <div>
                <div style={{ color: '#fff', fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>
                  Maintenance Mode
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '11px', color: isMaintenance ? '#ef4444' : NEON,
                  fontWeight: '700', transition: 'color 0.3s',
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: isMaintenance ? '#ef4444' : NEON,
                    boxShadow: `0 0 6px ${isMaintenance ? '#ef4444' : NEON}`,
                    transition: 'all 0.3s',
                  }} />
                  {isMaintenance ? 'System locked — users blocked' : 'System live — all services running'}
                </div>
              </div>

              {/* Toggle */}
              <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                <input
                  type="checkbox"
                  name="maintenance"
                  checked={isMaintenance}
                  onChange={(e) => setIsMaintenance(e.target.checked)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '48px', height: '26px',
                  background: isMaintenance ? '#ef4444' : '#1a1a1a',
                  borderRadius: '20px', position: 'relative',
                  transition: 'background 0.3s',
                  border: `1px solid ${isMaintenance ? 'rgba(239,68,68,0.4)' : '#2a2a2a'}`,
                }}>
                  <div style={{
                    width: '20px', height: '20px',
                    background: '#fff', borderRadius: '50%',
                    position: 'absolute', top: '2px',
                    left: isMaintenance ? '24px' : '2px',
                    transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }} />
                </div>
              </label>
            </div>

            {/* Live status indicator */}
            <div style={{
              marginTop: '12px',
              display: 'flex', gap: '10px', flexWrap: 'wrap',
            }}>
              {[
                { label: 'API',      ok: !isMaintenance },
                { label: 'Payments', ok: !isMaintenance },
                { label: 'Auth',     ok: true },
                { label: 'Database', ok: true },
              ].map(({ label, ok }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 10px',
                  background: ok ? 'rgba(0,255,136,0.05)' : 'rgba(239,68,68,0.05)',
                  border: `1px solid ${ok ? 'rgba(0,255,136,0.12)' : 'rgba(239,68,68,0.12)'}`,
                  borderRadius: '8px',
                }}>
                  <span style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: ok ? NEON : '#ef4444',
                  }} />
                  <span style={{ fontSize: '10px', fontWeight: '800', color: ok ? '#777' : '#ef4444', letterSpacing: '0.5px' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 2. FINANCIAL CONTROLS ── */}
          <Section icon={<CreditCard size={15} color="#3b82f6" />} title="Financial Controls" accent="#3b82f6">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              <InputField
                label="Min Withdrawal"
                hint="Minimum amount users can withdraw"
                icon="₹"
                iconIsText
              >
                <input
                  name="min_w"
                  type="number"
                  defaultValue={config?.min_withdrawal || 500}
                  className="s-input"
                  placeholder="500"
                />
              </InputField>

              <InputField
                label="Global Currency"
                hint="Cannot be changed"
                icon={<CreditCard size={14} />}
                disabled
              >
                <span style={{ color: '#555', fontSize: '13px', fontWeight: '600' }}>INR — Indian Rupee</span>
              </InputField>
            </div>
          </Section>

          {/* ── 3. COMMUNICATION ── */}
          <Section icon={<MessageCircle size={15} color="#facc15" />} title="Support &amp; Broadcasts" accent="#facc15">
            <div style={{ display: 'grid', gap: '12px' }}>
              <InputField
                label="WhatsApp Support"
                hint="Number shown to users for support"
                icon={<MessageCircle size={14} />}
              >
                <input
                  name="whatsapp"
                  type="text"
                  defaultValue={config?.support_whatsapp}
                  placeholder="+91 XXXXX XXXXX"
                  className="s-input"
                />
              </InputField>

              <InputField
                label="Global Notice Board"
                hint="Message displayed on all user dashboards"
                icon={<Bell size={14} />}
                isTextarea
              >
                <textarea
                  name="notice"
                  defaultValue={config?.notice_board}
                  rows={3}
                  placeholder="Enter a message to broadcast to all users…"
                  className="s-input"
                  style={{ resize: 'none', lineHeight: '1.6' }}
                />
              </InputField>
            </div>
          </Section>

          {/* ── 4. DANGER ZONE ── */}
          <Section icon={<Shield size={15} color="#ef4444" />} title="Danger Zone" accent="#ef4444">
            <div style={{
              padding: '16px 18px',
              background: 'rgba(239,68,68,0.03)',
              border: '1px solid rgba(239,68,68,0.1)',
              borderRadius: '12px',
              display: 'flex', flexWrap: 'wrap',
              justifyContent: 'space-between', alignItems: 'center', gap: '12px',
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '3px' }}>
                  Force Cache Revalidation
                </div>
                <div style={{ fontSize: '11px', color: '#555' }}>
                  Clears all cached data and forces a fresh fetch on next load.
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  background: 'transparent', color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.25)',
                  padding: '9px 16px', borderRadius: '10px',
                  fontSize: '10px', fontWeight: '900',
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.8px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  flexShrink: 0,
                }}
              >
                <Zap size={12} /> Revalidate
              </button>
            </div>
          </Section>

        </div>

        {/* ── SAVE BUTTON ── */}
        <div style={{
          marginTop: '20px',
          display: 'flex', justifyContent: 'flex-end',
          alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '10px', color: '#333', fontWeight: '700', letterSpacing: '0.5px' }}>
            Last synced: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
              background: isSuccess ? NEON : isError ? '#ef4444' : '#fff',
              color: isSuccess ? '#000' : isError ? '#fff' : '#000',
              border: 'none',
              padding: '13px 28px', borderRadius: '12px',
              fontSize: '11px', fontWeight: '900',
              cursor: isLoading ? 'wait' : isSuccess ? 'default' : 'pointer',
              textTransform: 'uppercase', letterSpacing: '1px',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              opacity: isLoading ? 0.8 : 1,
              boxShadow: isSuccess ? `0 0 24px rgba(0,255,136,0.35)` : isError ? '0 0 24px rgba(239,68,68,0.3)' : '0 0 20px rgba(255,255,255,0.1)',
              minWidth: '160px',
            }}
          >
            {isLoading && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {isSuccess  && <CheckCircle2 size={15} />}
            {isError    && <AlertTriangle size={15} />}
            {!isLoading && !isSuccess && !isError && <Save size={15} />}
            {isLoading ? 'Saving…' : isSuccess ? 'Saved!' : isError ? 'Failed' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── SECTION CARD ──
function Section({ icon, title, accent, children }) {
  return (
    <div className="s-card" style={{
      background: '#080808',
      border: '1px solid #1a1a1a',
      borderRadius: '18px',
      overflow: 'hidden',
      animation: 'fadeIn 0.4s ease-out',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '16px 20px',
        borderBottom: '1px solid #111',
        background: '#050505',
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '9px',
          background: `${accent}12`,
          border: `1px solid ${accent}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '12px', fontWeight: '900', color: '#fff', letterSpacing: '0.3px' }}>
          {title}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px' }}>
        {children}
      </div>
    </div>
  );
}

// ── INPUT FIELD ──
function InputField({ label, hint, icon, iconIsText, disabled, isTextarea, children }) {
  return (
    <div>
      <div style={{ marginBottom: '7px' }}>
        <div style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontSize: '10px', color: '#333', marginTop: '2px', fontWeight: '600' }}>{hint}</div>
        )}
      </div>
      <div
        className={disabled ? '' : 's-input-group'}
        style={{
          display: 'flex', alignItems: isTextarea ? 'flex-start' : 'center',
          gap: '10px',
          background: disabled ? '#050505' : '#000',
          border: `1px solid ${disabled ? '#111' : '#1e1e1e'}`,
          borderRadius: '11px',
          padding: isTextarea ? '13px 14px' : '12px 14px',
          transition: 'border-color 0.18s, box-shadow 0.18s',
          cursor: disabled ? 'not-allowed' : 'auto',
        }}
      >
        {icon && (
          <span
            className="s-input-icon"
            style={{
              color: '#444', flexShrink: 0,
              fontSize: iconIsText ? '13px' : undefined,
              fontWeight: iconIsText ? '800' : undefined,
              marginTop: isTextarea ? '2px' : 0,
              transition: 'color 0.18s',
            }}
          >
            {icon}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}