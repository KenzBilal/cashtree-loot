'use client';

import { useState } from 'react';
import { updateSystemConfig } from './actions';
import { 
  Save, AlertTriangle, CheckCircle2, Activity, 
  MessageCircle, CreditCard, Bell, Loader2 
} from 'lucide-react';

export default function SettingsForm({ config }) {
  // We use a status string for complex button animation: 'idle' | 'loading' | 'success' | 'error'
  const [status, setStatus] = useState('idle'); 
  const [notification, setNotification] = useState(null);
  
  // Local state for the toggle
  const [isMaintenance, setIsMaintenance] = useState(config?.maintenance_mode || false);

  async function clientAction(formData) {
    setStatus('loading');
    setNotification(null);

    // Artificial delay (optional: 500ms) to let the user see the loading animation
    // if the server is too fast. It feels more "premium".
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 600));
    
    const [result] = await Promise.all([
      updateSystemConfig(formData),
      minLoadTime
    ]);
    
    if (result.success) {
      setStatus('success');
      setNotification({ type: 'success', message: 'System configuration saved successfully.' });
      
      // Reset button to 'idle' after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
      setTimeout(() => setNotification(null), 4000);
    } else {
      setStatus('error');
      setNotification({ type: 'error', message: result.message || 'Failed to update settings.' });
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  // --- 10/10 STYLES ---
  const cardStyle = {
    background: '#0a0a0f', border: '1px solid #222', borderRadius: '16px', padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'transform 0.2s, border-color 0.2s'
  };

  const cardHeaderStyle = {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px',
    borderBottom: '1px solid #1a1a1a', paddingBottom: '16px'
  };

  const inputWrapperStyle = {
    display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #333',
    borderRadius: '10px', padding: '12px 16px', transition: 'all 0.2s'
  };

  const inputStyle = {
    width: '100%', background: 'transparent', border: 'none', color: '#fff',
    fontSize: '14px', outline: 'none', fontFamily: '"Inter", sans-serif'
  };

  return (
    <div style={{ position: 'relative', maxWidth: '800px' }}>
      
      {/* TOAST NOTIFICATION (Top Right) */}
      {notification && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 100,
          background: notification.type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${notification.type === 'success' ? '#00ff88' : '#ef4444'}`,
          borderRadius: '12px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px',
          backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {notification.type === 'success' ? <CheckCircle2 color="#00ff88" size={20} /> : <AlertTriangle color="#ef4444" size={20} />}
          <div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
              {notification.type === 'success' ? 'Changes Saved' : 'Error'}
            </div>
            <div style={{ color: notification.type === 'success' ? '#00ff88' : '#ef4444', fontSize: '12px', opacity: 0.8 }}>
              {notification.message}
            </div>
          </div>
        </div>
      )}

      <form action={clientAction}>
        
        {/* 1. SYSTEM STATUS */}
        <div className="settings-card" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Activity size={18} color="#00ff88" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>System Status</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid #222' }}>
            <div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                Maintenance Mode
              </div>
              <div style={{ color: isMaintenance ? '#ef4444' : '#666', fontSize: '12px', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{width: '6px', height: '6px', borderRadius: '50%', background: isMaintenance ? '#ef4444' : '#00ff88'}}></span>
                {isMaintenance ? 'SYSTEM LOCKED' : 'System Live'}
              </div>
            </div>
            
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="maintenance" 
                checked={isMaintenance} 
                onChange={(e) => setIsMaintenance(e.target.checked)} 
                style={{ display: 'none' }} 
              />
              <div style={{
                width: '44px', height: '24px', 
                background: isMaintenance ? '#ef4444' : '#222', 
                borderRadius: '20px', position: 'relative', transition: '0.3s ease', border: '1px solid #333'
              }}>
                <div style={{
                  width: '18px', height: '18px', background: '#fff', borderRadius: '50%',
                  position: 'absolute', top: '2px', left: isMaintenance ? '22px' : '2px', 
                  transition: '0.3s cubic-bezier(0.4, 0.0, 0.2, 1)', boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }} />
              </div>
            </label>
          </div>
        </div>

        {/* 2. FINANCIAL CONTROLS */}
        <div className="settings-card" style={{ ...cardStyle, marginTop: '24px' }}>
          <div style={cardHeaderStyle}>
            <CreditCard size={18} color="#3b82f6" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>Financial Limits</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '8px' }}>Min Withdrawal (₹)</label>
              <div className="input-group" style={inputWrapperStyle}>
                <span style={{ color: '#666', fontSize: '14px', marginRight: '8px' }}>₹</span>
                <input 
                  name="min_w" 
                  type="number" 
                  defaultValue={config?.min_withdrawal || 500} 
                  style={inputStyle} 
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '8px' }}>Global Currency</label>
              <div style={{ ...inputWrapperStyle, background: '#111', cursor: 'not-allowed', color: '#666', borderColor: '#222' }}>
                INR (Indian Rupee)
              </div>
            </div>
          </div>
        </div>

        {/* 3. COMMUNICATION */}
        <div className="settings-card" style={{ ...cardStyle, marginTop: '24px' }}>
          <div style={cardHeaderStyle}>
            <MessageCircle size={18} color="#facc15" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>Support & Broadcasts</h3>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '8px' }}>WhatsApp Support Number</label>
            <div className="input-group" style={inputWrapperStyle}>
              <MessageCircle size={16} color="#666" style={{ marginRight: '10px' }} />
              <input 
                name="whatsapp" 
                type="text" 
                defaultValue={config?.support_whatsapp} 
                placeholder="+91 XXXXX XXXXX"
                style={inputStyle} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '8px' }}>Global Notice Board</label>
            <div className="input-group" style={{ ...inputWrapperStyle, alignItems: 'flex-start' }}>
              <Bell size={16} color="#666" style={{ marginTop: '4px', marginRight: '10px' }} />
              <textarea 
                name="notice" 
                defaultValue={config?.notice_board} 
                rows="3" 
                placeholder="Enter a message to display on all user dashboards..."
                style={{ ...inputStyle, resize: 'none', lineHeight: '1.5' }} 
              />
            </div>
          </div>
        </div>

        {/* 4. THE 10/10 ACTION BUTTON */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#444' }}>
            Last synced: {new Date().toLocaleTimeString()}
          </span>
          
          <button 
            type="submit" 
            disabled={status === 'loading' || status === 'success'}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: status === 'success' ? '#00ff88' : status === 'error' ? '#ef4444' : '#fff',
              color: status === 'success' ? '#000' : status === 'error' ? '#fff' : '#000',
              border: 'none', padding: '14px 28px', borderRadius: '12px',
              fontSize: '13px', fontWeight: '800', cursor: status === 'idle' ? 'pointer' : 'default',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: status === 'loading' ? 0.8 : 1,
              transform: status === 'loading' ? 'scale(0.98)' : 'scale(1)',
              boxShadow: status === 'success' ? '0 0 20px rgba(0, 255, 136, 0.4)' : 'none',
              minWidth: '160px', justifyContent: 'center'
            }}
          >
            {status === 'loading' && <Loader2 size={18} className="spin" />}
            {status === 'success' && <CheckCircle2 size={18} />}
            {status === 'error' && <AlertTriangle size={18} />}
            {status === 'idle' && <Save size={18} />}
            
            <span>
              {status === 'loading' ? 'SAVING...' : 
               status === 'success' ? 'SAVED!' : 
               status === 'error' ? 'FAILED' : 'SAVE CHANGES'}
            </span>
          </button>
        </div>

      </form>

      {/* ANIMATIONS & INTERACTION STYLES */}
      <style jsx global>{`
        /* Load Animation */
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        
        /* Spinner */
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        
        /* 10/10 Hover Effects */
        .settings-card:hover {
          border-color: #333 !important;
          transform: translateY(-2px);
        }
        
        .input-group:focus-within {
          border-color: #00ff88 !important;
          box-shadow: 0 0 0 1px rgba(0, 255, 136, 0.1);
        }
      `}</style>
    </div>
  );
}