import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const revalidate = 20;

export default async function DashboardPage() {

  // 1. AUTH
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

  // 2. DATA
  const [accountRes, configRes, leadsRes] = await Promise.all([
    supabase.from('accounts').select('username, ledger(amount, created_at)').eq('id', user.id).single(),
    supabase.from('system_config').select('notice_board').eq('id', 1).single(),
    supabase.from('leads').select('payout, status', { count: 'exact' }).eq('referred_by', user.id),
  ]);

  const account   = accountRes.data || { username: 'Promoter', ledger: [] };
  const config    = configRes.data  || {};
  const leads     = leadsRes.data   || [];
  const leadCount = leadsRes.count  || 0;

  // 3. LOGIC
  const totalBalance = account.ledger?.reduce((sum, l) => sum + l.amount, 0) || 0;
  const today        = new Date().toISOString().split('T')[0];
  const earnedToday  = account.ledger
    ?.filter(l => l.created_at.startsWith(today) && l.amount > 0)
    .reduce((sum, l) => sum + l.amount, 0) || 0;

  const liveLeads = leads.filter(l => l.status === 'Approved' || l.status === 'Pending').length;

  // Rank gamification
  let rank = { name: 'INITIATE', next: 1000, progress: 0 };
  if      (totalBalance > 10000) rank = { name: 'KINGPIN',   next: 0,     progress: 100 };
  else if (totalBalance > 5000)  rank = { name: 'SYNDICATE', next: 10000, progress: (totalBalance / 10000) * 100 };
  else if (totalBalance > 1000)  rank = { name: 'OPERATOR',  next: 5000,  progress: (totalBalance / 5000)  * 100 };
  else                           rank.progress = (totalBalance / 1000) * 100;

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/promoter?ref=${account.username}`;

  const NEON = '#00ff88';

  const glass = {
    background: 'rgba(8,8,12,0.8)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={{ paddingBottom: '120px' }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .db-page      { animation: fadeIn 0.45s ease-out; }
        .db-withdraw:hover { background: ${NEON} !important; color: #000 !important; border-color: ${NEON} !important; }
        .db-history:hover  { background: rgba(255,255,255,0.06) !important; }
        .db-quick:hover    { border-color: rgba(255,255,255,0.12) !important; background: rgba(255,255,255,0.04) !important; }
        .db-stat:hover     { border-color: rgba(0,255,136,0.2) !important; }
      `}</style>

      <div className="db-page">

        {/* ── HEADER ── */}
        <DashboardClient account={account} referralLink={referralLink} />

        {/* ── STAT CHIPS — like screenshot top bar ── */}
        <div style={{
          display: 'flex', gap: '10px', marginBottom: '24px',
          overflowX: 'auto', paddingBottom: '4px',
        }}>
          {[
            { icon: '📊', value: leadCount,  label: 'Total', color: '#fff' },
            { icon: '👥', value: leadCount,  label: 'Leads', color: '#3b82f6' },
          ].map((chip, i) => (
            <div
              key={i}
              className="db-stat"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px', borderRadius: '12px', flexShrink: 0,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                transition: 'border-color 0.18s',
              }}
            >
              <span style={{ fontSize: '13px' }}>{chip.icon}</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: chip.color, lineHeight: 1 }}>
                  {chip.value}
                </div>
                <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>
                  {chip.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── VAULT / BALANCE CARD ── */}
        <div style={{
          ...glass,
          background: 'linear-gradient(160deg, #0c0c0c 0%, #050505 100%)',
          marginBottom: '12px',
        }}>
          {/* Corner glow */}
          <div style={{
            position: 'absolute', top: '-40%', right: '-20%',
            width: '260px', height: '260px',
            background: `radial-gradient(circle, ${NEON} 0%, transparent 70%)`,
            opacity: 0.08, filter: 'blur(60px)', pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Rank chip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                fontSize: '10px', color: '#000', background: NEON,
                padding: '4px 10px', borderRadius: '6px',
                fontWeight: '900', letterSpacing: '1px',
                boxShadow: `0 0 10px ${NEON}44`,
              }}>
                {rank.name}
              </div>
              <div style={{ fontSize: '10px', color: '#333', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Lifetime Earnings
              </div>
            </div>

            {/* Balance */}
            <div style={{
              fontSize: 'clamp(38px, 8vw, 52px)', fontWeight: '900', color: '#fff',
              letterSpacing: '-2px', lineHeight: 1, margin: '0 0 20px',
              textShadow: `0 0 40px ${NEON}18`,
            }}>
              ₹{totalBalance.toLocaleString('en-IN')}
            </div>

            {/* Progress bar */}
            {rank.next > 0 && (
              <div style={{ marginBottom: '22px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '9px', color: '#333', fontWeight: '800',
                  textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px',
                }}>
                  <span>Progress to next rank</span>
                  <span style={{ color: NEON }}>{Math.round(rank.progress)}%</span>
                </div>
                <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${rank.progress}%`, height: '100%',
                    background: NEON, boxShadow: `0 0 6px ${NEON}`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Link
                href="/dashboard/wallet"
                className="db-withdraw"
                style={{
                  background: '#fff', color: '#000',
                  padding: '12px', borderRadius: '11px',
                  textAlign: 'center', fontWeight: '900',
                  fontSize: '12px', textDecoration: 'none',
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                  border: '1px solid #fff',
                  transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                }}
              >
                Withdraw
              </Link>
              <Link
                href="/dashboard/leads"
                className="db-history"
                style={{
                  background: 'transparent', color: '#888',
                  padding: '12px', borderRadius: '11px',
                  textAlign: 'center', fontWeight: '700',
                  fontSize: '12px', textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                  transition: 'background 0.2s',
                }}
              >
                History
              </Link>
            </div>
          </div>
        </div>

        {/* ── PERFORMANCE HUD ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div style={{ ...glass, padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', lineHeight: 1, marginBottom: '8px' }}>
              {leadCount}
            </div>
            <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Total Leads
            </div>
          </div>

          <div style={{ ...glass, padding: '18px', textAlign: 'center' }}>
            <div style={{
              fontSize: '32px', fontWeight: '900', color: NEON,
              lineHeight: 1, marginBottom: '8px',
              textShadow: `0 0 16px ${NEON}44`,
            }}>
              +₹{earnedToday.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Earned Today
            </div>
          </div>
        </div>

        {/* ── NOTICE BOARD ── */}
        {config.notice_board && (
          <div style={{
            padding: '14px 16px', marginBottom: '16px', borderRadius: '14px',
            background: 'rgba(251,191,36,0.04)',
            border: '1px solid rgba(251,191,36,0.12)',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
            <div>
              <div style={{
                fontSize: '9px', color: '#fbbf24', fontWeight: '800',
                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px',
              }}>
                Announcement
              </div>
              <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.55' }}>
                {config.notice_board}
              </div>
            </div>
          </div>
        )}

        {/* ── QUICK ACTIONS ── */}
        <div>
          <div style={{
            fontSize: '9px', color: '#2e2e2e', fontWeight: '800',
            textTransform: 'uppercase', letterSpacing: '2px',
            margin: '0 0 10px 2px',
          }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
            <QuickAction icon="🔥" label="Start Earning" link="/dashboard/campaigns" />
            <QuickAction icon="👑" label="My Empire"     link="/dashboard/team" />
            <QuickAction icon="💳" label="Wallet"        link="/dashboard/wallet" />
            <QuickAction icon="⚙️" label="Settings"      link="/dashboard/profile" />
          </div>
        </div>

      </div>
    </div>
  );
}

function QuickAction({ icon, label, link }) {
  return (
    <Link
      href={link}
      className="db-quick"
      style={{
        minWidth: '90px', flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        padding: '14px 10px', borderRadius: '14px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        textDecoration: 'none',
        transition: 'border-color 0.18s, background 0.18s',
      }}
    >
      <div style={{ fontSize: '22px' }}>{icon}</div>
      <span style={{ fontSize: '10px', color: '#555', fontWeight: '700', textAlign: 'center', lineHeight: 1.3 }}>
        {label}
      </span>
    </Link>
  );
}