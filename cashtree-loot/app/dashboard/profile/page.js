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

  if (!account) return <div style={{padding:'20px', color:'#fff'}}>Loading Profile...</div>;

  // --- PREMIUM GLASS STYLES ---
  const headerStyle = { 
    marginBottom: '30px',
    textAlign: 'center'
  };

  const neonTitle = {
    fontSize: '24px', 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: '8px',
    textShadow: '0 0 15px rgba(255,255,255,0.2)'
  };

  const glassCard = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '30px',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    overflow: 'hidden'
  };

  const avatarStyle = {
    width: '90px', 
    height: '90px', 
    borderRadius: '50%', 
    background: 'linear-gradient(135deg, #00ff88, #007acc)',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontSize: '36px', 
    fontWeight: '900', 
    color: '#000', 
    textTransform: 'uppercase',
    marginBottom: '16px',
    boxShadow: '0 0 25px rgba(0, 255, 136, 0.4)',
    border: '2px solid rgba(255,255,255,0.2)'
  };

  const statGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' };
  
  const statBox = { 
    background: 'rgba(255, 255, 255, 0.02)', 
    border: '1px solid rgba(255, 255, 255, 0.05)', 
    borderRadius: '20px', 
    padding: '20px',
    textAlign: 'center'
  };

  return (
    <div className="fade-in" style={{paddingBottom: '100px'}}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={neonTitle}>My Profile</h1>
        <p style={{
          color: '#888', 
          fontSize: '11px', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          background: 'rgba(255,255,255,0.05)',
          display: 'inline-block',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          Account Settings
        </p>
      </div>

      {/* IDENTITY CARD */}
      <div style={glassCard}>
        {/* Glowing Background Blob */}
        <div style={{position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '150px', height: '150px', background: '#00ff88', filter: 'blur(80px)', opacity: 0.15}}></div>

        <div style={avatarStyle}>
          {account.username?.[0] || 'U'}
        </div>
        
        <div>
          <h2 style={{fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '6px', textShadow: '0 0 10px rgba(0,0,0,0.5)'}}>
            @{account.username}
          </h2>
          <div style={{color: '#aaa', fontSize: '13px', marginBottom: '12px'}}>{account.full_name || 'No Name Set'}</div>
          
          <div style={{
             display: 'inline-block', padding: '6px 12px', borderRadius: '8px', 
             background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
             fontSize: '11px', fontFamily: 'monospace', color: '#888', letterSpacing: '1px'
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
            {referralCount || 0}
          </div>
        </div>
        <div style={{...statBox, borderColor: account.is_frozen ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.2)'}}>
          <div style={{fontSize: '10px', color: '#666', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px'}}>Status</div>
          <div style={{fontSize: '16px', fontWeight: '900', color: account.is_frozen ? '#ef4444' : '#00ff88', textShadow: account.is_frozen ? '0 0 10px rgba(239,68,68,0.4)' : '0 0 10px rgba(0,255,136,0.4)'}}>
            {account.is_frozen ? 'FROZEN' : 'ACTIVE'}
          </div>
        </div>
      </div>

      {/* EDIT FORM */}
      <div style={{padding: '0 10px'}}>
        <div style={{marginBottom: '15px', fontSize: '12px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'}}>Edit Details</div>
        <ProfileForm account={account} />
      </div>

    </div>
  );
}