'use client';

import { useState } from 'react';
import LeadRow from './lead-row';

export default function LeadsInterface({ initialData, stats }) {
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING | HISTORY
  const [searchTerm, setSearchTerm] = useState('');

  // FILTER LOGIC
  const filteredData = initialData.filter(item => {
    // 1. Tab Filter
    const isPending = item.status === 'pending';
    if (activeTab === 'PENDING' && !isPending) return false;
    if (activeTab === 'HISTORY' && isPending) return false;

    // 2. Search Filter
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        item.campaigns?.title?.toLowerCase().includes(s) ||
        item.accounts?.username?.toLowerCase().includes(s) ||
        item.customer_data?.toLowerCase().includes(s)
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
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px'}}>
        <StatCard label="PENDING REVIEW" value={stats.pendingCount} sub="Action Required" color="#facc15" />
        <StatCard label="LIABILITY" value={`₹${stats.pendingValue.toLocaleString()}`} sub="Pending Payouts" color="#fff" />
        <StatCard label="APPROVED" value={stats.approvedCount} sub="Successful Leads" color="#00ff88" />
        <StatCard label="REJECTED" value={stats.rejectedCount} sub="Filtered / Fraud" color="#ef4444" />
      </div>

      {/* 2. CONTROLS */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <div style={{display: 'flex', gap: '8px', background: '#111', padding: '4px', borderRadius: '12px'}}>
           <TabButton label="⚡ PENDING QUEUE" active={activeTab === 'PENDING'} onClick={() => setActiveTab('PENDING')} />
           <TabButton label="🗄️ ARCHIVES" active={activeTab === 'HISTORY'} onClick={() => setActiveTab('HISTORY')} />
        </div>

        <input 
          type="text" 
          placeholder="Search Campaign, Promoter, or Data..." 
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
          display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 2fr 1.5fr', 
          background: '#111', padding: '16px 24px', borderBottom: '1px solid #222',
          fontSize: '11px', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          <div>Timestamp</div>
          <div>Campaign</div>
          <div>Promoter</div>
          <div>Submitted Data</div>
          <div style={{textAlign: 'right'}}>Validation</div>
        </div>

        <div>
          {filteredData.length > 0 ? (
            filteredData.map(lead => <LeadRow key={lead.id} lead={lead} />)
          ) : (
            <div style={{padding: '60px', textAlign: 'center', color: '#444', fontSize: '13px'}}>
               {activeTab === 'PENDING' ? '✨ All clear! No pending leads.' : 'No history found.'}
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

function TabButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? '#222' : 'transparent', color: active ? '#fff' : '#666',
      border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s'
    }}>
      {label}
    </button>
  );
}