'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CampaignCard({ campaign }) {
  const [status, setStatus] = useState(campaign.status || 'active');
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    const newStatus = status === 'active' ? 'paused' : 'active';
    setLoading(true);

    const { error } = await supabase
      .from('campaigns')
      .update({ status: newStatus })
      .eq('id', campaign.id);

    if (!error) setStatus(newStatus);
    setLoading(false);
  };

  // --- STYLES ---
  const cardStyle = {
    background: '#0a0a0a', border: '1px solid #222', borderRadius: '20px', 
    padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative'
  };
  const badgeStyle = {
    position: 'absolute', top: '20px', right: '20px', padding: '4px 10px', 
    borderRadius: '8px', fontSize: '10px', fontWeight: '900',
    background: status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    color: status === 'active' ? '#4ade80' : '#f87171',
    border: status === 'active' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
  };

  return (
    <div style={cardStyle}>
      <div style={badgeStyle}>{status.toUpperCase()}</div>
      
      <div>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '800', pr: '60px' }}>{campaign.title}</h3>
        <div style={{ fontSize: '11px', color: '#444', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {campaign.landing_url}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#000', padding: '12px', borderRadius: '12px' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#555', fontWeight: '800' }}>PAYOUT</div>
          <div style={{ color: '#22c55e', fontWeight: '900' }}>₹{campaign.payout_amount}</div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#555', fontWeight: '800' }}>REWARD</div>
          <div style={{ color: '#60a5fa', fontWeight: '900' }}>₹{campaign.user_reward}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px' }}>
        <div style={{ fontSize: '13px', color: '#888' }}>
          <b>{campaign.leads?.[0]?.count || 0}</b> Total Leads
        </div>
        <button 
          onClick={toggleStatus} 
          disabled={loading}
          style={{
            background: 'transparent', border: '1px solid #333', color: '#fff', 
            padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer'
          }}
        >
          {loading ? '...' : (status === 'active' ? 'Pause' : 'Activate')}
        </button>
      </div>
    </div>
  );
}