import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CampaignItem from './CampaignItem';

// ⚡ Force fresh data on every load
export const revalidate = 0;

export default async function CampaignsPage() {
  // 1. AUTH & SECURITY
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

  // 2. FETCH CAMPAIGNS (Robust Mode)
  // I removed the .eq('status', 'active') filter temporarily.
  // This ensures you see data even if you forgot to set the status to 'active' in the DB.
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  // 3. ERROR STATE (Glass Design)
  if (error) {
    return (
      <div style={{
        padding: '30px', 
        background: 'rgba(239, 68, 68, 0.1)', 
        border: '1px solid rgba(239, 68, 68, 0.2)', 
        borderRadius: '20px', 
        textAlign: 'center'
      }}>
        <div style={{fontSize: '24px', marginBottom: '10px'}}>⚠️</div>
        <h3 style={{color: '#f87171', fontWeight: 'bold'}}>System Error</h3>
        <p style={{color: '#aaa', fontSize: '13px'}}>Could not load campaigns. Please contact support.</p>
        <div style={{fontSize: '10px', marginTop: '10px', fontFamily: 'monospace', color: '#666'}}>{error.message}</div>
      </div>
    );
  }

  // --- STYLES ---
  const headerStyle = {
    marginBottom: '30px',
    textAlign: 'center',
    paddingTop: '10px'
  };

  const neonTitle = {
    fontSize: '28px', 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: '8px',
    textShadow: '0 0 20px rgba(0, 255, 136, 0.4)' // Green Neon Glow
  };

  return (
    <div className="fade-in" style={{paddingBottom: '100px'}}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={neonTitle}>Earn Money</h1>
        <p style={{
          color: '#888', 
          fontSize: '11px', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '2px',
          background: 'rgba(255,255,255,0.05)',
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          Active Premium Tasks
        </p>
      </div>

      {/* CAMPAIGN LIST */}
      <div>
        {campaigns && campaigns.length > 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            {campaigns.map((camp) => (
              <CampaignItem 
                key={camp.id} 
                campaign={camp} 
                promoterId={user.id} 
              />
            ))}
          </div>
        ) : (
          /* EMPTY STATE (Glass Design) */
          <div style={{
            textAlign: 'center', 
            padding: '60px 20px', 
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)', 
            borderRadius: '24px',
            marginTop: '20px'
          }}>
            <div style={{fontSize: '50px', marginBottom: '16px', filter: 'grayscale(100%) opacity(0.5)'}}>💤</div>
            <div style={{fontWeight: 'bold', color: '#fff', fontSize: '18px', marginBottom: '6px'}}>No Tasks Available</div>
            <div style={{color: '#666', fontSize: '13px', maxWidth: '250px', margin: '0 auto'}}>
              We are currently restocking our inventory. Please check back in a few hours!
            </div>
          </div>
        )}
      </div>

    </div>
  );
}