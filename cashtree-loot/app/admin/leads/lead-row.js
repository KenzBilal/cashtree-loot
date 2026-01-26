'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Init Client (For interacting with DB functions)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LeadRow({ lead }) {
  const [status, setStatus] = useState(lead.status); // 'pending', 'approved', 'rejected'
  const [loading, setLoading] = useState(false);

  // --- ACTIONS ---
  const handleAction = async (actionType) => {
    // 1. Safety Confirm
    if(!confirm(`Are you sure you want to ${actionType} this lead?`)) return;

    setLoading(true);
    try {
      // 2. Get Current Admin ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      // 3. Select Function Name
      const functionName = actionType === 'approve' ? 'approve_lead' : 'reject_lead';
      
      // 4. Call Database Function (RPC)
      const { error } = await supabase.rpc(functionName, { 
        target_lead_id: lead.id,
        admin_id: user.id
      });

      if (error) throw error;

      // 5. Success - Hide the row visually
      setStatus(actionType === 'approve' ? 'approved' : 'rejected');

    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // If processed, hide the row
  if (status !== 'pending') return null; 

  return (
    <tr className="hover:bg-white/5 transition-colors group">
      
      {/* Date */}
      <td className="p-4 text-xs font-mono text-slate-400">
        {new Date(lead.created_at).toLocaleDateString()}
        <br/>
        <span className="opacity-50">{new Date(lead.created_at).toLocaleTimeString()}</span>
      </td>

      {/* Campaign */}
      <td className="p-4">
        <div className="font-bold text-sm text-white">{lead.campaigns?.title || 'Unknown'}</div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Campaign ID</div>
      </td>

      {/* Promoter */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-green-500 to-blue-600 text-[10px] flex items-center justify-center font-bold text-white uppercase">
            {lead.accounts?.username?.[0] || '?'}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-200">@{lead.accounts?.username}</div>
            <div className="text-[10px] text-slate-500">First Lead: {lead.is_first_approved ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </td>

      {/* Payout Amount */}
      <td className="p-4 text-right font-mono text-green-400 font-bold">
        ₹{lead.campaigns?.payout_amount}
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex items-center justify-center gap-2">
          
          {/* REJECT BUTTON */}
          <button 
            onClick={() => handleAction('reject')}
            disabled={loading}
            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
            title="Reject"
          >
            <i className="fas fa-times"></i>
          </button>

          {/* APPROVE BUTTON */}
          <button 
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
            title="Approve & Pay"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
          </button>

        </div>
      </td>
    </tr>
  );
}