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
      // We insert into 'withdrawals'. The server logic in page.js 
      // will subtract this from the balance automatically next time it loads.
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
      setAmount(''); // Reset form
      router.refresh(); // Update balance on screen immediately

    } catch (err) {
      setMessage({ type: 'error', text: 'Server Error: Could not process request.' });
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const containerStyle = { background: '#0a0a0a', border: '1px solid #222', borderRadius: '20px', padding: '24px', marginBottom: '30px' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#666', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' };
  const inputStyle = { width: '100%', padding: '16px', background: '#000', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '18px', fontWeight: 'bold', outline: 'none', marginBottom: '20px' };
  const btnStyle = { width: '100%', padding: '18px', background: 'linear-gradient(135deg, #22c55e, #166534)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '16px', cursor: loading ? 'wait' : 'pointer', textTransform: 'uppercase', letterSpacing: '1px', opacity: loading ? 0.7 : 1 };

  return (
    <div style={containerStyle}>
      
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

      <form onSubmit={handleWithdraw}>
        {/* AMOUNT INPUT */}
        <div>
          <label style={labelStyle}>Withdraw Amount (₹)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min: ₹${minLimit}`}
            style={inputStyle}
          />
        </div>

        {/* UPI INPUT */}
        <div>
          <label style={labelStyle}>UPI ID (GPay / PhonePe / Paytm)</label>
          <input 
            type="text" 
            value={upi}
            onChange={(e) => setUpi(e.target.value)}
            placeholder="example@upi"
            style={inputStyle}
          />
        </div>

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Processing...' : 'Withdraw Money'}
        </button>
      </form>
      
      <div style={{textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#555'}}>
        Payments are usually processed within 24 hours.
      </div>
    </div>
  );
}