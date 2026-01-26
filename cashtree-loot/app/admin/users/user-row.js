'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function UserRow({ user }) {
  const [isFrozen, setIsFrozen] = useState(user.is_frozen);
  const [loading, setLoading] = useState(false);

  // Calculate Balance safely
  const balance = user.ledger?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;

  // --- TOGGLE FREEZE ---
  const toggleFreeze = async () => {
    const action = isFrozen ? "UNFREEZE" : "FREEZE";
    if (!confirm(`Are you sure you want to ${action} @${user.username}?`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ is_frozen: !isFrozen })
        .eq('id', user.id);

      if (error) throw error;
      setIsFrozen(!isFrozen);

    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className={`hover:bg-white/5 transition-colors ${isFrozen ? 'opacity-50 grayscale' : ''}`}>
      
      {/* Identity */}
      <td className="p-4">
        <div className="font-bold text-sm text-white">@{user.username}</div>
        <div className="text-[10px] text-slate-500">Joined: {new Date(user.created_at).toLocaleDateString()}</div>
      </td>

      {/* Contact */}
      <td className="p-4">
        <div className="text-xs text-slate-300">{user.phone}</div>
        <div className="text-[10px] font-mono text-slate-500">{user.upi_id || 'No UPI'}</div>
      </td>

      {/* Balance */}
      <td className="p-4 text-right">
        <div className={`font-mono font-bold ${balance < 0 ? 'text-red-500' : 'text-green-400'}`}>
          ₹{balance.toFixed(2)}
        </div>
      </td>

      {/* Status Badge */}
      <td className="p-4 text-center">
        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${isFrozen ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
          {isFrozen ? 'FROZEN' : 'ACTIVE'}
        </span>
      </td>

      {/* Action */}
      <td className="p-4 text-center">
        <button 
          onClick={toggleFreeze}
          disabled={loading}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isFrozen ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
          title={isFrozen ? "Unfreeze Account" : "Freeze Account"}
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className={`fas ${isFrozen ? 'fa-unlock' : 'fa-ban'}`}></i>}
        </button>
      </td>

    </tr>
  );
}