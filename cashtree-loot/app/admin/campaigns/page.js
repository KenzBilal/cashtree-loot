import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import CampaignCard from './campaign-card';

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function CampaignsPage() {
  // 1. FETCH DATA (With Lead Counts)
  const { data: campaigns, error } = await supabaseAdmin
    .from('campaigns')
    .select(`*, leads (count)`)
    .order('created_at', { ascending: false });

  if (error) return <div style={{color: '#ef4444', padding: '40px'}}>Error: {error.message}</div>;

  // 2. CALCULATE GLOBAL STATS
  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
  const totalLeads = campaigns?.reduce((sum, c) => sum + (c.leads?.[0]?.count || 0), 0) || 0;

  // --- STYLES ---
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' };
  const neonGreen = '#00ff88';

  return (
    <div style={{animation: 'fadeIn 0.6s ease-out'}}>
      
      {/* 1. COMMAND HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={{fontSize: '32px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px'}}>
            Mission <span style={{color: '#666'}}>Control</span>
          </h1>
          <div style={{display: 'flex', gap: '16px', marginTop: '10px'}}>
             <StatBadge label="ACTIVE MISSIONS" value={activeCampaigns} color={neonGreen} />
             <StatBadge label="TOTAL LEADS" value={totalLeads} color="#3b82f6" />
          </div>
        </div>
        
        <Link href="/admin/campaigns/create" style={{
          background: '#fff', color: '#000', padding: '14px 28px', borderRadius: '12px', 
          textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', 
          letterSpacing: '1px', boxShadow: '0 0 25px rgba(255,255,255,0.3)',
          transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>+</span> Deploy New Offer
        </Link>
      </div>

      {/* 2. TACTICAL GRID */}
      {campaigns?.length === 0 ? (
        <div style={{ 
          padding: '80px', textAlign: 'center', border: '1px dashed #333', borderRadius: '24px',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{fontSize: '40px', marginBottom: '10px'}}>📡</div>
          <div style={{ color: '#666', fontWeight: '700' }}>No active signals. Deploy your first campaign.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {campaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} />
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-Component: Stat Badge
function StatBadge({ label, value, color }) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: '#888'}}>
       <span style={{color: color, fontSize: '14px'}}>{value}</span>
       <span style={{letterSpacing: '0.5px'}}>{label}</span>
    </div>
  );
}