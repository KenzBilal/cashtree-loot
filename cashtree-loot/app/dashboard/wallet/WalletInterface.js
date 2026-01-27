'use client';

import { useState } from 'react';
import WithdrawForm from './WithdrawForm';

export default function WalletInterface({ balance, lifetime, minLimit, upiId, userId, history }) {
  const [activeTab, setActiveTab] = useState('withdraw'); // withdraw | history

  // --- 100/100 STYLES ---
  const containerStyle = { animation: 'fadeIn 0.6s ease-out' };
  const neonGreen = '#00ff88';

  // THE METAL CARD (CSS Gradients)
  const cardStyle = {
    background: 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)',
    borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
    transform: 'perspective(1000px) rotateX(2deg)',
    transition: 'transform 0.3s ease',
    marginBottom: '40px'
  };

  return (
    <div style={containerStyle}>

      {/* 1. HERO HEADER */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingTop: '10px'}}>
        <div>
           <div style={{fontSize: '11px', color: neonGreen, fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px'}}>
             Secure Vault
           </div>
           <h1 style={{fontSize: '32px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px'}}>
             My Wallet
           </h1>
        </div>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,255,136,0.1)', 
          border: `1px solid ${neonGreen}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', boxShadow: `0 0 15px ${neonGreen}44`
        }}>
          💳
        </div>
      </div>

      {/* 2. THE "METAL" BALANCE CARD */}
      <div className="metal-card" style={cardStyle}>
         {/* Holographic Shine */}
         <div style={{position:'absolute', top:'-50%', right:'-50%', width:'300px', height:'300px', background:`radial-gradient(circle, ${neonGreen} 0%, transparent 70%)`, opacity:0.15, filter:'blur(80px)'}}></div>
         <div style={{
            position:'absolute', inset:0, 
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px', opacity: 0.5
         }}></div>

         <div style={{position: 'relative', zIndex: 2}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
               <div style={{fontSize: '24px'}}>⚡</div>
               <div style={{fontSize: '14px', fontFamily: 'monospace', color: '#666', letterSpacing: '2px'}}>**** **** 8842</div>
            </div>

            <div style={{marginTop: '30px'}}>
               <div style={{fontSize: '11px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>Current Balance</div>
               <div style={{
                 fontSize: '56px', fontWeight: '900', color: '#fff', margin: '4px 0', 
                 textShadow: `0 0 30px ${neonGreen}44`, letterSpacing: '-2px', lineHeight: '1'
               }}>
                 ₹{balance.toLocaleString()}
               </div>
            </div>

            <div style={{marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
               <div>
                  <div style={{fontSize: '9px', color: '#666', fontWeight: '700', textTransform: 'uppercase'}}>Card Holder</div>
                  <div style={{fontSize: '14px', color: '#fff', fontWeight: '700', letterSpacing: '1px'}}>PROMOTER</div>
               </div>
               <div>
                  <div style={{fontSize: '9px', color: '#666', fontWeight: '700', textTransform: 'uppercase', textAlign: 'right'}}>Total Earned</div>
                  <div style={{fontSize: '14px', color: neonGreen, fontWeight: '700', letterSpacing: '1px'}}>₹{lifetime.toLocaleString()}</div>
               </div>
            </div>
         </div>
      </div>

      {/* 3. TABS (Withdraw vs History) */}
      <div style={{display: 'flex', background: '#111', padding: '4px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #222'}}>
         <button onClick={() => setActiveTab('withdraw')} style={{
           flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
           background: activeTab === 'withdraw' ? '#222' : 'transparent',
           color: activeTab === 'withdraw' ? '#fff' : '#666',
           fontWeight: '800', fontSize: '12px', transition: 'all 0.2s'
         }}>
           REQUEST PAYOUT
         </button>
         <button onClick={() => setActiveTab('history')} style={{
           flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
           background: activeTab === 'history' ? '#222' : 'transparent',
           color: activeTab === 'history' ? '#fff' : '#666',
           fontWeight: '800', fontSize: '12px', transition: 'all 0.2s'
         }}>
           HISTORY
         </button>
      </div>

      {/* 4. CONTENT AREA */}
      {activeTab === 'withdraw' ? (
        <div style={{animation: 'slideUp 0.3s ease-out'}}>
          <WithdrawForm maxAmount={balance} defaultUpi={upiId} userId={userId} minLimit={minLimit} />
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px', animation: 'slideUp 0.3s ease-out'}}>
          {history && history.length > 0 ? (
            history.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
          ) : (
            <div style={{textAlign: 'center', padding: '40px', color: '#444'}}>No transactions yet.</div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .metal-card:hover { transform: perspective(1000px) rotateX(0deg) scale(1.02) !important; }
      `}</style>

    </div>
  );
}

// SUB-COMPONENT: TRANSACTION ITEM
function TransactionItem({ tx }) {
  const statusColors = {
    approved: '#00ff88', paid: '#00ff88', pending: '#fbbf24', rejected: '#ef4444'
  };
  const color = statusColors[tx.status] || '#888';
  const dateStr = new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
       <div style={{display: 'flex', gap: '14px', alignItems: 'center'}}>
          <div style={{
             width: '40px', height: '40px', borderRadius: '10px', background: `${color}11`,
             border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center',
             color: color, fontSize: '18px'
          }}>
             {tx.status === 'paid' ? '✓' : '⟳'}
          </div>
          <div>
             <div style={{fontSize: '14px', fontWeight: '700', color: '#fff'}}>Withdrawal</div>
             <div style={{fontSize: '11px', color: '#666'}}>{dateStr} • {tx.status.toUpperCase()}</div>
          </div>
       </div>
       <div style={{fontSize: '16px', fontWeight: '900', color: '#fff'}}>
         -₹{tx.amount}
       </div>
    </div>
  );
}