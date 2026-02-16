import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Target, 
  Clock, 
  ArrowRight, 
  MoreHorizontal, 
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// ⚡ FORCE DYNAMIC: Ensure admin always sees fresh data
export const revalidate = 0;

// 🔐 MASTER KEY CLIENT (Bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  if (!token) redirect('/login');

  // 1. DATA FETCHING (Parallel for Speed)
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

  // --- 10/10 STYLING CONSTANTS ---
  const glassCard = {
    background: 'rgba(20, 20, 25, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
  };

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#050505', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. HEADER SECTION */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px', margin: '0 0 8px 0', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Dashboard Overview
          </h1>
          <p style={{ color: '#666', fontSize: '15px', fontWeight: '500' }}>
            Real-time network performance and pending tasks.
          </p>
        </div>
        <div style={{ fontSize: '13px', color: '#444', fontWeight: '600', border: '1px solid #222', padding: '8px 16px', borderRadius: '20px' }}>
          Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* 2. STATS GRID (Neon Glow Effects) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        
        {/* Card 1: Users */}
        <div style={{ ...glassCard, padding: '24px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.1 }}>
            <Users size={64} color="#3b82f6" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: '#3b82f6' }}>
              <Users size={20} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Promoters</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff' }}>
            {totalUsers || 0}
          </div>
        </div>

        {/* Card 2: Leads */}
        <div style={{ ...glassCard, padding: '24px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.1 }}>
            <Target size={64} color="#8b5cf6" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px', color: '#8b5cf6' }}>
              <Target size={20} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Conversions</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff' }}>
            {totalLeads || 0}
          </div>
        </div>

        {/* Card 3: Pending Action (Critical) */}
        <div style={{ 
          ...glassCard, 
          padding: '24px', 
          border: pendingCount > 0 ? '1px solid rgba(234, 179, 8, 0.4)' : glassCard.border,
          boxShadow: pendingCount > 0 ? '0 0 30px rgba(234, 179, 8, 0.1)' : glassCard.boxShadow
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: pendingCount > 0 ? 'rgba(234, 179, 8, 0.2)' : '#222', borderRadius: '10px', color: pendingCount > 0 ? '#fbbf24' : '#666' }}>
              <AlertCircle size={20} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: pendingCount > 0 ? '#fbbf24' : '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action Required</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: pendingCount > 0 ? '#fbbf24' : '#fff' }}>
            {pendingCount || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Pending reviews waiting</div>
        </div>
      </div>

      {/* 3. TABLE SECTION */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="#00ff88" />
          Recent Pending Approvals
        </h2>
        {pendingCount > 0 && (
          <Link href="/admin/leads" style={{ fontSize: '13px', color: '#00ff88', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
            View All <ArrowRight size={14} />
          </Link>
        )}
      </div>

      <div style={glassCard}>
        {pendingLeads && pendingLeads.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #222', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Promoter</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Campaign</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Evidence</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                  
                  {/* Date */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ color: '#fff', fontWeight: '500' }}>{new Date(lead.created_at).toLocaleDateString()}</div>
                    <div style={{ color: '#444', fontSize: '12px' }}>{new Date(lead.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  
                  {/* Promoter */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#222', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                        {lead.accounts?.username?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ color: '#ddd' }}>{lead.accounts?.username}</span>
                    </div>
                  </td>
                  
                  {/* Campaign */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ color: '#fff' }}>{lead.campaigns?.title}</div>
                    <div style={{ color: '#00ff88', fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                      + ₹{lead.campaigns?.payout_amount}
                    </div>
                  </td>

                  {/* Evidence / Data */}
                  <td style={{ padding: '16px 24px' }}>
                    <code style={{ background: '#111', border: '1px solid #222', padding: '4px 8px', borderRadius: '6px', color: '#888', fontSize: '12px', fontFamily: 'monospace' }}>
                      {lead.metadata?.user_phone || "No Metadata"}
                    </code>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', borderRadius: '20px', 
                      background: 'rgba(234, 179, 8, 0.1)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.2)',
                      fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px'
                    }}>
                      <Clock size={12} /> PENDING
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '80px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #222' }}>
              <CheckCircle2 size={30} color="#222" />
            </div>
            <h3 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '18px' }}>All Caught Up</h3>
            <p style={{ color: '#666', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
              Great job! There are no pending leads requiring your attention right now.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}