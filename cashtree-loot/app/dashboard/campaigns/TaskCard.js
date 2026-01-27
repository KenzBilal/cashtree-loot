'use client';

import { useState } from 'react';

export default function TaskCard({ campaign, promoterId }) {
  const [copied, setCopied] = useState(false);

  // 1. SMART LINK GENERATION
  // Detects if the URL already has '?' to append the correct separator (& or ?)
  // Example: google.com?q=1 becomes google.com?q=1&ref=123
  const separator = campaign.landing_url.includes('?') ? '&' : '?';
  const trackingLink = `${campaign.landing_url}${separator}ref=${promoterId}`;

  // 2. COPY TO CLIPBOARD
  const handleCopy = () => {
    navigator.clipboard.writeText(trackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
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
      handleCopy(); // Fallback for desktop
    }
  };

  // --- STYLES ---
  const cardStyle = {
    background: '#0a0a0a',
    border: '1px solid #222',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '20px',
    position: 'relative',
    transition: 'transform 0.2s',
  };

  const badgeContainer = { display: 'flex', gap: '10px', marginBottom: '16px' };
  
  const payoutBadge = {
    background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.2)',
    padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase'
  };

  const btnStyle = {
    flex: 1, padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '700',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px'
  };

  return (
    <div style={cardStyle}>
      
      {/* TITLE & PAYOUT */}
      <div style={{marginBottom: '15px'}}>
        <h3 style={{fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '12px', lineHeight: '1.4'}}>
          {campaign.title}
        </h3>
        <div style={badgeContainer}>
          <div style={payoutBadge}>⚡ You Earn ₹{campaign.payout_amount}</div>
          {campaign.user_reward > 0 && (
            <div style={{...payoutBadge, background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.2)'}}>
              🎁 User Gets ₹{campaign.user_reward}
            </div>
          )}
        </div>
      </div>

      {/* INSTRUCTIONS BOX */}
      <div style={{
        background: '#111', borderRadius: '12px', padding: '16px', 
        fontSize: '13px', color: '#aaa', lineHeight: '1.6', marginBottom: '24px',
        border: '1px solid #1a1a1a'
      }}>
        <strong style={{color: '#fff', display: 'block', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase'}}>Instructions:</strong>
        {campaign.description || "Click the link, install the app, and register to complete the task."}
      </div>

      {/* ACTION BUTTONS */}
      <div style={{display: 'flex', gap: '12px'}}>
        <button onClick={handleShare} style={{...btnStyle, background: '#fff', color: '#000'}}>
          <span>🚀</span> Share Task
        </button>

        <button onClick={handleCopy} style={{
          ...btnStyle, 
          background: copied ? 'rgba(34, 197, 94, 0.1)' : '#1a1a1a', 
          color: copied ? '#4ade80' : '#fff', 
          border: copied ? '1px solid #14532d' : '1px solid #333'
        }}>
          {copied ? '✅ Copied' : '📋 Copy Link'}
        </button>
      </div>

    </div>
  );
}