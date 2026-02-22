'use client';

import { useState } from 'react';
import PayoutRow from './payout-row';

const NEON = '#00ff88';

export default function FinanceInterface({ queue, stats, markLeadAsPaid, processWithdrawal }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = queue.filter(item => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(s) ||
      item.upi_id?.toLowerCase().includes(s) ||
      String(item.amount).includes(s) ||
      item.method?.toLowerCase().includes(s)
    );
  });

  return (
    <div style={{ paddingBottom: '100px' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        .finance-search:focus { border-color: #333 !important; }
        .finance-search::placeholder { color: #333; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'flex-end', gap: '20px', marginBottom: '28px',
        paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(24px,4vw,32px)', fontWeight: '900', color: '#fff',
            margin: '0 0 4px 0', letterSpacing: '-0.8px',
          }}>
            Finance <span style={{ color: '#444' }}>Control</span>
          </h1>
          <p style={{
            margin: 0, fontSize: '11px', fontWeight: '700',
            color: '#444', textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            Pending Payouts &amp; Withdrawals
          </p>
        </div>

        <input
          type="text"
          placeholder="Search name, UPI, amount…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="finance-search"
          style={{
            background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px',
            padding: '12px 16px', color: '#fff', fontSize: '13px', outline: 'none',
            width: 'clamp(200px,100%,300px)', transition: 'border-color 0.18s', fontWeight: '600',
          }}
        />
      </div>

      {/* ── STATS ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
        gap: '12px', marginBottom: '28px',
      }}>
        <StatCard
          label="Total Liability"
          value={`₹${stats.liability.toLocaleString('en-IN')}`}
          sub={`${stats.count} pending`}
          color="#facc15"
        />
        <StatCard
          label="User Payouts"
          value={stats.userCount}
          sub="Direct leads"
          color="#3b82f6"
        />
        <StatCard
          label="Promoter Requests"
          value={stats.promoterCount}
          sub="Withdrawals"
          color="#a855f7"
        />
        {/* FIX: show flagged withdrawals where balance < amount */}
        {stats.flaggedCount > 0 && (
          <StatCard
            label="⚠ Insufficient Funds"
            value={stats.flaggedCount}
            sub="Review before paying"
            color="#ef4444"
          />
        )}
      </div>

      {/* ── TABLE ── */}
      <div style={{
        background: '#050505', border: '1px solid #1a1a1a',
        borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
      }}>
        {/* Desktop header */}
        <div
          className="finance-desktop-header"
          style={{
            display: 'grid', gridTemplateColumns: '120px 1fr 90px 1fr auto',
            padding: '12px 20px', background: '#0a0a0a',
            borderBottom: '1px solid #1a1a1a', fontSize: '9px',
            color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px',
          }}
        >
          <style>{`
            .finance-desktop-header { display: none !important; }
            @media (min-width: 640px) { .finance-desktop-header { display: grid !important; } }
          `}</style>
          <div>Date</div>
          <div>Beneficiary</div>
          <div>Type</div>
          <div>Banking</div>
          <div style={{ textAlign: 'right' }}>Action</div>
        </div>

        <div>
          {filteredData.length > 0 ? (
            filteredData.map((item, i) => (
              <PayoutRow
                key={`${item.type}-${item.id}`}
                item={item}
                index={i}
                // FIX: individual props instead of actions object
                markLeadAsPaid={markLeadAsPaid}
                processWithdrawal={processWithdrawal}
              />
            ))
          ) : (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
              <div style={{ color: '#444', fontSize: '13px', fontWeight: '700' }}>
                All caught up — no pending payments.
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredData.length > 0 && (
        <div style={{ marginTop: '14px', textAlign: 'right', fontSize: '10px', color: '#333', fontWeight: '700' }}>
          {filteredData.length} item{filteredData.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#0a0a0a', border: '1px solid #1a1a1a',
      borderRadius: '16px', padding: '18px 20px', animation: 'fadeIn 0.4s ease-out',
    }}>
      <div style={{ fontSize: '9px', fontWeight: '800', color: '#444', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: '900', color: '#fff', marginBottom: '4px', letterSpacing: '-0.5px' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', fontWeight: '600', color }}>{sub}</div>
    </div>
  );
}