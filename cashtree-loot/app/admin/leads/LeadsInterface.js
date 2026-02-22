'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Search, Clock, TrendingUp, DollarSign, XCircle, CheckCircle2, X, Check, Filter } from 'lucide-react';

const NEON = '#00ff88';

export default function LeadsInterface({ initialData, stats, updateStatusAction }) {
  const router = useRouter();
  const [leads, setLeads]           = useState(initialData);
  const [activeTab, setActiveTab]   = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const openConfirmModal = (id, status) => setConfirmModal({ id, status });

  const executeStatusUpdate = async () => {
    if (!confirmModal) return;
    setIsProcessing(true);
    const { id, status } = confirmModal;
    setLeads(cur => cur.map(l => l.id === id ? { ...l, status } : l));
    const result = await updateStatusAction(id, status);
    if (!result.success) {
      alert('System Error: ' + result.error);
      router.refresh();
    } else {
      router.refresh();
    }
    setIsProcessing(false);
    setConfirmModal(null);
  };

  const filteredData = leads.filter(item => {
    const isPending = item.status === 'pending';
    if (activeTab === 'PENDING' && !isPending) return false;
    if (activeTab === 'HISTORY' && isPending)  return false;
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

  const isApproving = confirmModal?.status === 'approved';

  return (
    <div style={{ paddingBottom: '100px' }}>
      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn   { from { transform:scale(0.94); opacity:0; } to { transform:scale(1); opacity:1; } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        .leads-search:focus { border-color: #333 !important; }
        .leads-search::placeholder { color: #333; }
        .lead-card:hover { border-color: #2a2a2a !important; }
        .tab-btn:hover { color: #fff !important; }
        .action-btn-reject:hover  { background: rgba(239,68,68,0.15) !important; }
        .action-btn-approve:hover { background: rgba(0,255,136,0.15) !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '20px',
        marginBottom: '28px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: '900',
            color: '#fff',
            margin: '0 0 4px 0',
            letterSpacing: '-0.8px',
          }}>
            Lead <span style={{ color: '#444' }}>Approvals</span>
          </h1>
          <p style={{
            margin: 0, fontSize: '11px', fontWeight: '700',
            color: '#444', textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            Review &amp; Process Submissions
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 'clamp(200px, 100%, 340px)' }}>
          <Search size={14} style={{
            position: 'absolute', left: '13px', top: '50%',
            transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search campaign, promoter, data…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="leads-search"
            style={{
              width: '100%', background: '#0a0a0a',
              border: '1px solid #1e1e1e', borderRadius: '12px',
              padding: '12px 14px 12px 36px',
              color: '#fff', fontSize: '13px', outline: 'none',
              fontWeight: '600', transition: 'border-color 0.18s',
            }}
          />
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        marginBottom: '28px',
      }}>
        <StatCard icon={<Clock size={14}/>}         label="Pending"  value={stats.pendingCount}                        sub="Action required"   color="#facc15" />
        <StatCard icon={<DollarSign size={14}/>}    label="Liability" value={`₹${stats.pendingValue.toLocaleString()}`} sub="Pending payouts"  color="#fff" />
        <StatCard icon={<CheckCircle2 size={14}/>}  label="Approved" value={stats.approvedCount}                       sub="Successful leads"  color={NEON} />
        <StatCard icon={<XCircle size={14}/>}       label="Rejected" value={stats.rejectedCount}                       sub="Filtered / fraud"  color="#ef4444" />
      </div>

      {/* ── TABS ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex', gap: '4px',
          background: '#0a0a0a', padding: '4px',
          borderRadius: '12px', border: '1px solid #1a1a1a',
        }}>
          {[
            { key: 'PENDING', label: '⚡ Pending Queue' },
            { key: 'HISTORY', label: '🗄 Archives' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className="tab-btn"
              onClick={() => setActiveTab(key)}
              style={{
                background: activeTab === key ? '#1e1e1e' : 'transparent',
                color: activeTab === key ? '#fff' : '#555',
                border: 'none', padding: '9px 16px',
                borderRadius: '9px', fontSize: '10px',
                fontWeight: '800', cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                transition: 'all 0.18s', whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '10px', color: '#333', fontWeight: '700' }}>
          {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── LEAD CARDS ── */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {filteredData.length > 0 ? (
          filteredData.map((lead, i) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onAction={openConfirmModal}
              delay={Math.min(i * 25, 300)}
            />
          ))
        ) : (
          <div style={{
            padding: '60px 20px', textAlign: 'center',
            border: '1px dashed #1a1a1a', borderRadius: '16px',
          }}>
            <Filter size={32} color="#222" style={{ marginBottom: '12px' }} />
            <div style={{ color: '#444', fontSize: '13px', fontWeight: '700' }}>
              {activeTab === 'PENDING' ? '✨ All clear — no pending leads.' : 'No history found.'}
            </div>
          </div>
        )}
      </div>

      {/* ── CONFIRMATION MODAL ── */}
      {confirmModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#0a0a0a',
            border: `1px solid ${isApproving ? 'rgba(0,255,136,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: '24px',
            width: '100%', maxWidth: '380px',
            padding: '32px 28px',
            textAlign: 'center',
            boxShadow: `0 40px 80px rgba(0,0,0,0.8), 0 0 60px ${isApproving ? 'rgba(0,255,136,0.05)' : 'rgba(239,68,68,0.05)'}`,
            animation: 'popIn 0.2s ease-out',
          }}>
            {/* Icon */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              margin: '0 auto 20px',
              background: isApproving ? 'rgba(0,255,136,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${isApproving ? 'rgba(0,255,136,0.25)' : 'rgba(239,68,68,0.25)'}`,
              color: isApproving ? NEON : '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isApproving ? <Check size={28} strokeWidth={2.5} /> : <X size={28} strokeWidth={2.5} />}
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
              {isApproving ? 'Approve Lead?' : 'Reject Lead?'}
            </h3>
            <p style={{ color: '#555', margin: '0 0 28px', fontSize: '13px', lineHeight: '1.6' }}>
              {isApproving
                ? "This will instantly credit the payout to the user's wallet."
                : 'This will mark the lead as invalid. No payout will be given.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  padding: '13px', borderRadius: '12px',
                  background: 'transparent', border: '1px solid #222',
                  color: '#666', fontWeight: '800', cursor: 'pointer',
                  fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                  transition: 'border-color 0.18s, color 0.18s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeStatusUpdate}
                disabled={isProcessing}
                style={{
                  padding: '13px', borderRadius: '12px', border: 'none',
                  background: isApproving ? NEON : '#ef4444',
                  color: isApproving ? '#000' : '#fff',
                  fontWeight: '900', cursor: isProcessing ? 'wait' : 'pointer',
                  fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                  opacity: isProcessing ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'opacity 0.18s',
                }}
              >
                {isProcessing ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                      style={{ animation: 'spin 0.8s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Processing…
                  </>
                ) : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LEAD CARD ──
function LeadCard({ lead, onAction, delay }) {
  const isPending = lead.status === 'pending';

  const statusMeta = {
    Pending:  { color: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.2)'  },
    Approved: { color: '#00ff88', bg: 'rgba(0,255,136,0.08)',   border: 'rgba(0,255,136,0.2)'   },
    Rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
  }[lead.status] || { color: '#888', bg: '#111', border: '#222' };

  const submittedData = lead.customer_data?.phone
    || lead.customer_data?.upi
    || JSON.stringify(lead.customer_data);

  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(lead.created_at), { addSuffix: true }); }
    catch { return '—'; }
  })();

  return (
    <div
      className="lead-card"
      style={{
        background: '#080808',
        border: '1px solid #1a1a1a',
        borderRadius: '16px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        transition: 'border-color 0.2s',
        animation: `fadeIn 0.3s ease-out ${delay}ms both`,
      }}
    >
      {/* Top row: campaign title + status badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', marginBottom: '5px' }}>
            {lead.campaigns?.title || 'Unknown Campaign'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: '#555', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} /> {timeAgo}
            </span>
           
            
            {lead.accounts?.username && (
              <span style={{ color: '#666', fontWeight: '600' }}>
                via {lead.accounts.username}
              </span>
            )}
            {lead.payout && (
              <span style={{ color: '#facc15', fontWeight: '700' }}>
                ₹{parseFloat(lead.payout).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Status badge (non-pending) */}
        {!isPending && (
          <span style={{
            fontSize: '9px', fontWeight: '900',
            padding: '5px 10px', borderRadius: '8px',
            background: statusMeta.bg,
            border: `1px solid ${statusMeta.border}`,
            color: statusMeta.color,
            textTransform: 'uppercase', letterSpacing: '0.5px',
            flexShrink: 0,
          }}>
            {lead.status}
          </span>
        )}
      </div>

      {/* Data row */}
<div style={{
  background: '#000',
  border: '1px solid #141414',
  borderRadius: '10px',
  padding: '10px 14px',
}}>
  {lead.user_name && (
    <div style={{ 
      fontSize: '12px', color: '#888', fontWeight: '700', 
      marginBottom: '6px', paddingBottom: '6px',
      borderBottom: '1px solid #141414'
    }}>
      👤 {lead.user_name}
    </div>
  )}
  <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '5px' }}>
    Submitted Data
  </div>
  <div style={{ fontFamily: 'monospace', color: '#00ff88', fontSize: '13px', fontWeight: '600', wordBreak: 'break-all' }}>
    {submittedData}
  </div>
</div>

      {/* Action buttons (pending only) */}
      {isPending && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="action-btn-reject"
            onClick={() => onAction(lead.id, 'rejected')}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '10px',
              background: 'rgba(239,68,68,0.06)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)',
              fontSize: '10px', fontWeight: '900',
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.8px',
              transition: 'background 0.18s',
            }}
          >
            Reject
          </button>
          <button
            className="action-btn-approve"
            onClick={() => onAction(lead.id, 'approved')}
            style={{
              flex: 2,
              padding: '11px',
              borderRadius: '10px',
              background: 'rgba(0,255,136,0.06)',
              color: '#00ff88',
              border: '1px solid rgba(0,255,136,0.2)',
              fontSize: '10px', fontWeight: '900',
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.8px',
              transition: 'background 0.18s',
              boxShadow: '0 0 16px rgba(0,255,136,0.08)',
            }}
          >
            ✓ Approve
          </button>
        </div>
      )}
    </div>
  );
}

// ── STAT CARD ──
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid #1a1a1a',
      borderRadius: '16px',
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
      animation: 'fadeIn 0.4s ease-out',
    }}>
      <div style={{ position: 'absolute', top: '14px', right: '14px', color, opacity: 0.12 }}>{icon}</div>
      <div style={{ fontSize: '9px', fontWeight: '800', color: '#444', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: '900', color: '#fff', marginBottom: '4px', letterSpacing: '-0.5px' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', fontWeight: '600', color }}>{sub}</div>
    </div>
  );
}