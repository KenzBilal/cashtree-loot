import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import TaskCard from './task-card';

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function TasksPage() {
  // 1. GET CURRENT USER (For the ?ref=ID link)
  const cookieStore = cookies();
  const token = cookieStore.get('ct_session')?.value;
  const { data: { user } } = await supabase.auth.getUser(token);

  // 2. FETCH ACTIVE CAMPAIGNS
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return <div className="text-red-500 text-center p-10">Error loading tasks.</div>;

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-white">Available Tasks</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
          Share links & Earn money
        </p>
      </div>

      {/* TASK FEED */}
      {campaigns?.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
          <div className="text-4xl mb-4">😴</div>
          <div className="text-slate-500 font-bold text-sm">No active tasks right now.</div>
          <div className="text-slate-600 text-xs mt-1">Check back later!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((camp) => (
            <TaskCard key={camp.id} campaign={camp} promoterId={user.id} />
          ))}
        </div>
      )}

    </div>
  );
}