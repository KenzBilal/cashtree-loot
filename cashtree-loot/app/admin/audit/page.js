'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const NEON = '#00ff88';

const ACTION_META = {
  DELETE:          { color: '#ef4444', label: 'DELETE' },
  BAN:             { color: '#ef4444', label: 'BAN' },
  REJECT_LEAD:     { color: '#ef4444', label: 'REJECT' },
  ERROR:           { color: '#ef4444', label: 'ERROR' },
  WITHDRAW:        { color: '#facc15', label: 'WITHDRAW' },
  PAYOUT:          { color: '#facc15', label: 'PAYOUT' },
  APPROVE_LEAD:    { color: '#facc15', label: 'APPROVE' },
  LOGIN:           { color: '#3b82f6', label: 'LOGIN' },
  UPDATE:          { color: '#3b82f6', label: 'UPDATE' },
  SETTINGS_UPDATE: { color: '#3b82f6', label: 'SETTINGS' },
  SIGNUP:          { color: NEON,      label: 'SIGNUP' },
  LOGOUT:          { color: '#888',    label: 'LOGOUT' },
  DEPOSIT:         { color: NEON,      label: 'DEPOSIT' },
};

const getActionMeta = (action) =>
  ACTION_META[action] ?? { color: NEON, label: action };

const FILTERS = ['ALL', 'AUTH', 'FINANCE', 'SYSTEM'];

const matchesFilter = (log, filter) => {
  if (filter === 'ALL') return true;
  if (filter === 'AUTH')    return ['LOGIN', 'SIGNUP', 'LOGOUT'].includes(log.action);
  if (filter === 'FINANCE') return ['WITHDRAW', 'DEPOSIT', 'PAYOUT', 'APPROVE_LEAD', 'REJECT_LEAD'].includes(log.action);
  if (filter === 'SYSTEM')  return ['UPDATE', 'DELETE', 'BAN', 'SETTINGS_UPDATE'].includes(log.action);
  return true;
};

export default function AuditPage() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');
  const [realtime, setRealtime] = useState(true);

  useEffect(() => {
    fetchLogs();
    let channel;
    if (realtime) {
      channel = supabase
        .channel('audit_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
          setLogs((prev) => [payload.new, ...prev]);
        })
        .subscribe();
    }
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [realtime]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setLogs(data);
    setLoading(false);
  };

  const filtered = logs.filter((l) => matchesFilter(l, filter));

  return (
    <div style={{ paddingBottom: '100px' }}>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .audit-row:hover { background: #080808 !important; }
        .filter-btn:hover { color: #fff !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '16px',
        marginBottom: '28px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: '900',
            color: '#fff',
            margin: '0 0 10px 0',
            letterSpacing: '-0.8px',
          }}>
            System <span style={{ color: '#444' }}>Audit</span>
          </h1>

          {/* Live indicator */}
          <div
            onClick={() => setRealtime(!realtime)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', padding: '6px 12px',
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
            <span style={{
              fontSize: '10px', fontWeight: '800', letterSpacing: '1px',
              textTransform: 'uppercase', color: realtime ? NEON : '#555',
            }}>
              {realtime ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{
          display: 'flex', gap: '6px', flexWrap: 'wrap',
          background: '#0a0a0a', padding: '4px',
          borderRadius: '14px', border: '1px solid #1a1a1a',
        }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              className="filter-btn"
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#1e1e1e' : 'transparent',
                color: filter === f ? '#fff' : '#555',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: '800',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                transition: 'all 0.18s',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── LOG PANEL ── */}
      <div style={{
        background: '#050505',
        border: '1px solid #1a1a1a',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
      }}>
        {/* Column headers — hidden on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '110px 1fr 100px',
          padding: '12px 20px',
          background: '#0a0a0a',
          borderBottom: '1px solid #1a1a1a',
          fontSize: '9px',
          color: '#444',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
          className="desktop-header"
        >
          <style>{`.desktop-header { display: none; } @media (min-width: 600px) { .desktop-header { display: grid !important; grid-template-columns: 110px 1fr 100px !important; } }`}</style>
          <div>Time</div>
          <div>Event</div>
          <div>Actor</div>
        </div>

        {/* Rows */}
        <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: 'spin 0.8s linear infinite', marginBottom: '12px' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <div style={{ color: '#444', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Initializing trace…
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#333', fontSize: '13px' }}>
              No events in this log.
            </div>
          ) : (
            filtered.map((log, i) => (
              <LogRow key={log.id} log={log} delay={Math.min(i * 20, 200)} />
            ))
          )}
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <div style={{ marginTop: '14px', textAlign: 'right', fontSize: '10px', color: '#333', fontWeight: '700', letterSpacing: '0.5px' }}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

// ── LOG ROW ──
function LogRow({ log, delay }) {
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
  const actorLabel = isAdmin ? 'Admin' : isSystem ? 'System' : 'User';

  return (
    <div style={{ borderBottom: '1px solid #0f0f0f', animation: `fadeIn 0.3s ease-out ${delay}ms both` }}>
      {/* Main row */}
      <div
        className="audit-row"
        onClick={() => setOpen(!open)}
        style={{
          display: 'grid',
          gridTemplateColumns: '110px 1fr 100px',
          padding: '14px 20px',
          cursor: 'pointer',
          alignItems: 'center',
          background: open ? '#0c0c0c' : 'transparent',
          transition: 'background 0.15s',
          gap: '8px',
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
              color: meta.color,
              background: `${meta.color}14`,
              border: `1px solid ${meta.color}30`,
              padding: '3px 8px', borderRadius: '6px',
              flexShrink: 0,
            }}>
              {meta.label}
            </span>
            <span style={{
              fontSize: '12px', color: '#555', fontFamily: 'monospace',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {log.target_type}{log.target_id ? ` · ${log.target_id.slice(0, 8)}` : ''}
            </span>
          </div>
        </div>

        {/* Actor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
            background: `${actorColor}15`,
            border: `1px solid ${actorColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', fontWeight: '900', color: actorColor,
          }}>
            {actorLabel[0]}
          </div>
          <span style={{ fontSize: '11px', color: actorColor, fontWeight: '700' }}>{actorLabel}</span>
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{
          padding: '16px 20px',
          background: '#0c0c0c',
          borderTop: '1px dashed #1a1a1a',
          animation: 'slideIn 0.2s ease-out',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Trace grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '10px',
          }}>
            {[
              { label: 'Log ID',   value: log.id?.slice(0, 8) },
              { label: 'Actor ID', value: log.actor_id?.slice(0, 8) || '—' },
              { label: 'IP',       value: log.ip_address || 'Hidden' },
              { label: 'Role',     value: log.actor_role || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: '#000', border: '1px solid #1a1a1a',
                borderRadius: '10px', padding: '10px 12px',
              }}>
                <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace', fontWeight: '700' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Metadata */}
          {log.metadata && (
            <div>
              <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Metadata</div>
              <pre style={{
                background: '#000', padding: '14px', borderRadius: '10px',
                border: '1px solid #1a1a1a', color: NEON, fontSize: '11px',
                margin: 0, overflowX: 'auto', lineHeight: 1.5,
                fontFamily: 'monospace',
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