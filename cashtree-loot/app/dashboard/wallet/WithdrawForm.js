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

  // --- LOGIC ---
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const val = parseFloat(amount);

    // Validations
    if (!val || val <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid amount.' });
      setLoading(false); return;
    }
    if (val < minLimit) {
      setMessage({ type: 'error', text: `Minimum withdrawal is ₹${minLimit}` });
      setLoading(false); return;
    }
    if (val > maxAmount) {
      setMessage({ type: 'error', text: 'Insufficient wallet balance.' });
      setLoading(false); return;
    }
    if (!upi.includes('@')) {
      setMessage({ type: 'error', text: 'Invalid UPI ID format.' });
      setLoading(false); return;
    }

    try {
      const { error } = await supabase.from('withdrawals').insert({
        account_id: userId,
        amount: val,
        upi_id: upi,
        status: 'pending'
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'PAYMENT INITIATED' });
      setAmount(''); 
      router.refresh(); 

    } catch (err) {
      setMessage({ type: 'error', text: 'Transaction Failed.' });
    } finally {
      setLoading(false);
    }
  };

  // Quick Set Helpers
  const setMax = () => setAmount(maxAmount);
  const addAmount = (val) => setAmount((prev) => (parseFloat(prev || 0) + val).toString());

  // --- 100/100 STYLES ---
  const containerStyle = { 
    background: 'rgba(0,0,0,0.4)', borderRadius: '24px', padding: '30px', 
    border: '1px solid rgba(255,255,255,0.05)'
  };

  const chipStyle = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '8px 16px', color: '#fff', fontSize: '11px', fontWeight: '700',
    cursor: 'pointer', transition: 'all 0.2s'
  };

  const neonGreen = '#00ff88';

  return (
    <div style={containerStyle}>
      
      {/* STATUS MESSAGE */}
      {message && (
        <div style={{
          padding: '12px', marginBottom: '20px', borderRadius: '12px', 
          fontSize: '11px', fontWeight: '900', textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase',
          background: message.type === 'success' ? `rgba(0, 255, 136, 0.1)` : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? neonGreen : '#ef4444',
          border: message.type === 'success' ? `1px solid ${neonGreen}` : '1px solid #ef4444'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleWithdraw}>
        
        {/* BIG MONEY INPUT */}
        <div style={{marginBottom: '30px', textAlign: 'center'}}>
           <div style={{fontSize: '11px', color: '#666', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px'}}>
             Enter Amount
           </div>
           <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px'}}>
              <span style={{fontSize: '40px', color: '#444', fontWeight: '900'}}>₹</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                style={{
                   background: 'transparent', border: 'none', color: '#fff',
                   fontSize: '64px', fontWeight: '900', width: '200px', textAlign: 'center',
                   outline: 'none', caretColor: neonGreen
                }}
              />
           </div>
           
           {/* Quick Chips */}
           <div style={{display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px'}}>
              <button type="button" onClick={() => addAmount(500)} style={chipStyle}>+500</button>
              <button type="button" onClick={() => addAmount(1000)} style={chipStyle}>+1000</button>
              <button type="button" onClick={setMax} style={{...chipStyle, color: neonGreen, borderColor: neonGreen}}>MAX</button>
           </div>
        </div>

        {/* UPI INPUT */}
        <div style={{marginBottom: '24px'}}>
          <label style={{display: 'block', fontSize: '11px', color: '#888', fontWeight: '800', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '4px'}}>
            DESTINATION UPI
          </label>
          <div style={{
             display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)',
             border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '0 16px'
          }}>
             <span style={{fontSize: '18px'}}>🏦</span>
             <input 
               type="text" 
               value={upi}
               onChange={(e) => setUpi(e.target.value)}
               placeholder="username@okaxis"
               style={{
                 width: '100%', background: 'transparent', border: 'none', padding: '16px',
                 color: '#fff', fontSize: '15px', fontWeight: '600', outline: 'none'
               }}
             />
          </div>
        </div>

        {/* PAY BUTTON */}
        <button type="submit" disabled={loading} style={{
           width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
           background: loading ? '#333' : neonGreen,
           color: loading ? '#666' : '#000',
           fontSize: '14px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase',
           cursor: loading ? 'not-allowed' : 'pointer',
           boxShadow: loading ? 'none' : `0 0 30px ${neonGreen}44`,
           transition: 'all 0.2s', transform: loading ? 'scale(0.98)' : 'scale(1)'
        }}>
           {loading ? 'Processing Transaction...' : 'Confirm Withdrawal'}
        </button>

      </form>
    </div>
  );
}