import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; // Always fresh logs

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function AuditPage() {
  // 1. FETCH LOGS (Last 100 events)
  const { data: logs, error } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return <div style={{color: '#ef4444', padding: '40px'}}>Error: {error.message}</div>;

  // --- STYLES ---
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '30px' };
  const terminalStyle = { 
    width: '100%', 
    background: '#050505', 
    border: '1px solid #222', 
    borderRadius: '16px', 
    overflow: 'hidden', 
    fontFamily: 'monospace',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
  };
  const thStyle = { padding: '12px 16px', color: '#555', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid #111', textAlign: 'left' };
  const tdStyle = { padding: '12px 16px', fontSize: '12px', borderBottom: '1px solid #0a0a0a', verticalAlign: 'top' };

  return (
    <div>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={{fontSize: '28px', fontWeight: '900', color: '#fff', margin: 0}}>Audit Logs</h1>
          <p style={{color: '#666', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px'}}>
            Immutable System History
          </p>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: '10px', color: '#444', fontWeight: '900', textTransform: 'uppercase'}}>Security Level</div>
          <div style={{fontSize: '12px', color: '#22c55e', fontWeight: 'bold'}}>ENCRYPTED / MAXIMUM</div>
        </div>
      </div>

      {/* TERMINAL WINDOW */}
      <div style={terminalStyle}>
        {/* Terminal Title Bar */}
        <div style={{background: '#111', padding: '10px 16px', borderBottom: '1px solid #222', display: 'flex', gap: '6px'}}>
          <div style={{width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56'}}></div>
          <div style={{width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e'}}></div>
          <div style={{width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f'}}></div>
        </div>

        {/* Logs Table */}
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#080808'}}>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>Actor</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Target</th>
                <th style={thStyle}>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs && logs.length > 0 ? logs.map((log) => (
                <tr key={log.id} style={{transition: 'background 0.2s'}} onMouseOver={(e) => e.currentTarget.style.background = '#080808'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  {/* Timestamp */}
                  <td style={{...tdStyle, color: '#444', whiteSpace: 'nowrap'}}>
                    {new Date(log.created_at).toLocaleTimeString()} 
                    <span style={{fontSize: '10px', marginLeft: '5px', opacity: 0.5}}>{new Date(log.created_at).toLocaleDateString()}</span>
                  </td>

                  {/* Actor Badge */}
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '10px', 
                      fontWeight: 'bold',
                      background: log.actor_role === 'admin' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: log.actor_role === 'admin' ? '#facc15' : '#60a5fa',
                      border: `1px solid ${log.actor_role === 'admin' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                    }}>
                      {log.actor_role.toUpperCase()}
                    </span>
                  </td>

                  {/* Action */}
                  <td style={{...tdStyle, color: '#fff', fontWeight: 'bold'}}>{log.action}</td>

                  {/* Target */}
                  <td style={{...tdStyle, color: '#888'}}>
                    {log.target_type} <span style={{fontSize: '10px', color: '#444'}}>#{log.target_id?.slice(0,6)}</span>
                  </td>

                  {/* Metadata JSON */}
                  <td style={{...tdStyle, color: '#22c55e', fontSize: '11px', maxWidth: '300px', wordBreak: 'break-all'}}>
                    <div style={{background: 'rgba(34, 197, 94, 0.05)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.1)'}}>
                       {JSON.stringify(log.metadata)}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{padding: '40px', textAlign: 'center', color: '#444'}}>No system logs detected.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{marginTop: '20px', fontSize: '11px', color: '#444', textAlign: 'center'}}>
        &mdash; END OF DATA STREAM &mdash;
      </div>
    </div>
  );
}