import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import ProfileForm from './profile-form';

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function ProfilePage() {
  // 1. GET USER
  const cookieStore = cookies();
  const token = cookieStore.get('ct_session')?.value;
  const { data: { user } } = await supabase.auth.getUser(token);

  // 2. FETCH ACCOUNT DETAILS
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', user.id)
    .single();

  // 3. COUNT REFERRALS
  const { count: referralCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('referred_by', user.id);

  return (
    <div className="space-y-8 pb-24">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-white">My Profile</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
          Account Settings
        </p>
      </div>

      {/* IDENTITY CARD */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#0a0a0a] border border-white/10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white uppercase">
          {account.username?.[0] || 'U'}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">@{account.username}</h2>
          <div className="text-xs text-slate-500">{account.full_name}</div>
          <div className="mt-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 inline-block text-[10px] font-mono text-slate-400">
            {account.phone}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Invited</div>
          <div className="text-xl font-black text-white">{referralCount} <span className="text-xs font-normal text-slate-500">People</span></div>
        </div>
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Status</div>
          <div className={`text-xl font-black ${account.is_frozen ? 'text-red-500' : 'text-green-500'}`}>
            {account.is_frozen ? 'FROZEN' : 'ACTIVE'}
          </div>
        </div>
      </div>

      {/* EDIT FORM (Client Side) */}
      <ProfileForm account={account} />

    </div>
  );
}