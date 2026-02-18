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
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 0;

// Master key client — bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Style constants outside the component (not re-created on every render) ──
const thStyle = {
  padding: '14px 24px',
  textAlign: 'left',
  color: '#444',
  fontSize: '10px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '16px 24px',
  borderBottom: '1px solid #111',
  verticalAlign: 'middle',
};

const tableCard = {
  background: '#0a0a0f',
  border: '1px solid #1a1a1a',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
};

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;

  // Safety net — layout already guards, but belt-and-suspenders
  if (!token) redirect('/login');

  // Parallel data fetching for speed
  const [
    { count: totalUsers },
    { count: totalLeads },
    { count: pendingCount },
    { data: pendingLeads },
  ] = await Promise.all([
    supabaseAdmin.from('accounts').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabaseAdmin
      .from('leads')
      .select('*, campaigns(title, payout_amount), accounts(username)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: '"Inter", sans-serif',
      color: '#fff',
    }}>

      {/* Row hover style — plain CSS, no Tailwind required */}
      <style>{`
        .leads-row:hover { background: rgba(255, 255, 255, 0.025); }
      `}</style>

      {/* ── 1. HEADER ── */}
      <div style={{
        marginBottom: '48px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '20px',
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(22px, 4vw, 30px)',
            fontWeight: '800',
            letterSpacing: '-0.8px',
            margin: '0 0 8px 0',
            color: '#fff',
          }}>
            Dashboard Overview
          </h1>
          <p style={{ color: '#555', fontSize: '14px', fontWeight: '500', margin: 0 }}>
            Network performance and pending approvals.
          </p>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#444',
          fontWeight: '600',
          border: '1px solid #1c1c1c',
          padding: '8px 16px',
          borderRadius: '100px',
          background: 'rgba(255,255,255,0.02)',
          whiteSpace: 'nowrap',
        }}>
          Live System
        </div>
      </div>

      {/* ── 2. STATS GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '48px',
      }}>
        <StatsCard
          title="Total Promoters"
          value={totalUsers ?? 0}
          icon={<Users size={20} />}
          color="#3b82f6"
        />
        <StatsCard
          title="Total Conversions"
          value={totalLeads ?? 0}
          icon={<Target size={20} />}
          color="#8b5cf6"
        />
        <StatsCard
          title="Action Required"
          value={pendingCount ?? 0}
          icon={<AlertCircle size={20} />}
          color="#fbbf24"
          isCritical={pendingCount > 0}
          sub="Pending Reviews"
        />
      </div>

      {/* ── 3. TABLE HEADER ── */}
      <div style={{
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <h2 style={{
          fontSize: '17px',
          fontWeight: '700',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fff',
        }}>
          <Clock size={17} color="#00ff88" style={{ flexShrink: 0 }} />
          Pending Approvals
        </h2>
        {pendingCount > 0 && (
          <Link href="/admin/leads" style={{
            fontSize: '13px',
            color: '#00ff88',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: 'rgba(0,255,136,0.05)',
            border: '1px solid rgba(0,255,136,0.1)',
            whiteSpace: 'nowrap',
          }}>
            View Queue <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* ── 4. TABLE ── */}
      <div style={tableCard}>
        {pendingLeads && pendingLeads.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              minWidth: '600px',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Promoter</th>
                  <th style={thStyle}>Campaign</th>
                  <th style={thStyle}>Metadata</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeads.map((lead) => (
                  <tr key={lead.id} className="leads-row" style={{ transition: 'background 0.15s' }}>

                    {/* Date */}
                    <td style={tdStyle}>
                      <div style={{ color: '#ddd', fontWeight: '500' }}>
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ color: '#444', fontSize: '11px', marginTop: '2px' }}>
                        {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Promoter */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                          border: '1px solid #2a2a3e',
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          flexShrink: 0,
                        }}>
                          {lead.accounts?.username?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <span style={{ color: '#ddd', fontWeight: '500' }}>
                          {lead.accounts?.username ?? 'Unknown'}
                        </span>
                      </div>
                    </td>

                    {/* Campaign */}
                    <td style={tdStyle}>
                      <div style={{ color: '#fff', fontWeight: '500' }}>
                        {lead.campaigns?.title ?? '—'}
                      </div>
                      {lead.campaigns?.payout_amount != null && (
                        <div style={{ color: '#00ff88', fontSize: '11px', fontWeight: '600', marginTop: '2px' }}>
                          ₹{lead.campaigns.payout_amount} Payout
                        </div>
                      )}
                    </td>

                    {/* Metadata */}
                    <td style={tdStyle}>
                      {lead.metadata?.user_phone ? (
                        <code style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid #1c1c1c',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          color: '#777',
                          fontSize: '11px',
                          fontFamily: '"Fira Code", "Courier New", monospace',
                        }}>
                          {lead.metadata.user_phone}
                        </code>
                      ) : (
                        <span style={{ color: '#333' }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: 'rgba(234, 179, 8, 0.08)',
                        color: '#fbbf24',
                        border: '1px solid rgba(234, 179, 8, 0.15)',
                        fontSize: '10px',
                        fontWeight: '700',
                        letterSpacing: '0.8px',
                        whiteSpace: 'nowrap',
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

// ── Sub-components ──

function StatsCard({ title, value, icon, color, isCritical = false, sub }) {
  return (
    <div style={{
      background: '#0a0a0f',
      border: isCritical ? `1px solid ${color}40` : '1px solid #1a1a1a',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: isCritical
        ? `0 0 40px ${color}0d, 0 4px 24px rgba(0,0,0,0.4)`
        : '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'inline-flex',
          padding: '10px',
          borderRadius: '12px',
          background: `${color}18`,
          color,
        }}>
          {icon}
        </div>
      </div>

      <div style={{
        fontSize: '32px',
        fontWeight: '800',
        color: isCritical ? color : '#fff',
        letterSpacing: '-1px',
        lineHeight: 1,
      }}>
        {value}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
        gap: '8px',
      }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>
          {title}
        </span>
        {sub && (
          <span style={{ fontSize: '11px', color, fontWeight: '600' }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: '64px 20px', textAlign: 'center' }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'rgba(0, 255, 136, 0.06)',
        border: '1px solid rgba(0, 255, 136, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <CheckCircle2 size={28} color="#00ff88" />
      </div>
      <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: '16px', fontWeight: '700' }}>
        All Caught Up
      </h3>
      <p style={{ color: '#444', fontSize: '13px', maxWidth: '260px', margin: '0 auto', lineHeight: 1.6 }}>
        No pending leads requiring review right now.
      </p>
    </div>
  );
}
