'use client';

import { useState } from 'react';
import PayoutRow from './payout-row';

export default function FinanceInterface({ queue, stats, actions }) {
  const [searchTerm, setSearchTerm] = useState('');

  // FILTER LOGIC
  const filteredData = queue.filter(item => {
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        item.name?.toLowerCase().includes(s) ||
        item.upi_id?.toLowerCase().includes(s) ||
        String(item.amount).includes(s)
      );
    }
    return true;
  });

  // --- STYLES ---
  const glassPanel = {
    background: '#0a0a0f', border: '1px solid #222', borderRadius: '16px', overflow: 'hidden',
    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)'
  };

  return (
    <div>
      {/* 1. STATS DECK */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '30px'}}>
        <StatCard label="TOTAL LIABILITY" value={`₹${stats.liability.toLocaleString()}`} sub={`${stats.count} Pending Payments`} color="#facc15" />
        <StatCard label="USER PAYOUTS" value={stats.userCount} sub="Direct Leads" color="#3b82f6" />
        <StatCard label="PROMOTER REQUESTS" value={stats.promoterCount} sub="Withdrawals" color="#a855f7" />
      </div>

      {/* 2. CONTROLS */}
      <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px'}}>
        <input 
          type="text" 
          placeholder="Search UPI, Name, or Amount..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: '#050505', border: '1px solid #222', borderRadius: '10px', 
            padding: '10px 16px', color: '#fff', fontSize: '13px', outline: 'none', width: '300px'
          }}
        />
      </div>

      {/* 3. DATA GRID */}
      <div style={glassPanel}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 2fr 1.5fr', // Added column for Type
          background: '#111', padding: '16px 24px', borderBottom: '1px solid #222',
          fontSize: '11px', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          <div>Timeline</div>
          <div>Beneficiary</div>
          <div>Type</div>
          <div>Banking Details</div>
          <div style={{textAlign: 'right'}}>Action</div>
        </div>

        <div>
          {filteredData.length > 0 ? (
            filteredData.map(item => (
              <PayoutRow 
                key={`${item.type}-${item.id}`} 
                item={item} 
                actions={actions} // Pass actions down
              />
            ))
          ) : (
            <div style={{padding: '60px', textAlign: 'center', color: '#444', fontSize: '13px'}}>
              ✅ All caught up! No pending payments.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{background: '#0a0a0f', border: '1px solid #222', borderRadius: '16px', padding: '20px'}}>
      <div style={{fontSize: '10px', fontWeight: '800', color: '#666', marginBottom: '8px', letterSpacing: '1px'}}>{label}</div>
      <div style={{fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '4px', letterSpacing: '-1px'}}>{value}</div>
      <div style={{fontSize: '11px', fontWeight: '600', color: color}}>{sub}</div>
    </div>
  );
}