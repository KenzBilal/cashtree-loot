'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Added for Server Refresh
import { formatDistanceToNow } from 'date-fns';

// --- MAIN INTERFACE COMPONENT ---
export default function LeadsInterface({ initialData, stats, updateStatusAction }) {
  const router = useRouter(); 
  const [leads, setLeads] = useState(initialData); // ✅ Use Local State for Instant UI Updates
  const [activeTab, setActiveTab] = useState('PENDING'); 
  const [searchTerm, setSearchTerm] = useState('');

  // --- HANDLE STATUS UPDATE (The Fix) ---
  const handleStatusUpdate = async (id, newStatus) => {
    // 1. Optimistic Update (Update UI Instantly)
    setLeads(currentLeads => 
      currentLeads.map(lead => 
        lead.id === id ? { ...lead, status: newStatus } : lead
      )
    );

    // 2. Call Server Action
    const result = await updateStatusAction(id, newStatus);
    
    if (!result.success) {
      alert("Error: " + result.error);
      // Revert if failed (Optional safety)
      router.refresh(); 
    } else {
      // 3. Sync with Server
      router.refresh(); 
    }
  };

  // FILTER LOGIC (Uses 'leads' state instead of 'initialData')
  const filteredData = leads.filter(item => {
    const isPending = item.status === 'Pending';
    
    if (activeTab === 'PENDING' && !isPending) return false;
    if (activeTab === 'HISTORY' && isPending) return false;

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        item.campaigns?.title?.toLowerCase().includes(s) ||
        item.accounts?.username?.toLowerCase().includes(s) ||
        JSON.stringify(item.customer_data)?.toLowerCase().includes(s)
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
            filteredData.map(lead => (
              <LeadRow 
                key={lead.id} 
                lead={lead} 
                onUpdate={handleStatusUpdate} // ✅ Pass the update handler
              />
            ))
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

// --- SUB-COMPONENTS ---

function LeadRow({ lead, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (status) => {
    if (!confirm(`Are you sure you want to ${status} this lead?`)) return;
    setLoading(true);
    await onUpdate(lead.id, status); // Call Parent Handler
    setLoading(false);
  };

  const statusColor = {
    Pending: '#facc15',
    Approved: '#00ff88',
    Rejected: '#ef4444'
  }[lead.status] || '#999';

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 2fr 1.5fr', 
      padding: '20px 24px', borderBottom: '1px solid #1a1a1a', alignItems: 'center',
      fontSize: '13px', color: '#ccc', opacity: loading ? 0.5 : 1
    }}>
      {/* 1. Time */}
      <div style={{color: '#666', fontSize: '12px'}}>
        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
      </div>

      {/* 2. Campaign */}
      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <span style={{fontWeight:'600', color:'#fff'}}>{lead.campaigns?.title || 'Unknown'}</span>
      </div>

      {/* 3. Promoter */}
      <div>
        <div style={{color:'#fff'}}>{lead.accounts?.username || 'Direct / Organic'}</div>
        <div style={{fontSize:'11px', color:'#555'}}>{lead.accounts?.phone}</div>
      </div>

      {/* 4. Data */}
      <div style={{fontFamily: 'monospace', background: '#050505', padding: '6px 10px', borderRadius: '6px', border: '1px solid #222', display: 'inline-block'}}>
        {lead.customer_data?.phone ? `${lead.customer_data.phone} / ${lead.customer_data.upi}` : 'No Data'}
      </div>

      {/* 5. Actions */}
      <div style={{textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
        {lead.status === 'Pending' ? (
          <>
            <button 
              onClick={() => handleAction('Rejected')}
              disabled={loading}
              style={{
                background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer'
              }}
            >
              REJECT
            </button>
            <button 
              onClick={() => handleAction('Approved')}
              disabled={loading}
              style={{
                background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.2)',
                padding: '6px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer'
              }}
            >
              APPROVE
            </button>
          </>
        ) : (
          <span style={{
            color: statusColor, fontWeight: '800', fontSize: '11px', textTransform: 'uppercase',
            background: `${statusColor}10`, padding: '4px 10px', borderRadius: '6px', border: `1px solid ${statusColor}30`
          }}>
            {lead.status}
          </span>
        )}
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