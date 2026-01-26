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
  const [upi, setUpi] = useState(account.upi_id || '');
  const [loading, setLoading] = useState(false);
  const isLocked = !!account.upi_id; // If DB has value, it is locked.

  // --- SAVE UPI ---
  const handleSaveUpi = async (e) => {
    e.preventDefault();
    if (isLocked) return; // Double check

    if (!confirm("Confirm UPI ID? You CANNOT change this later.")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ upi_id: upi })
        .eq('id', account.id);

      if (error) throw error;
      
      alert("UPI ID Saved & Locked.");
      router.refresh(); // Refresh to lock the field

    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Delete cookie manually to be safe
    document.cookie = "ct_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push('/login');
  };

  return (
    <div className="space-y-8">
      
      {/* UPI SECTION */}
      <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/10">
        <h3 className="text-sm font-bold text-white mb-4 flex justify-between">
          Banking Details
          {isLocked && <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20">VERIFIED</span>}
        </h3>
        
        <form onSubmit={handleSaveUpi} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">UPI ID (For Payouts)</label>
            <input 
              type="text" 
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              disabled={isLocked || loading}
              placeholder="e.g. 9876543210@paytm"
              className={`w-full bg-black border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${isLocked ? 'border-transparent text-slate-400 cursor-not-allowed' : 'border-white/10 focus:border-green-500'}`}
            />
          </div>

          {!isLocked && (
            <button 
              type="submit" 
              disabled={loading || !upi}
              className="w-full bg-white text-black font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save & Lock'}
            </button>
          )}
          
          {isLocked && (
            <p className="text-[10px] text-slate-600 text-center">
              To change your UPI ID, please contact Admin support.
            </p>
          )}
        </form>
      </div>

      {/* DANGER ZONE */}
      <button 
        onClick={handleLogout}
        className="w-full py-4 rounded-xl border border-red-500/20 text-red-500 font-bold uppercase tracking-widest text-xs hover:bg-red-500/10 transition-colors"
      >
        Sign Out
      </button>

      <div className="text-center">
        <div className="text-[10px] text-slate-600 font-mono">
          CashTree v1.0 • Promoter ID: {account.id.slice(0,8)}
        </div>
      </div>

    </div>
  );
}