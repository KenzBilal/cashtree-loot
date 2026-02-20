'use client';

import { useState } from 'react';
import WithdrawForm from './WithdrawForm';

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .wallet-container {
    animation: fadeIn 0.6s ease-out;
  }
  .metal-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .metal-card:hover {
    transform: scale(1.015);
    box-shadow: 0 30px 60px -12px rgba(0,0,0,0.9);
  }
  .tab-content {
    animation: slideUp 0.3s ease-out;
  }
`;

const neonGreen = '#00ff88';

export default function WalletInterface({ balance, lifetime, minLimit, upiId, userId, history }) {
  const [activeTab, setActiveTab] = useState('withdraw');

  const cardStyle = {
    background: 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)',
    borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
    marginBottom: '40px'
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="wallet-container">

        {/* 1. HERO HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingTop: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', color: neonGreen, fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
              Secure Vault
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px' }}>
              My Wallet
            </h1>
          </div>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,255,136,0.1)',
            border: `1px solid ${neonGreen}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', boxShadow: `0 0 15px ${neonGreen}44`
          }}>
            {/* wallet icon — SVG to avoid mojibake */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={neonGreen} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M16 12h2"/>
              <path d="M2 10h20"/>
            </svg>
          </div>
        </div>

        {/* 2. BALANCE CARD */}
        <div className="metal-card" style={cardStyle}>
          {/* Holographic glow */}
          <div style={{
            position: 'absolute', top: '-50%', right: '-50%', width: '300px', height: '300px',
            background: `radial-gradient(circle, ${neonGreen} 0%, transparent 70%)`,
            opacity: 0.15, filter: 'blur(80px)'
          }} />
          {/* Grid overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px', opacity: 0.5
          }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Lightning bolt — SVG */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill={neonGreen}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#555', letterSpacing: '2px' }}>
                CASHTREE WALLET
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <div style={{ fontSize: '11px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Current Balance
              </div>
              <div style={{
                fontSize: '56px', fontWeight: '900', color: '#fff', margin: '4px 0',
                textShadow: `0 0 30px ${neonGreen}44`, letterSpacing: '-2px', lineHeight: '1'
              }}>
                {/* Rupee sign as text — safe in JSX */}
                &#8377;{balance.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '9px', color: '#666', fontWeight: '700', textTransform: 'uppercase' }}>Card Holder</div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: '700', letterSpacing: '1px' }}>PROMOTER</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: '#666', fontWeight: '700', textTransform: 'uppercase', textAlign: 'right' }}>Total Earned</div>
                <div style={{ fontSize: '14px', color: neonGreen, fontWeight: '700', letterSpacing: '1px' }}>
                  &#8377;{lifetime.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TABS */}
        <div style={{ display: 'flex', background: '#111', padding: '4px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #222' }}>
          {['withdraw', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: activeTab === tab ? '#222' : 'transparent',
                color: activeTab === tab ? '#fff' : '#666',
                fontWeight: '800', fontSize: '12px', transition: 'all 0.2s', letterSpacing: '0.5px'
              }}
            >
              {tab === 'withdraw' ? 'REQUEST PAYOUT' : 'HISTORY'}
            </button>
          ))}
        </div>

        {/* 4. CONTENT */}
        <div className="tab-content" key={activeTab}>
          {activeTab === 'withdraw' ? (
            <WithdrawForm maxAmount={balance} defaultUpi={upiId} userId={userId} minLimit={minLimit} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history && history.length > 0 ? (
                history.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
                  No transactions yet.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

function TransactionItem({ tx }) {
  const statusColors = {
    approved: '#00ff88', paid: '#00ff88', pending: '#fbbf24', rejected: '#ef4444'
  };
  const color = statusColors[tx.status] || '#888';
  const dateStr = new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const isPaid = ['approved', 'paid'].includes(tx.status);

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `${color}11`, border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* Check or clock — SVG */}
          {isPaid ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          )}
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Withdrawal</div>
          <div style={{ fontSize: '11px', color: '#666' }}>{dateStr} &bull; {tx.status.toUpperCase()}</div>
        </div>
      </div>
      <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>
        -&#8377;{Number(tx.amount).toLocaleString('en-IN')}
      </div>
    </div>
  );
}