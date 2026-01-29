'use client';

import { useState } from 'react';
import { updateSystemConfig } from './actions';

export default function SettingsForm({ config }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  async function handleSubmit(formData) {
    setLoading(true);
    setStatus(null);

    // Call Server Action
    const result = await updateSystemConfig(formData);

    setLoading(false);
    
    if (result.success) {
      setStatus('success');
      // Auto-hide success message after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    } else {
      setStatus('error');
    }
  }

  // --- STYLES ---
  const glassCard = {
    background: '#0a0a0f', border: '1px solid #222', borderRadius: '24px', padding: '30px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden'
  };

  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#666', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' };
  
  const inputStyle = {
    width: '100%', background: '#000', border: '1px solid #222', borderRadius: '12px', 
    padding: '16px', color: '#fff', fontSize: '14px', outline: 'none', 
    marginBottom: '24px', transition: 'border 0.2s'
  };

  return (
    <div style={glassCard}>
      
      {/* SUCCESS NOTIFICATION (Beautiful Overlay, No Alerts) */}
      {status === 'success' && (
        <div className="fade-in" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(5, 5, 5, 0.9)', backdropFilter: 'blur(5px)', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{fontSize: '50px', marginBottom: '10px'}}>✅</div>
          <h3 style={{color: '#00ff88', fontWeight: '900', fontSize: '20px'}}>SAVED</h3>
          <p style={{color: '#888', fontSize: '12px'}}>System Updated Successfully</p>
        </div>
      )}

      <form action={handleSubmit}>
        
        {/* MAINTENANCE TOGGLE */}
        <div style={{
          marginBottom: '30px', padding: '20px', borderRadius: '16px',
          background: config.maintenance_mode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.05)',
          border: config.maintenance_mode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{fontWeight: '900', color: config.maintenance_mode ? '#f87171' : '#00ff88', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px'}}>
              Mode: {config.maintenance_mode ? 'LOCKDOWN' : 'LIVE'}
            </div>
            <div style={{fontSize: '11px', color: '#888', marginTop: '4px'}}>
              {config.maintenance_mode ? 'Users are blocked from dashboard.' : 'System is fully operational.'}
            </div>
          </div>
          {/* Custom Toggle Switch */}
          <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '26px', cursor: 'pointer'}}>
            <input type="checkbox" name="maintenance" defaultChecked={config.maintenance_mode} style={{opacity: 0, width: 0, height: 0}} />
            <span style={{
              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: config.maintenance_mode ? '#ef4444' : '#111', borderRadius: '34px', transition: '.4s',
              border: '1px solid #333'
            }}></span>
            <span style={{
              position: 'absolute', content: '""', height: '18px', width: '18px', left: '4px', bottom: '3px',
              backgroundColor: 'white', borderRadius: '50%', transition: '.4s',
              transform: config.maintenance_mode ? 'translateX(24px)' : 'translateX(0)'
            }}></span>
          </label>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <div>
            <label style={labelStyle}>Min Withdrawal (₹)</label>
            <input name="min_w" type="number" defaultValue={config.min_withdrawal} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp Support</label>
            <input name="whatsapp" type="text" defaultValue={config.support_whatsapp} placeholder="+91..." style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Broadcast Message</label>
          <textarea 
            name="notice" 
            defaultValue={config.notice_board} 
            rows="3" 
            style={{...inputStyle, resize: 'none', fontFamily: 'sans-serif', lineHeight: '1.5'}} 
            placeholder="Announce updates to all promoters..."
          />
        </div>

        {/* ANIMATED SAVE BUTTON */}
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '18px', borderRadius: '14px', border: 'none',
          background: loading ? '#333' : '#fff', 
          color: loading ? '#666' : '#000',
          fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px',
          cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s',
          boxShadow: loading ? 'none' : '0 0 20px rgba(255,255,255,0.3)'
        }}>
          {loading ? 'SYNCING DATABASE...' : 'SAVE CHANGES'}
        </button>

      </form>
    </div>
  );
}