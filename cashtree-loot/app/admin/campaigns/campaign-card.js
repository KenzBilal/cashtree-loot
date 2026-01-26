'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CampaignCard({ campaign }) {
  const [isActive, setIsActive] = useState(campaign.is_active);
  const [loading, setLoading] = useState(false);

  // --- TOGGLE STATUS ---
  const toggleStatus = async () => {
    setLoading(true);
    try {
      const newState = !isActive;
      
      const { error } = await supabase
        .from('campaigns')
        .update({ is_active: newState })
        .eq('id', campaign.id);

      if (error) throw error;
      setIsActive(newState);

    } catch (err) {
      alert("Error updating status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Safe lead count access
  const leadCount = campaign.leads?.[0]?.count || 0;

  return (
    <div className={`relative group p-6 rounded-2xl border transition-all duration-300 ${isActive ? 'bg-[#0a0a0a] border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.05)]' : 'bg-black border-white/5 opacity-75'}`}>
      
      {/* HEADER & TOGGLE */}
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-inner ${isActive ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
          <i className="fas fa-bullhorn"></i>
        </div>
        
        {/* SWITCH */}
        <button 
          onClick={toggleStatus}
          disabled={loading}
          className={`w-12 h-6 rounded-full p-1 transition-colors ${isActive ? 'bg-green-600' : 'bg-slate-700'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
      </div>

      {/* TITLE */}
      <h3 className="text-lg font-black text-white mb-1 truncate">{campaign.title}</h3>
      <div className="text-xs text-slate-500 font-mono mb-6 truncate">{campaign.landing_url}</div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">You Pay</div>
          <div className="text-lg font-bold text-green-400">₹{campaign.payout_amount}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">User Gets</div>
          <div className="text-lg font-bold text-blue-400">₹{campaign.user_reward}</div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
        <div className="text-xs font-bold text-slate-400">
          <i className="fas fa-users mr-2 text-slate-600"></i>
          {leadCount} Leads
        </div>
        <div className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded ${isActive ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
          {isActive ? 'ACTIVE' : 'PAUSED'}
        </div>
      </div>

    </div>
  );
}