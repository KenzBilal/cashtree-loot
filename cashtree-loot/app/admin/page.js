import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Target, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  if (!token) redirect('/login');

  const [
    { count: totalUsers },
    { count: totalLeads },
    { count: pendingCount },
    { data: pendingLeads }
  ] = await Promise.all([
    supabaseAdmin.from('accounts').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin
      .from('leads')
      .select('*, campaigns(title, payout_amount), accounts(username, phone)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ 
        marginBottom: '48px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        gap: '20px' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: 'clamp(24px, 4vw, 32px)', 
            fontWeight: '800', 
            letterSpacing: '-1px', 
            margin: '0 0 8px 0', 
            color: '#fff' 
          }}>
            Dashboard Overview
          </h1>
          <p style={{ color: '#888', fontSize: '14px', fontWeight: '500' }}>
            Network performance and pending approvals.
          </p>
        </div>
        <div style={{ 
          fontSize: '12px', color: '#666', fontWeight: '600', 
          border: '1px solid #222', padding: '8px 16px', borderRadius: '100px',
          background: 'rgba(255,255,255,0.02)'
        }}>
          Live System
        </div>
      </div>

      {/* STATS GRID */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '24px', 
        marginBottom: '48px' 
      }}>
        <StatsCard 
          title="Total Promoters" 
          value={totalUsers || 0} 
          icon={<Users size={20} />} 
          color="#3b82f6" 
        />
        <StatsCard 
          title="Total Conversions" 
          value={totalLeads || 0} 
          icon={<Target size={20} />} 
          color="#8b5cf6" 
        />
        <StatsCard 
          title="Action Required" 
          value={pendingCount || 0} 
          icon={<AlertCircle size={20} />} 
          color="#fbbf24" 
          isCritical={pendingCount > 0}
          sub="Pending Reviews"
        />
      </div>

      {/* PENDING APPROVALS SECTION */}
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
          <Clock size={18} color="#00ff88" />
          Pending Approvals
        </h2>
        {pendingCount > 0 && (
          <Link href="/admin/leads" style={{ 
            fontSize: '13px', color: '#00ff88', textDecoration: 'none', 
            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 12px', borderRadius: '8px', background: 'rgba(0,255,136,0.05)',
            border: '1px solid rgba(0,255,136,0.1)'
          }}>
            View Queue <ArrowRight size={14} />
          </Link>
        )}
      </div>

      <div style={{
        background: '#0a0a0f',
        border: '1px solid #222',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }}>
        {pendingLeads && pendingLeads.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Promoter</th>
                  <th style={thStyle}>Campaign</th>
                  <th style={thStyle}>Meta Data</th>
                  <th style={{...thStyle, textAlign: 'right'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeads.map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #161616', transition: 'background 0.1s' }} className="hover:bg-white/5">
                    
                    {/* Date */}
                    <td style={tdStyle}>
                      <div style={{ color: '#ddd', fontWeight: '500' }}>{new Date(lead.created_at).toLocaleDateString()}</div>
                      <div style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>{new Date(lead.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    
                    {/* Promoter */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a1a', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', border: '1px solid #222' }}>
                          {lead.accounts?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span style={{ color: '#eee', fontWeight: '500' }}>{lead.accounts?.username || 'Unknown'}</span>
                      </div>
                    </td>
                    
                    {/* Campaign */}
                    <td style={tdStyle}>
                      <div style={{ color: '#fff', fontWeight: '500' }}>{lead.campaigns?.title}</div>
                      <div style={{ color: '#00ff88', fontSize: '11px', fontWeight: '600', marginTop: '2px' }}>
                        ₹{lead.campaigns?.payout_amount} Payout
                      </div>
                    </td>

                    {/* Meta */}
                    <td style={tdStyle}>
                      {lead.metadata?.user_phone ? (
                        <code style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #222', padding: '4px 8px', borderRadius: '6px', color: '#888', fontSize: '11px', fontFamily: 'monospace' }}>
                          {lead.metadata.user_phone}
                        </code>
                      ) : (
                        <span style={{color: '#444'}}>-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 10px', borderRadius: '20px', 
                        background: 'rgba(234, 179, 8, 0.08)', color: '#fbbf24', 
                        border: '1px solid rgba(234, 179, 8, 0.15)',
                        fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px'
                      }}>
                        PENDING
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

// --- SUB COMPONENTS FOR CLEAN CODE ---

function StatsCard({ title, value, icon, color, isCritical, sub }) {
  return (
    <div style={{ 
      background: '#0a0a0f',
      border: isCritical ? `1px solid ${color}40` : '1px solid #222',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: isCritical ? `0 0 40px ${color}10` : 'none'
    }}>
      {/* Icon Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div style={{ 
          padding: '10px', borderRadius: '12px', 
          background: `${color}15`, color: color 
        }}>
          {icon}
        </div>
      </div>
      
      {/* Value */}
      <div style={{ fontSize: '32px', fontWeight: '800', color: isCritical ? color : '#fff', letterSpacing: '-1px' }}>
        {value}
      </div>
      
      {/* Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>{title}</span>
        {sub && <span style={{ fontSize: '11px', color: color }}>{sub}</span>}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: '64px 20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
      <div style={{ 
        width: '64px', height: '64px', borderRadius: '50%', 
        background: '#111', border: '1px solid #222',
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        margin: '0 auto 20px', color: '#333' 
      }}>
        <CheckCircle2 size={32} />
      </div>
      <h3 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>All Caught Up</h3>
      <p style={{ color: '#555', fontSize: '13px', maxWidth: '280px', margin: '0 auto' }}>
        No pending leads requiring review.
      </p>
    </div>
  );
}

// Styles
const thStyle = {
  padding: '16px 24px', textAlign: 'left', color: '#555', 
  fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'
};

const tdStyle = {
  padding: '16px 24px'
};