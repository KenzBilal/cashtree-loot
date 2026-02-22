import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Plus, BarChart3, Radio, Users } from 'lucide-react';
import CampaignManager from './CampaignManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mission Control | Admin',
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const headerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: '20px',
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
};

export default async function CampaignsPage() {
  const { data: campaigns, error } = await supabaseAdmin
    .from('campaigns')
    .select('*, leads(count)')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div style={{
        margin: '40px', padding: '24px',
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '16px', color: '#ef4444', textAlign: 'center',
      }}>
        <div style={{ fontWeight: '700', marginBottom: '6px' }}>System Error</div>
        <div style={{ fontSize: '13px', opacity: 0.7 }}>{error.message}</div>
      </div>
    );
  }

  const total  = campaigns?.length ?? 0;
  const active = campaigns?.filter(c => c.is_active).length ?? 0;

  // ✅ FIX: Supabase returns count as string — parseInt prevents "5"+"3"="53" bug
  const totalLeads = campaigns?.reduce((sum, c) => {
    return sum + parseInt(c.leads?.[0]?.count ?? 0, 10);
  }, 0) ?? 0;

  return (
    <div style={{ paddingBottom: '100px' }}>

      {/* ── HEADER ── */}
      <div style={headerStyle}>
        <div>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '900',
            color: '#fff', margin: '0 0 16px 0', letterSpacing: '-0.8px',
          }}>
            Mission <span style={{ color: '#444' }}>Control</span>
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <StatBadge label="Live"  value={active}     color="#00ff88" icon={<Radio size={12} />} />
            <StatBadge label="Total" value={total}      color="#aaaaaa" icon={<BarChart3 size={12} />} />
            <StatBadge label="Leads" value={totalLeads} color="#3b82f6" icon={<Users size={12} />} />
          </div>
        </div>

        <Link
          href="/admin/campaigns/create"
          style={{
            background: '#fff', color: '#000',
            padding: '14px 22px', borderRadius: '14px',
            textDecoration: 'none', fontSize: '12px', fontWeight: '900',
            textTransform: 'uppercase', letterSpacing: '1px',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 0 30px rgba(255,255,255,0.1)',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={16} strokeWidth={3} /> Deploy New
        </Link>
      </div>

      {/* ── CAMPAIGN MANAGER ── */}
      <CampaignManager initialCampaigns={campaigns ?? []} />
    </div>
  );
}

function StatBadge({ label, value, color, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '8px 14px', borderRadius: '12px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ color, display: 'flex' }}>{icon}</div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ color, fontSize: '15px', fontWeight: '900', marginBottom: '2px' }}>
          {value}
        </span>
        <span style={{ fontSize: '9px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {label}
        </span>
      </div>
    </div>
  );
}