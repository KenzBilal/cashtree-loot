'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search, Filter, CheckCircle2, XCircle, Clock, 
  AlertTriangle, TrendingUp, DollarSign, X, Check
} from 'lucide-react';

export default function LeadsInterface({ initialData, stats, updateStatusAction }) {
  const router = useRouter(); 
  const [leads, setLeads] = useState(initialData); 
  const [activeTab, setActiveTab] = useState('PENDING'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- CUSTOM MODAL STATE ---
  const [confirmModal, setConfirmModal] = useState(null); // { id, status }
  const [isProcessing, setIsProcessing] = useState(false);

  // --- ACTIONS ---
  const openConfirmModal = (id, status) => {
    setConfirmModal({ id, status });
  };

  const executeStatusUpdate = async () => {
    if (!confirmModal) return;
    
    setIsProcessing(true);
    const { id, status } = confirmModal;

    // 1. Optimistic Update
    setLeads(current => current.map(l => l.id === id ? { ...l, status } : l));

    // 2. Server Action
    const result = await updateStatusAction(id, status);

    if (!result.success) {
      // Revert on failure
      alert("System Error: " + result.error); // You can replace this with a toast if you want
      router.refresh();
    } else {
      router.refresh();
    }
    
    setIsProcessing(false);
    setConfirmModal(null);
  };

  // --- FILTER LOGIC ---
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

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', color: 'white', minHeight: '100vh', padding: '40px', background: '#050505' }}>
      
      {/* 1. HEADER & STATS */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 color="#00ff88" /> Lead Approvals
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <StatCard icon={<Clock size={20}/>} label="PENDING REVIEW" value={stats.pendingCount} sub="Action Required" color="#facc15" />
          <StatCard icon={<DollarSign size={20}/>} label="LIABILITY" value={`₹${stats.pendingValue.toLocaleString()}`} sub="Pending Payouts" color="#fff" />
          <StatCard icon={<TrendingUp size={20}/>} label="APPROVED" value={stats.approvedCount} sub="Successful Leads" color="#00ff88" />
          <StatCard icon={<XCircle size={20}/>} label="REJECTED" value={stats.rejectedCount} sub="Filtered / Fraud" color="#ef4444" />
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div style={{ 
        background: '#0a0a0f', border: '1px solid #222', borderRadius: '16px', padding: '16px', 
        marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: '#000', padding: '4px', borderRadius: '10px', border: '1px solid #222' }}>
           <TabButton label="⚡ PENDING QUEUE" active={activeTab === 'PENDING'} onClick={() => setActiveTab('PENDING')} />
           <TabButton label="🗄️ ARCHIVES" active={activeTab === 'HISTORY'} onClick={() => setActiveTab('HISTORY')} />
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input 
            type="text" 
            placeholder="Search Campaign, Promoter, or Data..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', background: '#000', border: '1px solid #333', borderRadius: '8px', 
              padding: '10px 12px 10px 36px', color: '#fff', fontSize: '13px', outline: 'none',
              transition: 'border 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00ff88'}
            onBlur={(e) => e.target.style.borderColor = '#333'}
          />
        </div>
      </div>

      {/* 3. DATA GRID */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {filteredData.length > 0 ? (
          filteredData.map(lead => (
            <LeadRow 
              key={lead.id} 
              lead={lead} 
              onAction={openConfirmModal} // Pass modal trigger
            />
          ))
        ) : (
          <div style={{ padding: '80px', textAlign: 'center', border: '1px dashed #333', borderRadius: '16px', color: '#666' }}>
            <div style={{ marginBottom: '16px', opacity: 0.3 }}><Filter size={48} className="mx-auto" /></div>
            {activeTab === 'PENDING' ? '✨ All clear! No pending leads.' : 'No history found.'}
          </div>
        )}
      </div>

      {/* 4. CUSTOM CONFIRMATION MODAL */}
      {confirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#0a0a0f', border: '1px solid #333', borderRadius: '20px', 
            width: '90%', maxWidth: '400px', padding: '30px', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)', animation: 'popIn 0.2s ease-out'
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px',
              background: confirmModal.status === 'Approved' ? 'rgba(0,255,136,0.1)' : 'rgba(239,68,68,0.1)',
              color: confirmModal.status === 'Approved' ? '#00ff88' : '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid currentColor'
            }}>
              {confirmModal.status === 'Approved' ? <Check size={32} /> : <X size={32} />}
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '10px' }}>
              {confirmModal.status === 'Approved' ? 'Approve Lead?' : 'Reject Lead?'}
            </h3>
            <p style={{ color: '#888', marginBottom: '30px', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {confirmModal.status === 'Approved' 
                ? 'This will instantly credit the payout to the user\'s wallet.' 
                : 'This will mark the lead as invalid. No payout will be given.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <button 
                onClick={() => setConfirmModal(null)}
                style={{
                  padding: '12px', borderRadius: '10px', background: 'transparent', 
                  border: '1px solid #333', color: '#ccc', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={executeStatusUpdate}
                disabled={isProcessing}
                style={{
                  padding: '12px', borderRadius: '10px', border: 'none',
                  background: confirmModal.status === 'Approved' ? '#00ff88' : '#ef4444',
                  color: confirmModal.status === 'Approved' ? '#000' : '#fff', 
                  fontWeight: '800', cursor: 'pointer',
                  opacity: isProcessing ? 0.7 : 1
                }}
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function LeadRow({ lead, onAction }) {
  const statusConfig = {
    Pending: { color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)' },
    Approved: { color: '#00ff88', bg: 'rgba(0, 255, 136, 0.1)' },
    Rejected: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
  }[lead.status] || { color: '#888', bg: '#222' };

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 2fr 1fr', gap: '20px',
      background: '#0a0a0f', border: '1px solid #222', borderRadius: '12px', padding: '20px',
      alignItems: 'center', transition: 'border 0.2s', position: 'relative'
    }}>
      {/* LEFT: Info */}
      <div>
        <div style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>{lead.campaigns?.title || 'Unknown'}</div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '12px', color: '#666' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
          </span>
          <span>•</span>
          <span>{lead.accounts?.username}</span>
        </div>
      </div>

      {/* MIDDLE: Data */}
      <div style={{ background: '#000', padding: '10px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
        <div style={{ fontSize: '11px', color: '#444', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Submitted Data</div>
        <div style={{ fontFamily: 'monospace', color: '#00ff88', fontSize: '13px' }}>
          {lead.customer_data?.phone || lead.customer_data?.upi || JSON.stringify(lead.customer_data)}
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        {lead.status === 'Pending' ? (
          <>
            <button 
              onClick={() => onAction(lead.id, 'Rejected')}
              style={{
                background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                transition: '0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.05)'}
            >
              REJECT
            </button>
            <button 
              onClick={() => onAction(lead.id, 'Approved')}
              style={{
                background: 'rgba(0, 255, 136, 0.05)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.2)',
                padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                transition: '0.2s', boxShadow: '0 0 15px rgba(0, 255, 136, 0.05)'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(0, 255, 136, 0.2)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(0, 255, 136, 0.05)'}
            >
              APPROVE
            </button>
          </>
        ) : (
          <span style={{
            color: statusConfig.color, background: statusConfig.bg,
            padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800',
            border: `1px solid ${statusConfig.color}40`, textTransform: 'uppercase'
          }}>
            {lead.status}
          </span>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: '16px', padding: '20px',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.1, color: color }}>{icon}</div>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', marginBottom: '8px', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', fontWeight: '500', color: color }}>{sub}</div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? '#222' : 'transparent', color: active ? '#fff' : '#666',
      border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', 
      cursor: 'pointer', transition: 'all 0.2s'
    }}>
      {label}
    </button>
  );
}