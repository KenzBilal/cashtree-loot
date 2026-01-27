import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CampaignItem from './CampaignItem';

export const revalidate = 0; // Always fresh

export default async function CampaignsPage() {
  // 1. GET AUTHENTICATED USER
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

  // 2. FETCH ACTIVE CAMPAIGNS
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active') // Only show active offers
    .order('created_at', { ascending: false });

  if (error) {
    return <div style={{padding:'20px', color:'#ef4444'}}>Error loading offers.</div>;
  }

  // --- STYLES ---
  const headerStyle = {
    marginBottom: '30px',
    textAlign: 'center'
  };

  return (
    <div>
      {/* PAGE HEADER */}
      <div style={headerStyle}>
        <h1 style={{fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px'}}>Active Campaigns</h1>
        <p style={{color: '#666', fontSize: '14px', maxWidth: '300px', margin: '0 auto'}}>
          Share these links. When users complete the task, you get paid.
        </p>
      </div>

      {/* CAMPAIGN LIST */}
      <div style={{paddingBottom: '40px'}}>
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((camp) => (
            <CampaignItem 
              key={camp.id} 
              campaign={camp} 
              promoterId={user.id} 
            />
          ))
        ) : (
          <div style={{textAlign: 'center', padding: '60px', border: '1px dashed #333', borderRadius: '20px'}}>
            <div style={{fontSize: '40px', marginBottom: '10px'}}>😴</div>
            <div style={{fontWeight: 'bold', color: '#fff'}}>No Offers Available</div>
            <div style={{color: '#666', fontSize: '13px'}}>Check back later for new tasks.</div>
          </div>
        )}
      </div>

    </div>
  );
}