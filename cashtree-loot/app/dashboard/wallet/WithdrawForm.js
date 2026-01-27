'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function WithdrawForm({ maxAmount, defaultUpi, userId, minLimit }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [focusedField, setFocusedField] = useState(null); // For Neon Glow
  
  const [amount, setAmount] = useState('');
  const [upi, setUpi] = useState(defaultUpi || '');

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const val = parseFloat(amount);

    // 1. CLIENT-SIDE CHECKS
    if (!val || val <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid amount.' });
      setLoading(false);
      return;
    }
    if (val < minLimit) {
      setMessage({ type: 'error', text: `Minimum withdrawal is ₹${minLimit}` });
      setLoading(false);
      return;
    }
    if (val > maxAmount) {
      setMessage({ type: 'error', text: 'Insufficient wallet balance.' });
      setLoading(false);
      return;
    }
    if (!upi.includes('@')) {
      setMessage({ type: 'error', text: 'Invalid UPI ID format.' });
      setLoading(false);
      return;
    }

    try {
      // 2. INSERT REQUEST
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          account_id: userId,
          amount: val,
          upi_id: upi,
          status: 'pending'
        });

      if (error) throw error;

      // Success
      setMessage({ type: 'success', text: '✅ Request sent! Money on the way.' });
      setAmount(''); 
      router.refresh(); 

    } catch (err) {
      setMessage({ type: 'error', text: 'Server Error: Could not process request.' });
    } finally {
      setLoading(false);
    }
  };

  // --- PREMIUM GLASS STYLES ---
  const containerStyle = { 
    background: 'rgba(255, 255, 255, 0.03)', 
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.08)', 
    borderRadius: '24px', 
    padding: '30px', 
    marginBottom: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
  };

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
    padding: '18px', 
    background: 'rgba(0, 0, 0, 0.3)', // Dark Glass
    border: focusedField === fieldName ? '1px solid #00ff88' : '1px solid rgba(255, 255, 255, 0.1)', // Neon Focus
    borderRadius: '16px', 
    color: '#fff', 
    fontSize: '18px', 
    fontWeight: 'bold', 
    outline: 'none', 
    marginBottom: '24px',
    transition: 'all 0.3s ease',
    boxShadow: focusedField === fieldName ? '0 0 15px rgba(0, 255, 136, 0.1)' : 'none'
  });

  const btnStyle = { 
    width: '100%', 
    padding: '20px', 
    background: 'linear-gradient(135deg, #00ff88, #00b36b)', // Neon Gradient
    color: '#000', 
    border: 'none', 
    borderRadius: '16px', 
    fontWeight: '900', 
    fontSize: '16px', 
    cursor: loading ? 'wait' : 'pointer', 
    textTransform: 'uppercase', 
    letterSpacing: '1px', 
    opacity: loading ? 0.7 : 1,
    boxShadow: '0 0 25px rgba(0, 255, 136, 0.3)', // Button Glow
    transition: 'transform 0.2s'
  };

  return (
    <div style={containerStyle}>
      
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

      <form onSubmit={handleWithdraw}>
        {/* AMOUNT INPUT */}
        <div>
          <label style={labelStyle}>Withdraw Amount (₹)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={() => setFocusedField('amount')}
            onBlur={() => setFocusedField(null)}
            placeholder={`Min: ₹${minLimit}`}
            style={getInputStyle('amount')}
          />
        </div>

        {/* UPI INPUT */}
        <div>
          <label style={labelStyle}>UPI ID (GPay / PhonePe / Paytm)</label>
          <input 
            type="text" 
            value={upi}
            onChange={(e) => setUpi(e.target.value)}
            onFocus={() => setFocusedField('upi')}
            onBlur={() => setFocusedField(null)}
            placeholder="example@upi"
            style={getInputStyle('upi')}
          />
        </div>

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Processing...' : 'Withdraw Money'}
        </button>
      </form>
      
      <div style={{textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#666', fontWeight: '500'}}>
        Payments are processed within <span style={{color: '#fff'}}>24 hours</span>.
      </div>
    </div>
  );
}