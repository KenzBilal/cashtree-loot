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

  // FIX: handle auth error instead of crashing
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/login');

  // 2. DATA — FIX: separate ledger queries to avoid pulling entire history
  const [accountRes, configRes, leadsRes, balanceRes, todayEarningsRes] = await Promise.all([
    supabase.from('accounts').select('username').eq('id', user.id).single(),
    supabase.from('system_config').select('notice_board').eq('id', 1).single(),
    supabase.from('leads').select('status', { count: 'exact' }).eq('referred_by', user.id),
    // FIX: get total balance from account_balances view (net balance)
    supabase.from('account_balances').select('available_balance').eq('account_id', user.id).single(),
    // FIX: gross earnings = only positive ledger entries ever
    supabase.from('ledger')
      .select('amount')
      .eq('account_id', user.id)
      .gt('amount', 0),
  ]);

  const account    = accountRes.data  || { username: 'Promoter' };
  const config     = configRes.data   || {};
  const leads      = leadsRes.data    || [];
  const leadCount  = leadsRes.count   || 0;

  // FIX: available balance for display (net — what they can withdraw)
  const availableBalance = Number(balanceRes.data?.available_balance ?? 0);

  // FIX: gross lifetime earnings for rank (never goes down on withdrawal)
  const allEarnings = todayEarningsRes.data || [];
  const lifetimeEarnings = allEarnings.reduce((sum, l) => sum + Number(l.amount), 0);

  // FIX: today's earnings using IST offset (UTC+5:30)
  const nowIST    = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const todayIST  = nowIST.toISOString().split('T')[0]; // YYYY-MM-DD in IST
  // Re-query just today's positive ledger entries for IST accuracy
  const { data: todayLedger } = await supabase
    .from('ledger')
    .select('amount, created_at')
    .eq('account_id', user.id)
    .gt('amount', 0)
    .gte('created_at', `${todayIST}T00:00:00+05:30`);

  const earnedToday = (todayLedger || []).reduce((sum, l) => sum + Number(l.amount), 0);

  // FIX: use lowercase status
  const liveLeads = leads.filter(l => l.status === 'approved' || l.status === 'pending').length;

  // FIX: rank based on lifetimeEarnings (gross), not net balance
  let rank = { name: 'INITIATE', next: 1000, progress: 0 };
  if      (lifetimeEarnings > 10000) rank = { name: 'KINGPIN',   next: 0,     progress: 100 };
  else if (lifetimeEarnings > 5000)  rank = { name: 'SYNDICATE', next: 10000, progress: (lifetimeEarnings / 10000) * 100 };
  else if (lifetimeEarnings > 1000)  rank = { name: 'OPERATOR',  next: 5000,  progress: (lifetimeEarnings / 5000)  * 100 };
  else                               rank.progress = (lifetimeEarnings / 1000) * 100;

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
        <DashboardClient account={account} />

        {/* ── STAT CHIPS — FIX: show meaningful different values ── */}
        <div style={{
          display: 'flex', gap: '10px', marginBottom: '24px',
          overflowX: 'auto', paddingBottom: '4px',
        }}>
          {[
            { icon: '◈', value: leadCount,  label: 'Total Leads', color: '#fff' },
            { icon: '◉', value: liveLeads,  label: 'Active',      color: '#00ff88' },
            { icon: '◎', value: `+₹${earnedToday.toLocaleString('en-IN')}`, label: 'Today', color: '#facc15' },
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
              <span style={{ fontSize: '11px', color: chip.color, fontWeight: '900' }}>{chip.icon}</span>
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
              {/* FIX: label is now "Available Balance" — accurate */}
              <div style={{ fontSize: '10px', color: '#333', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Available Balance
              </div>
            </div>

            {/* FIX: show availableBalance (withdrawable), not net ledger sum */}
            <div style={{
              fontSize: 'clamp(38px, 8vw, 52px)', fontWeight: '900', color: '#fff',
              letterSpacing: '-2px', lineHeight: 1, margin: '0 0 8px',
              textShadow: `0 0 40px ${NEON}18`,
            }}>
              ₹{availableBalance.toLocaleString('en-IN')}
            </div>

            {/* FIX: show lifetime earnings as secondary line */}
            <div style={{ fontSize: '11px', color: '#333', fontWeight: '700', marginBottom: '18px' }}>
              Lifetime: ₹{lifetimeEarnings.toLocaleString('en-IN')}
            </div>

            {/* Progress bar — FIX: based on lifetimeEarnings */}
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
            <div style={{
              width: '16px', height: '16px', borderRadius: '4px',
              background: 'rgba(251,191,36,0.15)',
              border: '1px solid rgba(251,191,36,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: '1px',
            }}>
              <span style={{ fontSize: '9px', color: '#fbbf24', fontWeight: '900' }}>!</span>
            </div>
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

        {/* ── QUICK ACTIONS — FIX: no emojis, use icon style matching sidebar ── */}
        <div>
          <div style={{
            fontSize: '9px', color: '#2e2e2e', fontWeight: '800',
            textTransform: 'uppercase', letterSpacing: '2px',
            margin: '0 0 10px 2px',
          }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
            <QuickAction label="Start Earning" sub="Campaigns"  link="/dashboard/campaigns" />
            <QuickAction label="My Network"    sub="Team"       link="/dashboard/team" />
            <QuickAction label="Wallet"        sub="Withdraw"   link="/dashboard/wallet" />
            <QuickAction label="Settings"      sub="Profile"    link="/dashboard/profile" />
          </div>
        </div>

      </div>
    </div>
  );
}

function QuickAction({ label, sub, link }) {
  const NEON = '#00ff88';
  return (
    <Link
      href={link}
      className="db-quick"
      style={{
        minWidth: '90px', flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        padding: '14px 10px', borderRadius: '14px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        textDecoration: 'none',
        transition: 'border-color 0.18s, background 0.18s',
      }}
    >
      {/* Dot indicator instead of emoji */}
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px',
        background: 'rgba(0,255,136,0.06)',
        border: '1px solid rgba(0,255,136,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: NEON, opacity: 0.7,
          boxShadow: `0 0 6px ${NEON}`,
        }} />
      </div>
      <span style={{ fontSize: '10px', color: '#aaa', fontWeight: '700', textAlign: 'center', lineHeight: 1.2 }}>
        {label}
      </span>
      <span style={{ fontSize: '9px', color: '#333', fontWeight: '600', textAlign: 'center' }}>
        {sub}
      </span>
    </Link>
  );
}