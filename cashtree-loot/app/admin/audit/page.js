'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Init Client for Client-Side Subscription/Fetching
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, AUTH, FINANCE, SYSTEM

  // 1. LIVE FETCH
  useEffect(() => {
    fetchLogs();
    
    // Optional: Real-time subscription could go here
    const interval = setInterval(fetchLogs, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
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
    if (filter === 'FINANCE') return ['WITHDRAW', 'DEPOSIT', 'PAYOUT'].includes(log.action);
    if (filter === 'SYSTEM') return ['UPDATE', 'DELETE', 'BAN'].includes(log.action);
    return true;
  });

  // --- STYLES ---
  const containerStyle = { padding: '20px', animation: 'fadeIn 0.5s ease-out' };
  
  // Status Colors
  const getActionColor = (action) => {
    if (['DELETE', 'BAN', 'REJECT'].includes(action)) return '#ef4444'; // Red
    if (['WITHDRAW', 'PAYOUT'].includes(action)) return '#facc15'; // Gold
    if (['LOGIN', 'UPDATE'].includes(action)) return '#3b82f6'; // Blue
    return '#00ff88'; // Green (Default)
  };

  return (
    <div style={containerStyle}>
      
      {/* 1. HEADER & CONTROLS */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <div>
          <h1 style={{fontSize: '28px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px'}}>
            System <span style={{color: '#666'}}>Audit</span>
          </h1>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px'}}>
             <span className="pulse" style={{width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88'}}></span>
             <span style={{fontSize: '11px', color: '#00ff88', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>Live Monitoring</span>
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
      <div style={{
        background: '#050505', border: '1px solid #222', borderRadius: '16px', 
        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', 
          background: '#0a0a0a', padding: '12px 20px', borderBottom: '1px solid #222',
          fontSize: '10px', color: '#555', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          <div>Timestamp</div>
          <div>Actor</div>
          <div>Action</div>
          <div>Details</div>
        </div>

        {/* Scrollable List */}
        <div style={{maxHeight: '600px', overflowY: 'auto'}}>
          {loading ? (
             <div style={{padding: '40px', textAlign: 'center', color: '#00ff88', fontFamily: 'monospace'}}>INITIALIZING TRACE...</div>
          ) : filteredLogs.map((log) => (
             <LogItem key={log.id} log={log} color={getActionColor(log.action)} />
          ))}
          
          {!loading && filteredLogs.length === 0 && (
             <div style={{padding: '40px', textAlign: 'center', color: '#444', fontSize: '13px'}}>No events found.</div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .pulse { animation: pulse 2s infinite; }
        ::-webkit-scrollbar { width: 8px; }
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

  return (
    <div style={{borderBottom: '1px solid #111', fontSize: '12px', fontFamily: 'monospace'}}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', 
          padding: '16px 20px', cursor: 'pointer',
          transition: 'background 0.2s', background: expanded ? '#0a0a0a' : 'transparent'
        }}
        onMouseOver={(e) => !expanded && (e.currentTarget.style.background = '#080808')}
        onMouseOut={(e) => !expanded && (e.currentTarget.style.background = 'transparent')}
      >
        {/* Time */}
        <div style={{color: '#666'}}>
          {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
        </div>
        
        {/* Actor */}
        <div style={{color: '#fff', fontWeight: '700'}}>
          {log.actor_role?.toUpperCase() || 'SYSTEM'} 
          <span style={{color: '#444', marginLeft: '6px', fontWeight: '400'}}>#{log.actor_id?.slice(0,4)}</span>
        </div>

        {/* Action */}
        <div style={{color: color, fontWeight: '800', letterSpacing: '0.5px'}}>
          {log.action}
        </div>

        {/* Preview */}
        <div style={{color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {log.target_type} :: {log.target_id}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{
          padding: '20px', background: '#080808', borderTop: '1px dashed #222', 
          display: 'flex', gap: '20px'
        }}>
           <div style={{flex: 1}}>
             <div style={{fontSize: '10px', color: '#444', marginBottom: '6px', fontWeight: '700'}}>METADATA PAYLOAD</div>
             <pre style={{
               background: '#000', padding: '12px', borderRadius: '8px', border: '1px solid #222',
               color: '#22c55e', fontSize: '11px', margin: 0, overflowX: 'auto'
             }}>
               {JSON.stringify(log.metadata, null, 2)}
             </pre>
           </div>
           <div style={{width: '200px'}}>
             <div style={{fontSize: '10px', color: '#444', marginBottom: '6px', fontWeight: '700'}}>CONTEXT</div>
             <div style={{marginBottom: '8px'}}><span style={{color: '#666'}}>IP:</span> <span style={{color: '#fff'}}>192.168.x.x</span></div>
             <div style={{marginBottom: '8px'}}><span style={{color: '#666'}}>UA:</span> <span style={{color: '#fff'}}>Chrome/Win</span></div>
           </div>
        </div>
      )}
    </div>
  );
}