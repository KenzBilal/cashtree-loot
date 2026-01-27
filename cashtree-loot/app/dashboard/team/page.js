import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import TeamInterface from './TeamInterface';

export const revalidate = 0;

export default async function TeamPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;
  if (!token) redirect('/login');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // FETCH UP TO 1000 RECRUITS
  const { data: team } = await supabase
    .from('accounts')
    .select('id, username, created_at, is_frozen')
    .eq('referred_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1000);

  // CHANGE: Use account.username instead of user.id
const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/?ref=${account.username}`;

  return (
    <div style={{paddingBottom: '100px', animation: 'fadeIn 0.6s ease-out'}}>
      
      {/* HEADER */}
      <div style={{marginBottom: '30px', textAlign: 'center', paddingTop: '10px'}}>
        <div style={{
          fontSize: '11px', color: '#a855f7', fontWeight: '800', 
          textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px'
        }}>
          Team Management
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: '900', color: '#fff', 
          margin: 0, letterSpacing: '-1px', textShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
        }}>
          My Network
        </h1>
      </div>

      {/* INTERFACE */}
      <TeamInterface initialTeam={team || []} referralLink={referralLink} />

    </div>
  );
}