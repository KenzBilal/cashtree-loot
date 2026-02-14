'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Init Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 
  const [realtime, setRealtime] = useState(true);

  // 1. LIVE FETCH & SUBSCRIPTION
  useEffect(() => {
    fetchLogs();

    // ⚡ REALTIME SUBSCRIPTION (The 10/10 Upgrade)
    // This makes new logs appear INSTANTLY as they happen.
    let channel;
    if (realtime) {
      channel = supabase
        .channel('audit_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'audit_logs' },
          (payload) => {
            // Prepend new log to the top of the list
            setLogs((prevLogs) => [payload.new, ...prevLogs]);
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [realtime]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (data) setLogs(data);
    setLoading(false);
  };

  // 2. FILTER LOGIC
  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    if (filter === 'AUTH') return ['LOGIN', 'SIGNUP', 'LOGOUT'].includes(log.action);
    if (filter === 'FINANCE') return ['WITHDRAW', 'DEPOSIT', 'PAYOUT', 'APPROVE_LEAD', 'REJECT_LEAD'].includes(log.action);
    if (filter === 'SYSTEM') return ['UPDATE', 'DELETE', 'BAN', 'SETTINGS_UPDATE'].includes(log.action);
    return true;
  });

  // --- STYLES ---
  const glassPanel = {
    background: '#050505', border: '1px solid #222', borderRadius: '16px', 
    overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
  };

  const getActionColor = (action) => {
    if (['DELETE', 'BAN', 'REJECT_LEAD', 'ERROR'].includes(action)) return '#ef4444'; // Red
    if (['WITHDRAW', 'PAYOUT', 'APPROVE_LEAD'].includes(action)) return '#facc15'; // Gold
    if (['LOGIN', 'UPDATE', 'SETTINGS_UPDATE'].includes(action)) return '#3b82f6'; // Blue
    return '#00ff88'; // Green
  };

  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
      
      {/* 1. HEADER & CONTROLS */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <div>
          <h1 style={{fontSize: '28px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px'}}>
            System <span style={{color: '#666'}}>Audit</span>
          </h1>
          <div 
            onClick={() => setRealtime(!realtime)}
            style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', cursor: 'pointer'}}
          >
             <span className={realtime ? "pulse" : ""} style={{
               width: '8px', height: '8px', borderRadius: '50%', 
               background: realtime ? '#00ff88' : '#444', transition: 'background 0.3s'
             }}></span>
             <span style={{fontSize: '11px', color: realtime ? '#00ff88' : '#666', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>
               {realtime ? 'Socket Connection: LIVE' : 'Socket Connection: PAUSED'}
             </span>
          </div>
        </div>

        {/* Filters */}
        <div style={{display: 'flex', gap: '8px', background: '#111', padding: '4px', borderRadius: '12px', border: '1px solid #222'}}>
          {['ALL', 'AUTH', 'FINANCE', 'SYSTEM'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? '#222' : 'transparent',
              color: filter === f ? '#fff' : '#666',
              border: 'none', padding: '8px 16px', borderRadius: '8px',
              fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TERMINAL WINDOW */}
      <div style={glassPanel}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.5fr 2fr', 
          background: '#0a0a0a', padding: '12px 24px', borderBottom: '1px solid #222',
          fontSize: '10px', color: '#555', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          <div>Timestamp</div>
          <div>Actor</div>
          <div>Action</div>
          <div>Target Details</div>
        </div>

        <div style={{maxHeight: '600px', overflowY: 'auto'}}>
          {loading ? (
             <div style={{padding: '60px', textAlign: 'center', color: '#00ff88', fontFamily: 'monospace', fontSize: '12px'}}>
                INITIALIZING SECURE TRACE...
             </div>
          ) : filteredLogs.map((log) => (
             <LogItem key={log.id} log={log} color={getActionColor(log.action)} />
          ))}
          
          {!loading && filteredLogs.length === 0 && (
             <div style={{padding: '60px', textAlign: 'center', color: '#444', fontSize: '13px'}}>
                No events found in secure log. System is quiet.
             </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .pulse { animation: pulse 2s infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #222; borderRadius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENT: LOG ITEM ---
function LogItem({ log, color }) {
  const [expanded, setExpanded] = useState(false);
  const timeStr = new Date(log.created_at).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit', second:'2-digit'});

  return (
    <div style={{borderBottom: '1px solid #111', fontSize: '12px', fontFamily: 'monospace'}}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.5fr 2fr', 
          padding: '16px 24px', cursor: 'pointer', alignItems: 'center',
          transition: 'background 0.2s', background: expanded ? '#0e0e12' : 'transparent'
        }}
        onMouseOver={(e) => !expanded && (e.currentTarget.style.background = '#080808')}
        onMouseOut={(e) => !expanded && (e.currentTarget.style.background = 'transparent')}
      >
        {/* Time */}
        <div style={{color: '#666'}}>{timeStr}</div>
        
        {/* Actor */}
        <div style={{color: '#fff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <div style={{
             width: '16px', height: '16px', borderRadius: '4px', 
             background: log.actor_role === 'admin' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
             border: log.actor_role === 'admin' ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(59,130,246,0.4)',
             display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'
          }}>
             {log.actor_role === 'admin' ? 'A' : (log.actor_role === 'system' ? 'S' : 'U')}
          </div>
          <span style={{color: log.actor_role === 'admin' ? '#ef4444' : (log.actor_role === 'system' ? '#888' : '#fff')}}>
             {log.actor_role === 'system' ? 'SYSTEM' : (log.actor_role === 'admin' ? 'ADMIN' : 'USER')}
          </span>
        </div>

        {/* Action */}
        <div style={{color: color, fontWeight: '800', letterSpacing: '0.5px'}}>
          {log.action}
        </div>

        {/* Preview */}
        <div style={{color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {log.target_type} :: {log.target_id || 'N/A'}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{
          padding: '20px', background: '#0e0e12', borderTop: '1px dashed #222', 
          display: 'flex', gap: '20px', animation: 'slideDown 0.2s'
        }}>
           <div style={{flex: 1}}>
             <div style={{fontSize: '10px', color: '#444', marginBottom: '6px', fontWeight: '700'}}>METADATA PAYLOAD</div>
             <pre style={{
               background: '#000', padding: '12px', borderRadius: '8px', border: '1px solid #222',
               color: '#00ff88', fontSize: '11px', margin: 0, overflowX: 'auto', lineHeight: '1.4'
             }}>
               {JSON.stringify(log.metadata, null, 2)}
             </pre>
           </div>
           <div style={{width: '200px'}}>
             <div style={{fontSize: '10px', color: '#444', marginBottom: '6px', fontWeight: '700'}}>TRACE INFO</div>
             <div style={{marginBottom: '4px', fontSize: '11px'}}><span style={{color: '#666'}}>Log ID:</span> <span style={{color: '#fff'}}>{log.id.slice(0,8)}</span></div>
             <div style={{marginBottom: '4px', fontSize: '11px'}}><span style={{color: '#666'}}>IP:</span> <span style={{color: '#fff'}}>{log.ip_address || 'Hidden'}</span></div>
             <div style={{marginBottom: '4px', fontSize: '11px'}}><span style={{color: '#666'}}>Actor ID:</span> <span style={{color: '#fff'}}>{log.actor_id?.slice(0,8)}</span></div>
           </div>
        </div>
      )}
    </div>
  );
}