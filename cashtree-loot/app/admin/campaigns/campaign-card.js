'use client';

import Link from 'next/link';

export default function CampaignCard({ campaign }) {
  const isLive = campaign.status === 'active';
  const leadCount = campaign.leads?.[0]?.count || 0;
  
  // Status Logic
  const statusColor = isLive ? '#00ff88' : '#ef4444';
  const statusText = isLive ? 'LIVE SIGNAL' : 'OFFLINE';

  return (
    <div className="camp-card" style={{
      background: '#0a0a0f', // Obsidian
      border: '1px solid #1a1a1a',
      borderRadius: '20px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      display: 'flex', flexDirection: 'column', height: '100%'
    }}>
      
      {/* 1. STATUS LINE (Top) */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
         <div style={{
           display: 'flex', alignItems: 'center', gap: '6px', 
           fontSize: '10px', fontWeight: '800', color: statusColor, 
           background: `${statusColor}11`, padding: '4px 8px', borderRadius: '6px', border: `1px solid ${statusColor}33`
         }}>
            <span className={isLive ? 'pulse' : ''} style={{width: '6px', height: '6px', borderRadius: '50%', background: statusColor}}></span>
            {statusText}
         </div>
         <div style={{fontSize: '11px', color: '#555', fontFamily: 'monospace'}}>ID: {campaign.id.slice(0,4)}</div>
      </div>

      {/* 2. ICON & TITLE */}
      <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
         <img 
           src={campaign.icon_url} 
           alt="icon" 
           style={{
             width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover',
             boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)', border: '1px solid #222', background: '#000'
           }} 
         />
         <div>
            <h3 style={{fontSize: '16px', fontWeight: '800', color: '#fff', margin: '0 0 4px 0', lineHeight: '1.2'}}>
              {campaign.title}
            </h3>
            <div style={{fontSize: '12px', color: '#888', fontWeight: '600'}}>
              Payout: <span style={{color: '#fff'}}>₹{campaign.payout_amount}</span>
            </div>
         </div>
      </div>

      {/* 3. METRICS GRID */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px',
        background: '#050505', padding: '4px', borderRadius: '12px', border: '1px solid #111'
      }}>
         <MetricBox label="LEADS" value={leadCount} color="#fff" />
         <MetricBox label="TYPE" value={campaign.category || 'CPI'} color="#666" small />
      </div>

      {/* 4. ACTION FOOTER */}
      <div style={{marginTop: 'auto', display: 'flex', gap: '10px'}}>
        <Link href={`/admin/campaigns/${campaign.id}`} style={{
          flex: 1, padding: '12px', borderRadius: '10px', 
          background: '#fff', color: '#000', textAlign: 'center',
          fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', textDecoration: 'none',
          transition: 'transform 0.2s'
        }}>
          Manage
        </Link>
        <button style={{
          padding: '12px', borderRadius: '10px', border: '1px solid #333',
          background: 'transparent', color: '#fff', cursor: 'pointer'
        }}>
          ⚙️
        </button>
      </div>

      {/* HOVER GLOW EFFECT (CSS in globals or style block) */}
      <style jsx global>{`
        .camp-card:hover { 
          border-color: #333 !important; 
          transform: translateY(-4px); 
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.7);
        }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .pulse { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
}

function MetricBox({ label, value, color, small }) {
  return (
    <div style={{padding: '10px', textAlign: 'center', borderRadius: '8px'}}>
      <div style={{fontSize: small ? '12px' : '18px', fontWeight: '800', color: color}}>{value}</div>
      <div style={{fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', marginTop: '2px'}}>{label}</div>
    </div>
  );
}