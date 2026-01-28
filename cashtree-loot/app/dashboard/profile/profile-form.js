'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProfileForm({ account }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [focusedField, setFocusedField] = useState(null); // For Neon Glow effect
  
  const [formData, setFormData] = useState({
    full_name: account.full_name || '',
    upi_id: account.upi_id || ''
  });

  // 1. UPDATE PROFILE FUNCTION
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          full_name: formData.full_name,
          upi_id: formData.upi_id
        })
        .eq('id', account.id);

      if (error) throw error;

      setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
      router.refresh(); 
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Failed to save changes.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. LOGOUT FUNCTION
  const handleLogout = async () => {
    document.cookie = "ct_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- PREMIUM STYLES ---
  const labelStyle = { 
    display: 'block', 
    fontSize: '11px', 
    fontWeight: '800', 
    color: '#888', 
    textTransform: 'uppercase', 
    marginBottom: '8px', 
    letterSpacing: '1px',
    paddingLeft: '4px'
  };

  const getInputStyle = (fieldName) => ({
    width: '100%', 
    padding: '16px', 
    background: 'rgba(0, 0, 0, 0.3)', // Dark Glass
    border: focusedField === fieldName ? '1px solid #00ff88' : '1px solid rgba(255, 255, 255, 0.1)', // Neon Glow on Focus
    borderRadius: '16px', 
    color: '#fff', 
    fontSize: '15px', 
    marginBottom: '24px', 
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: focusedField === fieldName ? '0 0 15px rgba(0, 255, 136, 0.1)' : 'none'
  });

  const btnStyle = { 
    width: '100%', 
    padding: '18px', 
    background: 'linear-gradient(135deg, #00ff88, #00b36b)', // Neon Gradient
    color: '#000', 
    border: 'none', 
    borderRadius: '16px', 
    fontWeight: '800', 
    cursor: loading ? 'wait' : 'pointer', 
    textTransform: 'uppercase', 
    letterSpacing: '1px',
    boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
    marginTop: '10px',
    transition: 'transform 0.2s'
  };

  const logoutStyle = {
    width: '100%', 
    marginTop: '20px', 
    padding: '16px', 
    background: 'rgba(239, 68, 68, 0.05)', 
    color: '#f87171', 
    border: '1px solid rgba(239, 68, 68, 0.2)', 
    borderRadius: '16px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  return (
    <div style={{marginTop: '20px'}}>
      
      {/* MESSAGE BOX */}
      {message && (
        <div style={{
          padding: '16px', marginBottom: '24px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center',
          background: message.type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#00ff88' : '#f87171',
          border: message.type === 'success' ? '1px solid rgba(0, 255, 136, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpdate}>
        {/* FULL NAME */}
        <div>
          <label style={labelStyle}>Full Name</label>
          <input 
            type="text" 
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            onFocus={() => setFocusedField('full_name')}
            onBlur={() => setFocusedField(null)}
            placeholder="Enter your name"
            style={getInputStyle('full_name')}
          />
        </div>

        {/* UPI ID */}
        <div>
          <label style={labelStyle}>Default UPI ID (For Payouts)</label>
          <input 
            type="text" 
            value={formData.upi_id}
            onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
            onFocus={() => setFocusedField('upi_id')}
            onBlur={() => setFocusedField(null)}
            placeholder="example@oksbi"
            style={getInputStyle('upi_id')}
          />
        </div>

        {/* SAVE BUTTON */}
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* LOGOUT BUTTON */}
      <button onClick={handleLogout} style={logoutStyle}>
        Sign Out
      </button>

    </div>
  );
}