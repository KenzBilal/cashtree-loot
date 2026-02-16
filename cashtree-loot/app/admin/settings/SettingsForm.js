'use client';

import { useState } from 'react';
import { updateSystemConfig } from './actions';
import { 
  Save, AlertTriangle, CheckCircle2, Globe, ShieldAlert, 
  MessageCircle, CreditCard, Bell, Activity 
} from 'lucide-react';

export default function SettingsForm({ config }) {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '' }

  // --- HANDLER ---
  async function clientAction(formData) {
    setLoading(true);
    setNotification(null);

    const result = await updateSystemConfig(formData); // Server Action
    
    setLoading(false);
    
    if (result.success) {
      setNotification({ type: 'success', message: 'System configuration saved successfully.' });
      setTimeout(() => setNotification(null), 4000);
    } else {
      setNotification({ type: 'error', message: result.message || 'Failed to update settings.' });
    }
  }

  return (
    <div style={{ position: 'relative', maxWidth: '800px' }}>
      
      {/* 1. CUSTOM TOAST NOTIFICATION (Top Right) */}
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
        
        {/* SECTION 1: SYSTEM STATUS (Critical) */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Activity size={18} color="#00ff88" />
            <h3 style={sectionTitleStyle}>System Status</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#000', borderRadius: '12px', border: '1px solid #222' }}>
            <div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Maintenance Mode</div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                When active, all user dashboards are locked. Admin access remains open.
              </div>
            </div>
            
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" name="maintenance" defaultChecked={config?.maintenance_mode} style={{ display: 'none' }} />
              <div className="toggle-track" style={{
                width: '44px', height: '24px', background: config?.maintenance_mode ? '#ef4444' : '#222',
                borderRadius: '20px', position: 'relative', transition: '0.3s ease', border: '1px solid #333'
              }}>
                <div className="toggle-thumb" style={{
                  width: '18px', height: '18px', background: '#fff', borderRadius: '50%',
                  position: 'absolute', top: '2px', left: config?.maintenance_mode ? '22px' : '2px',
                  transition: '0.3s cubic-bezier(0.4, 0.0, 0.2, 1)', boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }} />
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 2: FINANCIAL CONTROLS */}
        <div style={{ ...cardStyle, marginTop: '24px' }}>
          <div style={cardHeaderStyle}>
            <CreditCard size={18} color="#3b82f6" />
            <h3 style={sectionTitleStyle}>Financial Limits</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={labelStyle}>Minimum Withdrawal (₹)</label>
              <div style={inputWrapperStyle}>
                <span style={{ color: '#666', fontSize: '14px', marginRight: '8px' }}>₹</span>
                <input 
                  name="min_w" 
                  type="number" 
                  defaultValue={config?.min_withdrawal || 500} 
                  style={inputStyle} 
                />
              </div>
              <p style={helperTextStyle}>Threshold for payout requests.</p>
            </div>
            
            {/* You can add Max Withdrawal here later if needed */}
            <div>
              <label style={labelStyle}>Global Currency</label>
              <div style={{ ...inputWrapperStyle, background: '#111', cursor: 'not-allowed', color: '#666' }}>
                INR (Indian Rupee)
              </div>
              <p style={helperTextStyle}>System currency is locked.</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: COMMUNICATION */}
        <div style={{ ...cardStyle, marginTop: '24px' }}>
          <div style={cardHeaderStyle}>
            <MessageCircle size={18} color="#facc15" />
            <h3 style={sectionTitleStyle}>Support & Broadcasts</h3>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>WhatsApp Support Number</label>
            <div style={inputWrapperStyle}>
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
            <label style={labelStyle}>Global Notice Board</label>
            <div style={{ ...inputWrapperStyle, alignItems: 'flex-start' }}>
              <Bell size={16} color="#666" style={{ marginTop: '4px', marginRight: '10px' }} />
              <textarea 
                name="notice" 
                defaultValue={config?.notice_board} 
                rows="3" 
                placeholder="Enter a message to display on all user dashboards..."
                style={{ ...inputStyle, resize: 'none', lineHeight: '1.5' }} 
              />
            </div>
            <p style={helperTextStyle}>Visible to all users at the top of their dashboard.</p>
          </div>
        </div>

        {/* ACTION BAR */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#444' }}>
            Last synced: {new Date().toLocaleTimeString()}
          </span>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: loading ? '#222' : '#fff', color: loading ? '#666' : '#000',
              border: 'none', padding: '12px 24px', borderRadius: '10px',
              fontSize: '13px', fontWeight: '700', cursor: loading ? 'wait' : 'pointer',
              transition: '0.2s', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? <div className="spinner" /> : <Save size={16} />}
            {loading ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>

      </form>

      {/* STYLES & ANIMATIONS */}
      <style jsx global>{`
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .spinner { width: 14px; height: 14px; border: 2px solid #666; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// --- CONSTANT STYLES (Clean & Professional) ---
const cardStyle = {
  background: '#0a0a0f', border: '1px solid #222', borderRadius: '16px', padding: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
};

const cardHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px',
  borderBottom: '1px solid #1a1a1a', paddingBottom: '16px'
};

const sectionTitleStyle = {
  fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0
};

const labelStyle = {
  display: 'block', fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '8px'
};

const inputWrapperStyle = {
  display: 'flex', alignItems: 'center', background: '#050505', border: '1px solid #333',
  borderRadius: '10px', padding: '12px 16px', transition: 'border 0.2s'
};

const inputStyle = {
  width: '100%', background: 'transparent', border: 'none', color: '#fff',
  fontSize: '14px', outline: 'none', fontFamily: '"Inter", sans-serif'
};

const helperTextStyle = {
  fontSize: '11px', color: '#444', marginTop: '6px'
};