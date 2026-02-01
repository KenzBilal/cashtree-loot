import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import ProfileForm from './profile-form';

export const revalidate = 60; //  fresh every 60 seconds

export default async function ProfilePage() {
  // 1. AUTHENTICATION & SECURITY
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

  // 2. FETCH PROFILE + TOTAL EARNINGS (The "Flex" Data)
  // We fetch the ledger to calculate "Lifetime Earnings" for the profile badge
  const { data: account, error } = await supabase
    .from('accounts')
    .select('*, ledger(amount)')
    .eq('id', user.id)
    .single();

  if (!account || error) return <div className="p-10 text-center text-white">Loading...</div>;

  // Calculate Lifetime Earnings (Sum of all positive ledger entries)
  const totalEarned = account.ledger
    ?.filter(entry => entry.amount > 0)
    .reduce((sum, entry) => sum + entry.amount, 0) || 0;

  // --- 10/10 STYLING CONSTANTS ---
  const containerStyle = {
    paddingBottom: '100px',
    animation: 'fadeIn 0.5s ease-out'
  };

  const pageHeader = {
    marginBottom: '30px',
    textAlign: 'center'
  };

  const idCard = {
    background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, #000 100%)',
    borderRadius: '24px',
    padding: '30px',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    marginBottom: '30px'
  };

  const statBadge = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: '16px',
    flex: 1,
    textAlign: 'center',
    backdropFilter: 'blur(10px)'
  };

  return (
    <div style={containerStyle}>
      
      {/* 1. PAGE HEADER */}
      <div style={pageHeader}>
        <div style={{
          fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', 
          letterSpacing: '3px', color: '#00ff88', marginBottom: '8px'
        }}>
          Personal Terminal
        </div>
        <h1 style={{
          fontSize: '32px', fontWeight: '900', color: '#fff', margin: 0,
          textShadow: '0 0 30px rgba(255,255,255,0.1)'
        }}>
          My Profile
        </h1>
      </div>

      {/* 2. THE "BLACK CARD" (Identity Section) */}
      <div style={idCard}>
        {/* Decorative Glows */}
        <div style={{position:'absolute', top:'-80px', right:'-80px', width:'200px', height:'200px', background:'radial-gradient(circle, #00ff88 0%, transparent 70%)', opacity:0.15, filter:'blur(40px)'}}></div>
        
        <div style={{position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'}}>
          
          {/* Avatar with Ring */}
          <div style={{position: 'relative'}}>
             <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ddd, #fff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '40px', fontWeight: '900', color: '#000',
              border: '4px solid #111',
              boxShadow: '0 0 0 4px rgba(0,255,136,0.3)'
            }}>
              {account.username?.[0]?.toUpperCase() || 'U'}
            </div>
            {/* Online Dot */}
            <div style={{
              position: 'absolute', bottom: '5px', right: '5px',
              width: '20px', height: '20px', background: '#00ff88',
              borderRadius: '50%', border: '3px solid #111',
              boxShadow: '0 0 10px #00ff88'
            }}></div>
          </div>

          {/* Name & Badge */}
          <div style={{textAlign: 'center'}}>
            <h2 style={{fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 5px 0'}}>
              @{account.username}
            </h2>
            <div style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '100px',
              background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)',
              color: '#00ff88', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase'
            }}>
              {account.role === 'admin' ? 'Administrator' : 'Verified Partner'}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{display: 'flex', gap: '12px', width: '100%', marginTop: '10px'}}>
            
            <div style={statBadge}>
              <div style={{fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px'}}>Lifetime Earned</div>
              <div style={{fontSize: '18px', fontWeight: '900', color: '#fff'}}>
                ₹{totalEarned.toLocaleString()}
              </div>
            </div>

            <div style={statBadge}>
              <div style={{fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px'}}>Member Since</div>
              <div style={{fontSize: '18px', fontWeight: '900', color: '#fff'}}>
                {new Date(account.created_at).getFullYear()}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 3. SETTINGS FORM (Wrapped in Glass) */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '24px',
        padding: '24px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute', top: '-10px', left: '24px', 
          background: '#000', padding: '0 10px', 
          color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          Edit Details
        </div>

        <ProfileForm account={account} />
      </div>

      {/* 4. FOOTER NOTE */}
      <div style={{textAlign: 'center', marginTop: '30px', opacity: 0.3}}>
        <div style={{fontSize: '10px', color: '#fff'}}>USER ID: {account.id}</div>
        <div style={{fontSize: '10px', color: '#fff'}}>SECURE CONNECTION ENCRYPTED</div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}