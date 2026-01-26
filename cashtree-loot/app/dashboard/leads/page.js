import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function LeadsPage() {
  // 1. GET CURRENT USER
  const cookieStore = cookies();
  const token = cookieStore.get('ct_session')?.value;
  const { data: { user } } = await supabase.auth.getUser(token);

  // 2. FETCH LEADS (My Referrals)
  // Join campaigns for title, users for phone (masked)
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      id, created_at, status, is_first_approved,
      campaigns ( title ),
      users ( phone )
    `)
    .eq('referred_by', user.id)
    .order('created_at', { ascending: false })
    .limit(50); // Show last 50

  if (error) return <div className="text-center p-10 text-red-500">Error loading activity.</div>;

  return (
    <div className="space-y-6 pb-24">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-white">Activity Log</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
          Track your referrals
        </p>
      </div>

      {/* LEAD LIST */}
      <div className="space-y-3">
        {leads?.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-[#0a0a0a]">
            <div className="text-slate-500 font-bold text-sm">No activity yet.</div>
            <div className="text-slate-600 text-xs mt-1">Share a task to get started!</div>
          </div>
        ) : (
          leads.map((lead) => <LeadItem key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// HELPER COMPONENT (Internal)
// ---------------------------------------------------------
function LeadItem({ lead }) {
  // Config Status Colors
  const statusConfig = {
    approved: { icon: 'fa-check', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    pending: { icon: 'fa-clock', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    rejected: { icon: 'fa-times', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
  };

  const config = statusConfig[lead.status] || statusConfig.pending;

  // Mask Phone Number safely
  const rawPhone = lead.users?.phone || 'Unknown';
  const maskedPhone = rawPhone.length > 5 
    ? rawPhone.slice(0, 3) + '****' + rawPhone.slice(-3) 
    : '****';

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border bg-[#0a0a0a] ${config.border}`}>
      
      {/* ICON BADGE */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg} ${config.color} shrink-0`}>
        <i className={`fas ${config.icon}`}></i>
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white truncate">{lead.campaigns?.title || 'Unknown Task'}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-mono text-slate-400">{maskedPhone}</span>
          <span>•</span>
          <span>{new Date(lead.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* STATUS TEXT */}
      <div className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
        {lead.status}
      </div>

    </div>
  );
}