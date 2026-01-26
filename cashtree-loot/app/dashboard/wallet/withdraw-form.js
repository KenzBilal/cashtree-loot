'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Init Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function WithdrawForm({ balance, upiId, userId }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // CONFIG: Minimum Withdrawal Amount
  const MIN_WITHDRAWAL = 100;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const val = Number(amount);

    // 1. CLIENT VALIDATION
    if (!upiId) return alert("Please add your UPI ID in Profile first.");
    if (val < MIN_WITHDRAWAL) return alert(`Minimum withdrawal is ₹${MIN_WITHDRAWAL}`);
    if (val > balance) return alert("Insufficient balance.");

    if (!confirm(`Confirm withdrawal of ₹${val} to ${upiId}?`)) return;

    setLoading(true);
    try {
      // 2. SUBMIT REQUEST
      // We insert into 'withdraw_requests'. 
      // The Admin will approve it later (which actually deducts money).
      const { error } = await supabase
        .from('withdraw_requests')
        .insert({
          promoter_id: userId,
          amount: val,
          status: 'pending'
        });

      if (error) throw error;

      alert("Withdrawal request sent! Admin will process it shortly.");
      setAmount(''); // Reset form
      window.location.reload(); // Refresh to show in history

    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-black border border-white/10 shadow-xl">
      
      {/* BALANCE DISPLAY */}
      <div className="text-center mb-6">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Available Funds</div>
        <div className="text-4xl font-black text-white font-mono">₹{balance.toFixed(2)}</div>
      </div>

      {/* FORM */}
      <form onSubmit={handleWithdraw} className="space-y-4">
        
        {/* UPI Display (Read Only) */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Linked UPI ID</label>
          {upiId ? (
            <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-300 font-mono text-sm">
              {upiId}
            </div>
          ) : (
            <Link href="/dashboard/profile" className="block w-full bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs font-bold text-center hover:bg-red-500/20 transition-colors">
              ⚠️ No UPI Linked. Click to Add.
            </Link>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Amount (Min ₹{MIN_WITHDRAWAL})</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-slate-500">₹</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min={MIN_WITHDRAWAL}
              max={balance}
              disabled={!upiId || balance < MIN_WITHDRAWAL}
              className="w-full bg-black border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading || !upiId || balance < MIN_WITHDRAWAL}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Request Payout'}
        </button>

      </form>

    </div>
  );
}