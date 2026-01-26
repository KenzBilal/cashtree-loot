import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const revalidate = 0;

export default async function AuditPage() {
  // 1. FETCH LOGS (Last 100 events)
  const { data: logs, error } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return <div className="text-red-500">Error loading logs.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Audit Logs</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Immutable System History
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Security Level</div>
          <div className="text-green-500 font-mono font-bold text-xs">MAXIMUM</div>
        </div>
      </div>

      {/* TERMINAL WINDOW */}
      <div className="w-full bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
        
        {/* Terminal Header */}
        <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 border-b border-white/5">
                <th className="p-4 whitespace-nowrap">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target</th>
                <th className="p-4 w-full">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  
                  {/* Time */}
                  <td className="p-4 whitespace-nowrap opacity-50">
                    {new Date(log.created_at).toLocaleString()}
                  </td>

                  {/* Actor */}
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] uppercase ${log.actor_role === 'admin' ? 'text-amber-400 border-amber-500/20' : 'text-blue-400'}`}>
                      {log.actor_role}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="p-4 font-bold text-white">
                    {log.action}
                  </td>

                  {/* Target */}
                  <td className="p-4 opacity-75">
                    {log.target_type} <span className="text-[9px] opacity-30">#{log.target_id?.slice(0,4)}</span>
                  </td>

                  {/* JSON Metadata (Formatted) */}
                  <td className="p-4 font-mono text-[10px] text-green-400/80">
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}