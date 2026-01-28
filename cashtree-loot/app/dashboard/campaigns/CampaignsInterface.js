'use client';

import { useState } from 'react';

export default function CampaignsInterface({ campaigns, promoterId }) {
  const [filter, setFilter] = useState('all'); // all, high_pay, easy
  const [search, setSearch] = useState('');

  // --- 1. FILTER LOGIC (Fixed Columns) ---
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'high_pay' ? c.payout_amount >= 500 : // Fixed
      filter === 'easy' ? c.payout_amount < 100 : true; // Fixed
    return matchesSearch && matchesFilter;
  });

  // --- 2. STATS CALCULATION (Fixed Columns) ---
  const potentialEarnings = filteredCampaigns.reduce((acc, curr) => acc + curr.payout_amount, 0);

  // --- STYLES ---
  const filterBtnStyle = (active) => ({
    padding: '8px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
    cursor: 'pointer', border: active ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(0,255,136,0.1)' : 'transparent',
    color: active ? '#00ff88' : '#888', transition: 'all 0.2s'
  });

  return (
    <div className="fade-in">
      
      {/* 1. HERO STATS BAR */}
      <div style={{
        background: 'linear-gradient(135deg, #050505 0%, #111 100%)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px',
        marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <div>
          <div style={{fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700'}}>Available Missions</div>
          <div style={{fontSize: '24px', fontWeight: '900', color: '#fff'}}>{filteredCampaigns.length}</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: '10px', color: '#00ff88', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700'}}>Potential Profit</div>
          <div style={{fontSize: '24px', fontWeight: '900', color: '#00ff88', textShadow: '0 0 15px rgba(0,255,136,0.4)'}}>
            ₹{potentialEarnings.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 2. CONTROLS (Search + Filter) */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '5px'}}>
        <button onClick={() => setFilter('all')} style={filterBtnStyle(filter === 'all')}>ALL</button>
        <button onClick={() => setFilter('high_pay')} style={filterBtnStyle(filter === 'high_pay')}>🔥 HIGH PAY</button>
        <button onClick={() => setFilter('easy')} style={filterBtnStyle(filter === 'easy')}>⚡ EASY TASK</button>
      </div>

      <input 
        type="text" 
        placeholder="🔍 Find a campaign..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '14px', background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
          color: '#fff', fontSize: '14px', outline: 'none', marginBottom: '24px'
        }}
      />

      {/* 3. CAMPAIGN GRID */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} promoterId={promoterId} />
          ))
        ) : (
          <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>No campaigns found.</div>
        )}
      </div>

    </div>
  );
}

// ---------------------------------------------------------
// SUB-COMPONENT: THE "LEGENDARY" CARD
// ---------------------------------------------------------
function CampaignCard({ campaign, promoterId }) {
  const [copied, setCopied] = useState(false);

  // Generate Unique Link using landing_url
  const separator = campaign.landing_url.includes('?') ? '&' : '?';
  const uniqueLink = `${campaign.landing_url}${separator}ref=${promoterId}`;

  // Rarity Logic using payout_amount
  const isLegendary = campaign.payout_amount >= 500;
  const isRare = campaign.payout_amount >= 200 && campaign.payout_amount < 500;
  
  const accentColor = isLegendary ? '#fbbf24' : isRare ? '#3b82f6' : '#00ff88'; // Gold, Blue, Green
  const bgGradient = isLegendary 
    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(0,0,0,0))'
    : 'rgba(255,255,255,0.03)';

  const handleCopy = () => {
    navigator.clipboard.writeText(uniqueLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'relative',
      background: bgGradient,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${isLegendary ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '24px',
      padding: '20px',
      overflow: 'hidden',
      transition: 'transform 0.2s',
      boxShadow: isLegendary ? '0 10px 40px -10px rgba(251, 191, 36, 0.15)' : 'none'
    }}>
      
      {/* GLOW EFFECT */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
        background: accentColor, boxShadow: `0 0 15px ${accentColor}`
      }}></div>

      <div style={{paddingLeft: '12px'}}>
        {/* HEADER */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
          <div>
            {isLegendary && <div style={{fontSize:'9px', color: '#fbbf24', fontWeight:'900', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'4px'}}>👑 Legendary Offer</div>}
            <h3 style={{fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0}}>{campaign.title}</h3>
            <div style={{fontSize: '12px', color: '#888', marginTop: '4px'}}>{campaign.description?.slice(0, 60)}...</div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '20px', fontWeight: '900', color: accentColor, textShadow: `0 0 15px ${accentColor}44`}}>
              ₹{campaign.payout_amount}
            </div>
            <div style={{fontSize: '9px', color: '#666', fontWeight: 'bold'}}>PER LEAD</div>
          </div>
        </div>

        {/* ACTION BAR */}
        <div style={{display: 'flex', gap: '10px', marginTop: '16px'}}>
          <div style={{
            flex: 1, background: '#000', borderRadius: '12px', padding: '10px 14px', 
            fontSize: '11px', color: '#666', fontFamily: 'monospace', 
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center'
          }}>
            {uniqueLink}
          </div>
          
          <button 
            onClick={handleCopy}
            style={{
              background: copied ? accentColor : '#fff',
              color: copied ? '#000' : '#000',
              border: 'none', borderRadius: '12px', padding: '0 20px',
              fontWeight: '800', fontSize: '11px', cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: copied ? `0 0 20px ${accentColor}` : 'none'
            }}
          >
            {copied ? 'COPIED!' : 'COPY LINK'}
          </button>
        </div>
      </div>

    </div>
  );
}