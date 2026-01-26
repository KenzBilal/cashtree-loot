'use client';

import { useState } from 'react';

export default function TaskCard({ campaign, promoterId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // 1. CONSTRUCT TRACKING LINK
    // Format: domain.com/task/[campaign_id]?ref=[promoter_id]
    const link = `${window.location.origin}/task/${campaign.id}?ref=${promoterId}`;

    // 2. COPY TO CLIPBOARD
    navigator.clipboard.writeText(link);

    // 3. UI FEEDBACK
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
      
      {/* HEADER: Title & Payout */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-black text-white leading-tight mb-1">{campaign.title}</h3>
          <p className="text-xs text-slate-500 line-clamp-2">{campaign.description || 'Complete the steps to earn reward.'}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">You Earn</div>
          <div className="text-xl font-black text-green-400 font-mono">₹{campaign.payout_amount}</div>
        </div>
      </div>

      {/* FOOTER: Reward Info & Action */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
        
        {/* User Reward Badge */}
        <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
          <i className="fas fa-gift"></i>
          User gets ₹{campaign.user_reward}
        </div>

        {/* COPY BUTTON (Primary Action) */}
        <button 
          onClick={handleCopy}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${copied ? 'bg-green-500 text-black shadow-green-500/20' : 'bg-white text-black hover:bg-slate-200'}`}
        >
          {copied ? (
            <>
              <i className="fas fa-check"></i> Copied!
            </>
          ) : (
            <>
              <i className="fas fa-link"></i> Copy Link
            </>
          )}
        </button>

      </div>

    </div>
  );
}