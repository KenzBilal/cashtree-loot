import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import CampaignManager from './CampaignManager'; // ✅ The new interactive manager

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function CampaignsPage() {
  // 1. FETCH DATA (Admin sees ALL campaigns)
  const { data: campaigns, error } = await supabaseAdmin
    .from('campaigns')
    .select(`*, leads (count)`)
    .order('created_at', { ascending: false });

  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>;

  // 2. LIVE STATS
  const total = campaigns?.length || 0;
  const active = campaigns?.filter(c => c.is_active).length || 0;
  const totalLeads = campaigns?.reduce((sum, c) => sum + (c.leads?.[0]?.count || 0), 0) || 0;

  // --- STYLES ---
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' };

  return (
    <div style={{animation: 'fadeIn 0.6s ease-out'}}>
      
      {/* 1. HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={{fontSize: '32px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px'}}>
            Mission <span style={{color: '#666'}}>Control</span>
          </h1>
          <div style={{display: 'flex', gap: '15px', marginTop: '12px'}}>
             <StatBadge label="ACTIVE SIGNALS" value={active} color="#00ff88" />
             <StatBadge label="TOTAL CAMPAIGNS" value={total} color="#fff" />
             <StatBadge label="TOTAL LEADS" value={totalLeads} color="#3b82f6" />
          </div>
        </div>
        
        <Link href="/admin/campaigns/create" style={{
          background: '#fff', color: '#000', padding: '14px 28px', borderRadius: '12px', 
          textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', 
          letterSpacing: '1px', boxShadow: '0 0 25px rgba(255,255,255,0.3)',
          transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>+</span> Deploy New
        </Link>
      </div>

      {/* 2. THE INTERACTIVE MANAGER */}
      <CampaignManager initialCampaigns={campaigns || []} />
      
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '800', color: '#888'}}>
       <span style={{color: color, fontSize: '14px', fontFamily: 'monospace'}}>{value}</span>
       <span style={{letterSpacing: '0.5px'}}>{label}</span>
    </div>
  );
}