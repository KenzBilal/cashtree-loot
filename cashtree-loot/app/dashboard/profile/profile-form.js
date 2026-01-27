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
      router.refresh(); // Refresh server data
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Failed to save changes.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. LOGOUT FUNCTION
  const handleLogout = async () => {
    // Clear cookie
    document.cookie = "ct_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- STYLES ---
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#666', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' };
  const inputStyle = { width: '100%', padding: '16px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontSize: '14px', marginBottom: '20px', outline: 'none' };
  const btnStyle = { width: '100%', padding: '16px', background: '#fff', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: loading ? 'wait' : 'pointer', textTransform: 'uppercase', letterSpacing: '1px' };

  return (
    <div style={{marginTop: '30px'}}>
      
      {/* MESSAGE BOX */}
      {message && (
        <div style={{
          padding: '12px', marginBottom: '20px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#4ade80' : '#f87171'
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
            placeholder="Enter your name"
            style={inputStyle}
          />
        </div>

        {/* UPI ID */}
        <div>
          <label style={labelStyle}>Default UPI ID (For Payouts)</label>
          <input 
            type="text" 
            value={formData.upi_id}
            onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
            placeholder="example@oksbi"
            style={inputStyle}
          />
        </div>

        {/* SAVE BUTTON */}
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* LOGOUT BUTTON */}
      <button 
        onClick={handleLogout}
        style={{
          width: '100%', marginTop: '20px', padding: '16px', 
          background: 'transparent', color: '#ef4444', 
          border: '1px solid #333', borderRadius: '12px', 
          fontWeight: '700', cursor: 'pointer', fontSize: '13px'
        }}
      >
        Sign Out
      </button>

    </div>
  );
}