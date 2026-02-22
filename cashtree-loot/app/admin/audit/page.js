'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const NEON = '#00ff88';

// ── Action metadata — keys match exactly what DB stores (lowercase) ──
const ACTION_META = {
  // Lead actions
  approve_lead:      { color: '#facc15', label: 'APPROVE LEAD',  category: 'FINANCE' },
  reject_lead:       { color: '#ef4444', label: 'REJECT LEAD',   category: 'FINANCE' },
  // Withdrawal actions
  approve_withdrawal:{ color: '#facc15', label: 'PAYOUT',        category: 'FINANCE' },
  reject_withdrawal: { color: '#ef4444', label: 'REJ. WITHDRAW', category: 'FINANCE' },
  // Account actions
  freeze_account:    { color: '#ef4444', label: 'FREEZE',        category: 'SYSTEM'  },
  unfreeze_account:  { color: NEON,      label: 'UNFREEZE',      category: 'SYSTEM'  },
  delete_account:    { color: '#ef4444', label: 'DELETE',        category: 'SYSTEM'  },
  update_role:       { color: '#3b82f6', label: 'ROLE CHANGE',   category: 'SYSTEM'  },
  update_upi:        { color: '#3b82f6', label: 'UPI UPDATE',    category: 'SYSTEM'  },
  reset_password:    { color: '#3b82f6', label: 'RESET PWD',     category: 'SYSTEM'  },
  reset_balance:     { color: '#ef4444', label: 'RESET BAL',     category: 'FINANCE' },
  manual_credit:     { color: NEON,      label: 'CREDIT',        category: 'FINANCE' },
  manual_deduction:  { color: '#ef4444', label: 'DEDUCT',        category: 'FINANCE' },
  // Auth actions
  login:             { color: '#3b82f6', label: 'LOGIN',         category: 'AUTH'    },
  logout:            { color: '#888',    label: 'LOGOUT',        category: 'AUTH'    },
  signup:            { color: NEON,      label: 'SIGNUP',        category: 'AUTH'    },
  // System actions
  settings_update:   { color: '#3b82f6', label: 'SETTINGS',      category: 'SYSTEM'  },
  campaign_create:   { color: NEON,      label: 'CAMPAIGN+',     category: 'SYSTEM'  },
  campaign_update:   { color: '#3b82f6', label: 'CAMPAIGN~',     category: 'SYSTEM'  },
  campaign_delete:   { color: '#ef4444', label: 'CAMPAIGN-',     category: 'SYSTEM'  },
};

const getActionMeta = (action) =>
  ACTION_META[action] ?? { color: '#555', label: action?.toUpperCase() ?? '?', category: 'OTHER' };

const FILTERS = ['ALL', 'AUTH', 'FINANCE', 'SYSTEM'];

const matchesFilter = (log, filter) => {
  if (filter === 'ALL') return true;
  return getActionMeta(log.action).category === filter;
};

// ── Export logs as CSV ──
function exportCSV(logs) {
  const headers = ['id','created_at','action','actor_id','actor_role','actor_username','target_type','target_id','ip_address','metadata'];
  const rows = logs.map(l => headers.map(h => {
    const v = h === 'metadata' ? JSON.stringify(l[h] ?? '') : (l[h] ?? '');
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AuditPage() {
  const [logs, setLogs]         = useState([]);
  const [actors, setActors]     = useState({}); // { uuid: username }
  const [loading, setLoading]   = useState(true);
  const [authed, setAuthed]     = useState(null); // null=checking, false=denied, true=ok
  const [filter, setFilter]     = useState('ALL');
  const [search, setSearch]     = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [realtime, setRealtime] = useState(true);

  // ── Session & role guard ──
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthed(false); return; }
      const { data: account } = await supabase
        .from('accounts')
        .select('role')
        .eq('id', session.user.id)
        .single();
      setAuthed(account?.role === 'admin');
    })();
  }, []);

  // ── Fetch actor usernames for display ──
  const fetchActors = useCallback(async (logList) => {
    const ids = [...new Set(logList.map(l => l.actor_id).filter(Boolean))];
    if (!ids.length) return;
    const { data } = await supabase
      .from('accounts')
      .select('id, username')
      .in('id', ids);
    if (data) {
      setActors(prev => ({
        ...prev,
        ...Object.fromEntries(data.map(a => [a.id, a.username]))
      }));
    }
  }, []);

  // ── Fetch logs ──
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo)   query = query.lte('created_at', dateTo + 'T23:59:59');

    const { data } = await query;
    if (data) {
      setLogs(data);
      fetchActors(data);
    }
    setLoading(false);
  }, [dateFrom, dateTo, fetchActors]);

  // ── Initial fetch + realtime subscription ──
  useEffect(() => {
    if (!authed) return;
    fetchLogs();

    let channel;
    if (realtime) {
      channel = supabase
        .channel('audit_realtime')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
        }, (payload) => {
          setLogs(prev => [payload.new, ...prev]);
          fetchActors([payload.new]);
        })
        .subscribe();
    }
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [authed, realtime, fetchLogs]);

  // ── Refetch when date filters change ──
  useEffect(() => {
    if (authed) fetchLogs();
  }, [dateFrom, dateTo, authed, fetchLogs]);

  // ── Client-side filtering ──
  const filtered = logs.filter(l => {
    if (!matchesFilter(l, filter)) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const username = actors[l.actor_id]?.toLowerCase() ?? '';
      return (
        l.action?.toLowerCase().includes(s) ||
        l.target_type?.toLowerCase().includes(s) ||
        l.target_id?.toLowerCase().includes(s) ||
        l.actor_id?.toLowerCase().includes(s) ||
        l.ip_address?.toLowerCase().includes(s) ||
        username.includes(s)
      );
    }
    return true;
  });

  // ── Guards ──
  if (authed === null) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spinner />
    </div>
  );

  if (authed === false) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444', fontSize: '14px', fontWeight: '700' }}>
      Access denied. Admin only.
    </div>
  );

  return (
    <div style={{ paddingBottom: '100px' }}>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .audit-row:hover { background: #080808 !important; }
        .filter-btn:hover { color: #fff !important; }
        .audit-input { background: #000; border: 1px solid #1e1e1e; border-radius: 10px; padding: 9px 13px; color: #fff; font-size: 12px; font-weight: 600; outline: none; font-family: inherit; transition: border-color 0.18s; }
        .audit-input::placeholder { color: #333; }
        .audit-input:focus { border-color: #2e2e2e; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'flex-end', gap: '16px', marginBottom: '24px',
        paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(24px,4vw,32px)', fontWeight: '900', color: '#fff', margin: '0 0 10px 0', letterSpacing: '-0.8px' }}>
            System <span style={{ color: '#444' }}>Audit</span>
          </h1>
          {/* Live toggle */}
          <div
            onClick={() => setRealtime(r => !r)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              padding: '6px 12px',
              background: realtime ? 'rgba(0,255,136,0.06)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${realtime ? 'rgba(0,255,136,0.2)' : '#1e1e1e'}`,
              borderRadius: '20px', transition: 'all 0.25s',
            }}
          >
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: realtime ? NEON : '#333',
              animation: realtime ? 'pulse 2s infinite' : 'none',
              transition: 'background 0.3s',
            }} />
            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: realtime ? NEON : '#555' }}>
              {realtime ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Export + filter pills */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportCSV(filtered)}
            style={{
              padding: '8px 14px', borderRadius: '10px', border: '1px solid #1e1e1e',
              background: 'transparent', color: '#555', fontSize: '10px', fontWeight: '800',
              cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.8px',
              transition: 'all 0.18s',
            }}
            onMouseOver={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#333'; }}
            onMouseOut={e => { e.target.style.color = '#555'; e.target.style.borderColor = '#1e1e1e'; }}
          >
            ↓ Export CSV
          </button>

          <div style={{ display: 'flex', gap: '4px', background: '#0a0a0a', padding: '4px', borderRadius: '14px', border: '1px solid #1a1a1a' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                className="filter-btn"
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? '#1e1e1e' : 'transparent',
                  color: filter === f ? '#fff' : '#555',
                  border: 'none', padding: '8px 14px', borderRadius: '10px',
                  fontSize: '10px', fontWeight: '800', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                  transition: 'all 0.18s', fontFamily: 'inherit',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEARCH + DATE FILTERS ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          className="audit-input"
          placeholder="Search action, actor, target, IP…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <input
          type="date"
          className="audit-input"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          style={{ width: '140px', colorScheme: 'dark' }}
        />
        <input
          type="date"
          className="audit-input"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          style={{ width: '140px', colorScheme: 'dark' }}
        />
        {(dateFrom || dateTo || search) && (
          <button
            onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}
            style={{
              padding: '9px 14px', borderRadius: '10px', border: '1px solid #1e1e1e',
              background: 'transparent', color: '#555', fontSize: '11px', fontWeight: '800',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.18s',
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── LOG PANEL ── */}
      <div style={{
        background: '#050505', border: '1px solid #1a1a1a',
        borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
      }}>
        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '130px 1fr 130px',
          padding: '12px 20px', background: '#0a0a0a',
          borderBottom: '1px solid #1a1a1a', fontSize: '9px',
          color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px',
        }}>
          <div>Time</div>
          <div>Event</div>
          <div>Actor</div>
        </div>

        {/* Rows */}
        <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Spinner />
              <div style={{ color: '#444', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '12px' }}>
                Loading audit trail…
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#333', fontSize: '13px', fontWeight: '700' }}>
              {logs.length === 0 ? 'No audit events recorded yet.' : 'No events match your filters.'}
            </div>
          ) : (
            filtered.map((log, i) => (
              <LogRow
                key={log.id}
                log={log}
                delay={Math.min(i * 15, 200)}
                actorUsername={actors[log.actor_id]}
              />
            ))
          )}
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <div style={{ marginTop: '14px', textAlign: 'right', fontSize: '10px', color: '#333', fontWeight: '700', letterSpacing: '0.5px' }}>
          {filtered.length} of {logs.length} event{logs.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

// ── SPINNER ──
function Spinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NEON}
      strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite', display: 'block', margin: '0 auto' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ── LOG ROW ──
function LogRow({ log, delay, actorUsername }) {
  const [open, setOpen] = useState(false);
  const meta = getActionMeta(log.action);

  const time = new Date(log.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const date = new Date(log.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short',
  });

  const isAdmin  = log.actor_role === 'admin';
  const isSystem = log.actor_role === 'system';
  const actorColor = isAdmin ? '#ef4444' : isSystem ? '#666' : '#aaa';
  const actorLabel = actorUsername ?? (isAdmin ? 'Admin' : isSystem ? 'System' : 'User');

  return (
    <div style={{ borderBottom: '1px solid #0f0f0f', animation: `fadeIn 0.3s ease-out ${delay}ms both` }}>
      {/* Main row */}
      <div
        className="audit-row"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'grid', gridTemplateColumns: '130px 1fr 130px',
          padding: '14px 20px', cursor: 'pointer', alignItems: 'center',
          background: open ? '#0c0c0c' : 'transparent',
          transition: 'background 0.15s', gap: '8px',
        }}
      >
        {/* Time */}
        <div style={{ fontFamily: 'monospace' }}>
          <div style={{ fontSize: '12px', color: '#fff', fontWeight: '700' }}>{time}</div>
          <div style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>{date}</div>
        </div>

        {/* Event */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px',
              color: meta.color, background: `${meta.color}14`,
              border: `1px solid ${meta.color}30`,
              padding: '3px 8px', borderRadius: '6px', flexShrink: 0,
            }}>
              {meta.label}
            </span>
            {log.target_type && (
              <span style={{
                fontSize: '12px', color: '#555', fontFamily: 'monospace',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {log.target_type}{log.target_id ? ` · ${log.target_id.slice(0, 8)}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Actor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
            background: `${actorColor}15`, border: `1px solid ${actorColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', fontWeight: '900', color: actorColor,
          }}>
            {actorLabel[0]?.toUpperCase()}
          </div>
          <span style={{
            fontSize: '11px', color: actorColor, fontWeight: '700',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {actorLabel}
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{
          padding: '16px 20px', background: '#0c0c0c',
          borderTop: '1px dashed #1a1a1a',
          animation: 'slideIn 0.2s ease-out',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {/* Trace grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '10px' }}>
            {[
              { label: 'Log ID',    value: log.id?.slice(0, 8) },
              { label: 'Actor',     value: actorUsername ?? log.actor_id?.slice(0, 8) ?? '—' },
              { label: 'Actor ID',  value: log.actor_id?.slice(0, 8) ?? '—' },
              { label: 'Role',      value: log.actor_role ?? '—' },
              { label: 'Target',    value: log.target_type ?? '—' },
              { label: 'Target ID', value: log.target_id?.slice(0, 8) ?? '—' },
              { label: 'IP',        value: log.ip_address ?? 'Hidden' },
              { label: 'UA',        value: log.user_agent ? log.user_agent.slice(0, 20) + '…' : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: '#000', border: '1px solid #1a1a1a',
                borderRadius: '10px', padding: '10px 12px',
              }}>
                <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace', fontWeight: '700', wordBreak: 'break-all' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Metadata</div>
              <pre style={{
                background: '#000', padding: '14px', borderRadius: '10px',
                border: '1px solid #1a1a1a', color: NEON, fontSize: '11px',
                margin: 0, overflowX: 'auto', lineHeight: 1.6, fontFamily: 'monospace',
              }}>
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}