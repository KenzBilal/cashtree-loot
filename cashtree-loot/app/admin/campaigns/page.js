import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import CampaignCard from './campaign-card';

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function CampaignsPage() {
  // FETCH CAMPAIGNS with Lead Counts
  const { data: campaigns, error } = await supabaseAdmin
    .from('campaigns')
    .select(`
      *,
      leads ( count )
    `)
    .order('created_at', { ascending: false });

  if (error) return <div style={{color: '#ef4444', padding: '40px'}}>Error: {error.message}</div>;

  // --- STYLES ---
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
  const titleStyle = { fontSize: '28px', fontWeight: '900', color: '#fff', margin: 0 };
  const subtextStyle = { color: '#666', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' };
  const addBtnStyle = { 
    background: '#22c55e', color: '#fff', padding: '12px 24px', borderRadius: '12px', 
    textDecoration: 'none', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', 
    letterSpacing: '0.5px', boxShadow: '0 10px 20px rgba(34, 197, 94, 0.2)' 
  };
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' };

  return (
    <div>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Campaigns</h1>
          <p style={subtextStyle}>Manage active offers & tracking links</p>
        </div>
        
        <Link href="/admin/campaigns/create" style={addBtnStyle}>
          + New Campaign
        </Link>
      </div>

      {/* CAMPAIGN GRID */}
      {campaigns?.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', border: '2px dashed #222', borderRadius: '24px' }}>
          <div style={{ color: '#444', fontWeight: 'bold' }}>No campaigns found. Start by creating your first offer!</div>
        </div>
      ) : (
        <div style={gridStyle}>
          {campaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} />
          ))}
        </div>
      )}
    </div>
  );
}