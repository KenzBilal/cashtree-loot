import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CampaignsInterface from './CampaignsInterface';

// Force dynamic so it doesn't cache old data
export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  // 1. AUTH CHECK (Protect the page)
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;
  
  if (!token) redirect('/login');

  // Verify User (Security Check)
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) redirect('/login');

  // 2. FETCH CAMPAIGNS (Use Admin Client to Guarantee Data Loads)
  // This bypasses RLS so users DEFINITELY see the tasks
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: campaigns, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    // ✅ FILTER: Only show active campaigns to users
    .eq('is_active', true) 
    .order('payout_amount', { ascending: false }); 

  if (error) {
    console.error("Campaign Error:", error);
    return (
        <div style={{padding:'40px', textAlign:'center', color:'#f87171'}}>
            <h3>Error Loading Tasks</h3>
            <p style={{fontSize:'12px', opacity:0.7}}>{error.message}</p>
        </div>
    );
  }

  // 3. RENDER
  const headerStyle = { marginBottom: '30px', textAlign: 'center', paddingTop: '10px' };
  const neonTitle = {
    fontSize: '28px', fontWeight: '900', color: '#fff', 
    marginBottom: '8px', textShadow: '0 0 25px rgba(0, 255, 136, 0.4)'
  };

  return (
    <div style={{paddingBottom: '100px'}}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={neonTitle}>Earn Money</h1>
        <p style={{
          color: '#888', fontSize: '11px', fontWeight: '700', 
          textTransform: 'uppercase', letterSpacing: '2px',
          background: 'rgba(255,255,255,0.05)', display: 'inline-block',
          padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)'
        }}>
          Active Premium Tasks
        </p>
      </div>

      {/* THE 10/10 INTERFACE */}
      <CampaignsInterface campaigns={campaigns || []} promoterId={user.id} />

    </div>
  );
}