'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function WithdrawalRow({ request }) {
  const [status, setStatus] = useState(request.status); // 'pending'
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionType) => {
    // 1. REJECT REASON (Mandatory for rejection)
    let reason = null;
    if (actionType === 'reject') {
      reason = prompt("Enter reason for rejection (Required):");
      if (!reason) return; // Stop if no reason provided
    } else {
      if (!confirm(`Confirm payout of ₹${request.amount} to ${request.accounts.username}?`)) return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // 2. CALL DB FUNCTION
      const { error } = await supabase.rpc('process_withdrawal', {
        target_request_id: request.id,
        admin_id: user.id,
        action_type: actionType,
        reason_text: reason
      });

      if (error) throw error;

      // 3. SUCCESS
      setStatus(actionType === 'approve' ? 'approved' : 'rejected');

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'pending') return null;

  return (
    <tr className="hover:bg-white/5 transition-colors group">
      
      {/* Date */}
      <td className="p-4 text-xs font-mono text-slate-400">
        {new Date(request.created_at).toLocaleDateString()}
        <br/>
        <span className="opacity-50">{new Date(request.created_at).toLocaleTimeString()}</span>
      </td>

      {/* Promoter */}
      <td className="p-4">
        <div className="font-bold text-sm text-white">@{request.accounts?.username}</div>
        <div className="text-[10px] text-slate-500">{request.accounts?.full_name}</div>
      </td>

      {/* Banking */}
      <td className="p-4">
        <div className="bg-white/5 border border-white/10 rounded px-2 py-1 inline-block">
          <div className="text-xs font-mono text-green-400">{request.accounts?.upi_id || 'NO UPI LINKED'}</div>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">Ph: {request.accounts?.phone}</div>
      </td>

      {/* Amount */}
      <td className="p-4 text-right font-mono text-xl font-black text-white">
        ₹{request.amount}
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex items-center justify-center gap-2">
          
          {/* REJECT */}
          <button 
            onClick={() => handleAction('reject')}
            disabled={loading}
            className="px-3 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
          >
            REJECT
          </button>

          {/* PAY */}
          <button 
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold hover:bg-green-500 hover:text-white transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          >
            {loading ? '...' : 'PAY NOW'}
          </button>

        </div>
      </td>
    </tr>
  );
}