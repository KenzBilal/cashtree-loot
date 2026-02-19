'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Mail, Search, CheckCircle2, Trash2, RefreshCw,
  ShieldAlert, Building, Clock, AlertTriangle
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const NEON = '#00ff88';
const FILTERS = ['all', 'unread', 'partnership'];

export default function InquiriesPage() {
  const [inquiries, setInquiries]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => { fetchInquiries(); }, []);

  async function fetchInquiries() {
    setLoading(true);
    const { data } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setInquiries(data);
    setLoading(false);
  }

  const markAsRead = async (id) => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'read' } : i));
    await supabase.from('contact_inquiries').update({ status: 'read' }).eq('id', id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setInquiries(prev => prev.filter(i => i.id !== deleteTarget));
    await supabase.from('contact_inquiries').delete().eq('id', deleteTarget);
    setDeleteTarget(null);
    setDeleting(false);
  };

  const filteredData = inquiries.filter(item => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.name?.toLowerCase().includes(term) ||
      item.email?.toLowerCase().includes(term) ||
      item.message?.toLowerCase().includes(term) ||
      item.company?.toLowerCase().includes(term);
    const matchesFilter =
      filter === 'all'         ? true :
      filter === 'unread'      ? item.status !== 'read' :
      filter === 'partnership' ? item.category?.toLowerCase().includes('partner') : true;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = inquiries.filter(i => i.status !== 'read').length;

  return (
    <div style={{ paddingBottom: '100px' }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn  { from { transform:scale(0.94); opacity:0; } to { transform:scale(1); opacity:1; } }
        @keyframes spin   { to { transform:rotate(360deg); } }
        .inq-search:focus { border-color: #333 !important; }
        .inq-search::placeholder { color: #333; }
        .inq-card { transition: border-color 0.2s; }
        .inq-card:hover { border-color: #2a2a2a !important; }
        .filter-pill:hover { color: #fff !important; }
        .btn-read:hover   { background: #e0e0e0 !important; }
        .btn-delete:hover { background: rgba(239,68,68,0.15) !important; }
        .btn-refresh:hover { border-color: #333 !important; color: #aaa !important; }
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
            fontWeight: '900', color: '#fff',
            margin: '0 0 4px 0', letterSpacing: '-0.8px',
          }}>
            Inquiries <span style={{ color: '#444' }}>&amp; Support</span>
          </h1>
          <p style={{
            margin: 0, fontSize: '11px', fontWeight: '700',
            color: unreadCount > 0 ? NEON : '#444',
            textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            {unreadCount > 0 ? `${unreadCount} unread ticket${unreadCount !== 1 ? 's' : ''}` : 'All tickets read'}
          </p>
        </div>

        <button
          className="btn-refresh"
          onClick={fetchInquiries}
          style={{
            background: '#0a0a0a', border: '1px solid #1e1e1e',
            color: '#555', padding: '11px 18px', borderRadius: '12px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '11px', fontWeight: '800',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            transition: 'border-color 0.18s, color 0.18s',
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ── CONTROLS ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        gap: '10px', alignItems: 'center',
        marginBottom: '24px',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 0 }}>
          <Search size={14} style={{
            position: 'absolute', left: '13px', top: '50%',
            transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search tickets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="inq-search"
            style={{
              width: '100%', background: '#0a0a0a',
              border: '1px solid #1e1e1e', borderRadius: '12px',
              padding: '12px 14px 12px 36px',
              color: '#fff', fontSize: '13px', outline: 'none',
              fontWeight: '600', transition: 'border-color 0.18s',
            }}
          />
        </div>

        {/* Filter pills */}
        <div style={{
          display: 'flex', gap: '4px',
          background: '#0a0a0a', padding: '4px',
          borderRadius: '12px', border: '1px solid #1a1a1a',
          flexShrink: 0,
        }}>
          {FILTERS.map(f => (
            <button
              key={f}
              className="filter-pill"
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#1e1e1e' : 'transparent',
                color: filter === f ? '#fff' : '#555',
                border: 'none', padding: '8px 14px',
                borderRadius: '9px', fontSize: '10px',
                fontWeight: '800', cursor: 'pointer',
                textTransform: 'capitalize', letterSpacing: '0.5px',
                transition: 'all 0.18s',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── TICKET LIST ── */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth="2.5" strokeLinecap="round"
              style={{ animation: 'spin 0.8s linear infinite', display: 'block', margin: '0 auto 12px' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <div style={{ color: '#444', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Loading tickets…
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{
            padding: '60px 20px', textAlign: 'center',
            border: '1px dashed #1a1a1a', borderRadius: '16px',
          }}>
            <ShieldAlert size={32} color="#222" style={{ marginBottom: '12px' }} />
            <div style={{ color: '#444', fontSize: '13px', fontWeight: '700' }}>
              No tickets found.
            </div>
          </div>
        ) : (
          filteredData.map((item, i) => (
            <InquiryCard
              key={item.id}
              item={item}
              delay={Math.min(i * 25, 300)}
              onMarkRead={markAsRead}
              onDelete={() => setDeleteTarget(item.id)}
            />
          ))
        )}
      </div>

      {/* Count */}
      {!loading && filteredData.length > 0 && (
        <div style={{ marginTop: '14px', textAlign: 'right', fontSize: '10px', color: '#333', fontWeight: '700' }}>
          {filteredData.length} ticket{filteredData.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteTarget && (
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
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '24px',
            width: '100%', maxWidth: '360px',
            padding: '32px 28px', textAlign: 'center',
            boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(239,68,68,0.05)',
            animation: 'popIn 0.2s ease-out',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              margin: '0 auto 20px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={28} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
              Delete Ticket?
            </h3>
            <p style={{ color: '#555', margin: '0 0 28px', fontSize: '13px', lineHeight: '1.6' }}>
              This action cannot be undone. The inquiry will be permanently removed.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: '13px', borderRadius: '12px',
                  background: 'transparent', border: '1px solid #222',
                  color: '#666', fontWeight: '800', cursor: 'pointer',
                  fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  padding: '13px', borderRadius: '12px', border: 'none',
                  background: '#ef4444', color: '#fff',
                  fontWeight: '900', cursor: deleting ? 'wait' : 'pointer',
                  fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                  opacity: deleting ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'opacity 0.18s',
                }}
              >
                {deleting ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : <Trash2 size={13} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── INQUIRY CARD ──
function InquiryCard({ item, delay, onMarkRead, onDelete }) {
  const isUnread = item.status !== 'read';

  const timeStr = new Date(item.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div
      className="inq-card"
      style={{
        background: isUnread ? 'rgba(0,255,136,0.02)' : '#080808',
        border: isUnread ? '1px solid rgba(0,255,136,0.15)' : '1px solid #1a1a1a',
        borderRadius: '16px',
        padding: '18px 20px',
        position: 'relative',
        animation: `fadeIn 0.3s ease-out ${delay}ms both`,
        boxShadow: isUnread ? '0 0 30px -10px rgba(0,255,136,0.08)' : 'none',
      }}
    >
      {/* NEW badge */}
      {isUnread && (
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          background: NEON, color: '#000',
          fontSize: '8px', fontWeight: '900',
          padding: '3px 8px', borderRadius: '6px', letterSpacing: '1px',
        }}>
          NEW
        </div>
      )}

      {/* Avatar + name + meta */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
          background: isUnread ? 'rgba(0,255,136,0.08)' : '#111',
          border: isUnread ? '1px solid rgba(0,255,136,0.2)' : '1px solid #1e1e1e',
          color: isUnread ? NEON : '#555',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '900', fontSize: '16px',
        }}>
          {item.name?.charAt(0)?.toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: '#fff', fontWeight: '800', fontSize: '14px' }}>{item.name}</span>
            <span style={{
              fontSize: '9px', fontWeight: '800',
              background: '#111', border: '1px solid #1e1e1e',
              color: '#555', padding: '3px 8px', borderRadius: '6px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {item.category || 'General'}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <MetaChip icon={<Mail size={10} />}     text={item.email} />
            {item.company && <MetaChip icon={<Building size={10} />} text={item.company} />}
            <MetaChip icon={<Clock size={10} />}    text={timeStr} />
          </div>
        </div>
      </div>

      {/* Message */}
      <div style={{
        background: '#000', border: '1px solid #141414',
        borderRadius: '10px', padding: '14px 16px',
        color: '#999', lineHeight: '1.65', fontSize: '13px',
        marginBottom: '14px', wordBreak: 'break-word',
      }}>
        {item.message}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {isUnread && (
          <button
            className="btn-read"
            onClick={() => onMarkRead(item.id)}
            style={{
              background: '#fff', color: '#000', border: 'none',
              padding: '9px 16px', borderRadius: '10px',
              cursor: 'pointer', fontWeight: '800', fontSize: '11px',
              display: 'flex', alignItems: 'center', gap: '6px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              transition: 'background 0.18s',
            }}
          >
            <CheckCircle2 size={13} /> Mark Read
          </button>
        )}
        <button
          className="btn-delete"
          onClick={onDelete}
          style={{
            background: 'rgba(239,68,68,0.06)', color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.2)',
            padding: '9px 16px', borderRadius: '10px',
            cursor: 'pointer', fontWeight: '800', fontSize: '11px',
            display: 'flex', alignItems: 'center', gap: '6px',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            transition: 'background 0.18s',
          }}
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

// ── META CHIP ──
function MetaChip({ icon, text }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '11px', color: '#555', fontWeight: '600',
    }}>
      <span style={{ color: '#444', display: 'flex' }}>{icon}</span>
      <span style={{ wordBreak: 'break-all' }}>{text}</span>
    </span>
  );
}