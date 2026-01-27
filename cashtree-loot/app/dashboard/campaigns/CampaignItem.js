'use client';

import { useState } from 'react';

export default function CampaignItem({ campaign, promoterId }) {
  const [copied, setCopied] = useState(false);

  // 1. SMART LINK GENERATION
  const separator = campaign.landing_url.includes('?') ? '&' : '?';
  const trackingLink = `${campaign.landing_url}${separator}ref=${promoterId}`;

  // 2. COPY TO CLIPBOARD
  const handleCopy = () => {
    navigator.clipboard.writeText(trackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  };

  // 3. NATIVE MOBILE SHARE
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: `Earn money with this task: ${campaign.title}`,
          url: trackingLink,
        });
      } catch (err) {
        console.log('Share closed');
      }
    } else {
      handleCopy(); 
    }
  };

  // --- PREMIUM GLASS STYLES ---
  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.03)', // Glass effect
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '24px',
    position: 'relative',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
  };

  const badgeContainer = { display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' };
  
  // Neon Green Badge
  const payoutBadge = {
    background: 'rgba(0, 255, 136, 0.1)', 
    color: '#00ff88', 
    border: '1px solid rgba(0, 255, 136, 0.2)',
    padding: '6px 12px', 
    borderRadius: '8px', 
    fontSize: '11px', 
    fontWeight: '800', 
    textTransform: 'uppercase',
    boxShadow: '0 0 10px rgba(0, 255, 136, 0.1)'
  };

  // Neon Blue Badge
  const rewardBadge = {
    background: 'rgba(56, 189, 248, 0.1)', 
    color: '#38bdf8', 
    border: '1px solid rgba(56, 189, 248, 0.2)',
    padding: '6px 12px', 
    borderRadius: '8px', 
    fontSize: '11px', 
    fontWeight: '800', 
    textTransform: 'uppercase',
    boxShadow: '0 0 10px rgba(56, 189, 248, 0.1)'
  };

  const btnBase = {
    flex: 1, 
    padding: '14px', 
    borderRadius: '14px', 
    border: 'none', 
    fontWeight: '800',
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px', 
    fontSize: '14px',
    transition: 'all 0.2s'
  };

  return (
    <div style={cardStyle}>
      
      {/* TITLE & PAYOUT */}
      <div style={{marginBottom: '16px'}}>
        <h3 style={{
          fontSize: '18px', 
          fontWeight: '900', 
          color: '#fff', 
          marginBottom: '12px', 
          lineHeight: '1.4',
          textShadow: '0 0 10px rgba(0,0,0,0.5)'
        }}>
          {campaign.title}
        </h3>
        
        <div style={badgeContainer}>
          <div style={payoutBadge}>⚡ Earn ₹{campaign.payout_amount}</div>
          {campaign.user_reward > 0 && (
            <div style={rewardBadge}>🎁 User Gets ₹{campaign.user_reward}</div>
          )}
        </div>
      </div>

      {/* INSTRUCTIONS BOX (Darker Glass) */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)', 
        borderRadius: '16px', 
        padding: '16px', 
        fontSize: '13px', 
        color: '#aaa', 
        lineHeight: '1.6', 
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <strong style={{color: '#fff', display: 'block', marginBottom: '6px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7}}>Instructions</strong>
        {campaign.description || "Click the link, install the app, and register to complete the task."}
      </div>

      {/* ACTION BUTTONS */}
      <div style={{display: 'flex', gap: '12px'}}>
        
        {/* Primary Share Button (Neon Gradient) */}
        <button onClick={handleShare} style={{
          ...btnBase, 
          background: 'linear-gradient(135deg, #00ff88, #00b36b)', 
          color: '#000',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.25)' // Glow effect
        }}>
          <span>🚀</span> Share Now
        </button>

        {/* Secondary Copy Button (Glass) */}
        <button onClick={handleCopy} style={{
          ...btnBase, 
          background: copied ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
          color: copied ? '#00ff88' : '#fff', 
          border: copied ? '1px solid #00ff88' : '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {copied ? '✅ Copied' : '📋 Copy Link'}
        </button>
      </div>

    </div>
  );
}