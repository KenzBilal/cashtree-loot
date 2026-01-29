import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Plus, BarChart3, Radio, Users } from 'lucide-react';
import CampaignManager from './CampaignManager'; // ✅ The interactive manager

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mission Control | Admin',
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function CampaignsPage() {
  // 1. FETCH DATA (Admin sees ALL campaigns + Lead Counts)
  // We use supabase count logic to get the number of leads per campaign efficiently
  const { data: campaigns, error } = await supabaseAdmin
    .from('campaigns')
    .select(`*, leads(count)`)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 border border-red-500/20 bg-red-500/10 rounded-xl m-10">
        <h3 className="font-bold">System Error</h3>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  // 2. CALCULATE LIVE STATS
  const total = campaigns?.length || 0;
  const active = campaigns?.filter(c => c.is_active).length || 0;
  
  // Safely sum up the leads (Supabase returns leads: [{ count: 5 }] usually)
  const totalLeads = campaigns?.reduce((sum, c) => {
    const count = c.leads?.[0]?.count || 0;
    return sum + count;
  }, 0) || 0;

  // --- STYLES ---
  const headerStyle = { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '30px',
    paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)'
  };

  return (
    <div style={{animation: 'fadeIn 0.6s ease-out', paddingBottom: '100px'}}>
      
      {/* 1. HEADER & STATS */}
      <div style={headerStyle}>
        <div>
          <h1 style={{fontSize: '32px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px'}}>
            Mission <span style={{color: '#666'}}>Control</span>
          </h1>
          
          <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
             <StatBadge 
                label="LIVE SIGNALS" 
                value={active} 
                color="#00ff88" 
                icon={<Radio size={12} />} 
                bg="rgba(0, 255, 136, 0.1)"
             />
             <StatBadge 
                label="TOTAL CAMPAIGNS" 
                value={total} 
                color="#fff" 
                icon={<BarChart3 size={12} />} 
                bg="rgba(255, 255, 255, 0.05)"
             />
             <StatBadge 
                label="TOTAL LEADS" 
                value={totalLeads} 
                color="#3b82f6" 
                icon={<Users size={12} />} 
                bg="rgba(59, 130, 246, 0.1)"
             />
          </div>
        </div>
        
        {/* NEW CAMPAIGN BUTTON */}
        <Link href="/admin/campaigns/create" style={{
          background: '#fff', color: '#000', padding: '16px 24px', borderRadius: '16px', 
          textDecoration: 'none', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', 
          letterSpacing: '1px', boxShadow: '0 0 30px rgba(255,255,255,0.15)',
          transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Plus size={18} strokeWidth={3} /> Deploy New
        </Link>
      </div>

      {/* 2. THE INTERACTIVE MANAGER */}
      <CampaignManager initialCampaigns={campaigns || []} />
      
    </div>
  );
}

// 10/10 Glass Pill Component for Stats
function StatBadge({ label, value, color, icon, bg }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', 
      padding: '8px 16px', borderRadius: '12px',
      background: bg, border: `1px solid ${color}20` // Adds subtle border using hex transparency
    }}>
       <div style={{color: color, display: 'flex'}}>{icon}</div>
       <div style={{display: 'flex', flexDirection: 'column', lineHeight: '1'}}>
          <span style={{color: color, fontSize: '15px', fontWeight: '900', marginBottom: '2px'}}>{value}</span>
          <span style={{fontSize: '9px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase'}}>{label}</span>
       </div>
    </div>
  );
}