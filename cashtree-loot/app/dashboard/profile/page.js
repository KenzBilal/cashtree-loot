import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import ProfileForm from './profile-form';

export const revalidate = 0; // Always fresh

export default async function ProfilePage() {
  // 1. GET TOKEN & AUTH
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  if (!token) redirect('/login');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/login');

  // 2. FETCH ACCOUNT & REFERRALS
  const [
    { data: account },
    { count: referralCount }
  ] = await Promise.all([
    supabase.from('accounts').select('*').eq('id', user.id).single(),
    supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('referred_by', user.id)
  ]);

  if (!account) return <div>Loading...</div>;

  // --- STYLES ---
  const headerStyle = { marginBottom: '30px' };
  const cardStyle = {
    background: '#0a0a0a', border: '1px solid #222', borderRadius: '24px', padding: '24px',
    display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px'
  };
  const avatarStyle = {
    width: '70px', height: '70px', borderRadius: '50%', 
    background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: '900', color: '#fff', textTransform: 'uppercase'
  };

  const statGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
  const statBox = { background: '#0a0a0a', border: '1px solid #222', borderRadius: '16px', padding: '16px' };

  return (
    <div>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={{fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px'}}>My Profile</h1>
        <p style={{color: '#666', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>
          Account Settings & Preferences
        </p>
      </div>

      {/* IDENTITY CARD */}
      <div style={cardStyle}>
        <div style={avatarStyle}>
          {account.username?.[0] || 'U'}
        </div>
        <div>
          <h2 style={{fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '4px'}}>
            @{account.username}
          </h2>
          <div style={{color: '#888', fontSize: '13px', marginBottom: '8px'}}>{account.full_name || 'No Name Set'}</div>
          <div style={{
             display: 'inline-block', padding: '4px 8px', borderRadius: '6px', 
             background: 'rgba(255,255,255,0.05)', border: '1px solid #333', 
             fontSize: '11px', fontFamily: 'monospace', color: '#aaa'
          }}>
            {account.phone || 'No Phone'}
          </div>
        </div>
      </div>

      {/* MINI STATS */}
      <div style={statGrid}>
        <div style={statBox}>
          <div style={{fontSize: '10px', color: '#666', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px'}}>Team Size</div>
          <div style={{fontSize: '24px', fontWeight: '900', color: '#fff'}}>
            {referralCount || 0} <span style={{fontSize: '12px', fontWeight: '500', color: '#555'}}>Promoters</span>
          </div>
        </div>
        <div style={statBox}>
          <div style={{fontSize: '10px', color: '#666', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px'}}>Account Status</div>
          <div style={{fontSize: '18px', fontWeight: '900', color: account.is_frozen ? '#ef4444' : '#22c55e'}}>
            {account.is_frozen ? 'SUSPENDED' : 'ACTIVE ✅'}
          </div>
        </div>
      </div>

      {/* EDIT FORM */}
      <ProfileForm account={account} />

    </div>
  );
}