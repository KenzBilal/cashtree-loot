'use client';

import { useState } from 'react';
import { processLead } from './actions'; // Import Server Action

export default function LeadRow({ lead }) {
  const [loading, setLoading] = useState(false);

  const handleValidation = async (status) => {
    // Confirm Intent
    const payout = lead.campaigns?.payout_amount || 0;
    const msg = status === 'approved' 
      ? `Approve this lead? \nPromoter will be credited ₹${payout} immediately.`
      : `Reject this lead? \nPromoter will earn ₹0.`;
      
    if (!confirm(msg)) return;

    setLoading(true);
    try {
      // Call Server Action
      await processLead(lead.id, status, payout, lead.account_id, lead.campaigns?.title);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const isPending = lead.status === 'pending';
  const statusColors = { pending: '#facc15', approved: '#00ff88', rejected: '#ef4444' };
  const color = statusColors[lead.status] || '#888';

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 2fr 1.5fr', 
      padding: '16px 24px', borderBottom: '1px solid #1a1a1a', alignItems: 'center',
      background: 'transparent', transition: 'background 0.2s', fontSize: '13px'
    }}
    onMouseOver={(e) => e.currentTarget.style.background = '#0e0e12'}
    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
    >
      
      {/* 1. TIMESTAMP */}
      <div>
        <div style={{color: '#fff', fontWeight: '600'}}>
          {new Date(lead.created_at).toLocaleDateString()}
        </div>
        <div style={{color: '#555', fontSize: '11px'}}>
          {new Date(lead.created_at).toLocaleTimeString()}
        </div>
      </div>

      {/* 2. CAMPAIGN */}
      <div>
        <div style={{color: '#fff', fontWeight: '700'}}>{lead.campaigns?.title}</div>
        <div style={{color: '#00ff88', fontSize: '11px', fontWeight: '600'}}>
          Payout: ₹{lead.campaigns?.payout_amount}
        </div>
      </div>

      {/* 3. PROMOTER */}
      <div>
        <div style={{color: '#ddd', fontWeight: '600'}}>
          {lead.accounts?.username || 'Unknown'}
        </div>
        <div style={{color: '#444', fontSize: '11px', fontFamily: 'monospace'}}>
          ID: {lead.account_id.slice(0,6)}...
        </div>
      </div>

      {/* 4. SUBMITTED DATA */}
      <div>
         <div style={{
           background: '#111', padding: '8px', borderRadius: '6px', 
           border: '1px solid #222', fontSize: '11px', color: '#aaa',
           fontFamily: 'monospace', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis'
         }}>
           {lead.customer_data || 'No Data Provided'}
         </div>
      </div>

      {/* 5. ACTION BUTTONS */}
      <div style={{textAlign: 'right'}}>
        {isPending ? (
          <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
            <button 
              onClick={() => handleValidation('approved')}
              disabled={loading}
              style={{
                background: '#00ff88', color: '#000', border: 'none', padding: '8px 16px', 
                borderRadius: '8px', fontWeight: '800', fontSize: '11px', cursor: 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              ✓ APPROVE
            </button>
            <button 
              onClick={() => handleValidation('rejected')}
              disabled={loading}
              style={{
                background: 'transparent', color: '#ef4444', border: '1px solid #333', padding: '8px 12px', 
                borderRadius: '8px', fontWeight: '800', fontSize: '11px', cursor: 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              REJECT
            </button>
          </div>
        ) : (
          <span style={{
            fontSize: '11px', fontWeight: '800', color: color, textTransform: 'uppercase',
            border: `1px solid ${color}44`, padding: '4px 10px', borderRadius: '6px'
          }}>
            {lead.status}
          </span>
        )}
      </div>

    </div>
  );
}