'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, Zap, Copy, Check, Info, Settings, Save, Loader2 } from 'lucide-react';
import { savePayoutSettings } from './actions'; // ✅ Import the Server Action

export default function CampaignsInterface({ campaigns, promoterId, promoterUsername, userSettings }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [copied, setCopied] = useState(false);

  // --- NEW STATE FOR PAYOUT EDITING ---
  const [isEditing, setIsEditing] = useState(false);
  const [editUserReward, setEditUserReward] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // --- HELPER: Parse Description ---
  const parseSteps = (text) => {
    if (!text) return [];
    return text.split(/\n|\d+\.\s+/).filter(line => line.trim().length > 0);
  };

  // --- HELPER: Copy Logic ---
  const handleCopy = () => {
    const origin = window.location.origin;
    let targetUrl = selectedTask.landing_url;
    if (!targetUrl.startsWith('http')) {
      const path = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
      targetUrl = `${origin}${path}`;
    }
    const separator = targetUrl.includes('?') ? '&' : '?';
    const affiliateLink = `${targetUrl}${separator}ref=${promoterUsername}`;
    
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- ⚡ SMART SPLIT CALCULATOR ---
  // Determines the real values to show (Custom Settings OR Default)
  const getSplit = (campaign) => {
    // 1. Check if user has customized this campaign
    const custom = userSettings?.find(s => s.campaign_id === campaign.id);
    
    // 2. Ceiling (Total Budget)
    const totalLimit = campaign.payout_amount;

    // 3. User Share (Custom or Default)
    const userShare = custom ? parseFloat(custom.user_bonus) : campaign.user_reward;

    // 4. Promoter Share (Total - User)
    const promoterShare = totalLimit - userShare;

    return { totalLimit, userShare, promoterShare };
  };

  // --- EFFECT: Reset Edit State when opening modal ---
  useEffect(() => {
    if (selectedTask) {
      setIsEditing(false);
      const { userShare } = getSplit(selectedTask);
      setEditUserReward(userShare);
    }
  }, [selectedTask]);

  // --- HANDLER: Save Payout ---
  const handleSavePayout = async () => {
    setIsSaving(true);
    const { totalLimit } = getSplit(selectedTask);
    
    // Validate
    if (editUserReward > totalLimit) {
      alert(`Error: Max limit is ₹${totalLimit}`);
      setIsSaving(false);
      return;
    }

    const newPromoterShare = totalLimit - editUserReward;

    const res = await savePayoutSettings(selectedTask.id, editUserReward, newPromoterShare);
    
    if (res.success) {
      setIsEditing(false);
      // Reload to refresh the 'userSettings' prop from the server
      window.location.reload(); 
    } else {
      alert("Error: " + res.error);
    }
    setIsSaving(false);
  };

  return (
    <div className="fade-in">
      
      {/* 1. GRID OF OFFERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {campaigns.map((camp, index) => {
          // Calculate display values for each card
          const split = getSplit(camp);

          return (
            <div 
              key={camp.id} 
              onClick={() => setSelectedTask(camp)}
              style={{
                background: '#0a0a0f', border: '1px solid #1a1a1a', borderRadius: '24px', padding: '24px', cursor: 'pointer',
                position: 'relative', transition: 'all 0.2s', animation: `slideUp 0.5s ease-out ${index * 0.05}s backwards`
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
            >
              {/* Header */}
              <div style={{display: 'flex', gap: '16px', alignItems: 'start', marginBottom: '20px'}}>
                <img src={camp.icon_url} style={{width: '60px', height: '60px', borderRadius: '16px', border: '1px solid #222', objectFit: 'cover'}} />
                <div>
                  <h3 style={{color: '#fff', fontSize: '16px', fontWeight: '800', lineHeight: '1.2', marginBottom: '6px'}}>{camp.title}</h3>
                  <span style={{fontSize: '11px', background: '#1a1a1a', color: '#888', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', textTransform: 'uppercase'}}>{camp.category || 'Offer'}</span>
                </div>
              </div>

              {/* Payout Grid (Dynamic) */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#111', padding: '12px', borderRadius: '14px'}}>
                <div>
                  <div style={{fontSize: '10px', color: '#666', fontWeight: '800', textTransform: 'uppercase'}}>YOU EARN</div>
                  <div style={{color: '#00ff88', fontSize: '18px', fontWeight: '900'}}>₹{split.promoterShare}</div>
                </div>
                <div style={{borderLeft: '1px solid #222', paddingLeft: '12px'}}>
                  <div style={{fontSize: '10px', color: '#666', fontWeight: '800', textTransform: 'uppercase'}}>USER GETS</div>
                  <div style={{color: '#fff', fontSize: '18px', fontWeight: '900'}}>₹{split.userShare}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. ADVANCED POPUP MODAL */}
      {selectedTask && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setSelectedTask(null)}>
          
          <div onClick={(e) => e.stopPropagation()} className="slide-up" style={{
            width: '100%', maxWidth: '500px', background: '#0a0a0f', border: '1px solid #333', 
            borderRadius: '30px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.7)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            
            {/* Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <div style={{display: 'flex', gap: '14px', alignItems: 'center'}}>
                <img src={selectedTask.icon_url} style={{width: '56px', height: '56px', borderRadius: '16px', border: '1px solid #333'}} />
                <div>
                   <h2 style={{color: '#fff', fontSize: '20px', fontWeight: '900', margin: 0}}>{selectedTask.title}</h2>
                   <div style={{display: 'flex', gap: '6px', marginTop: '6px'}}>
                      <Badge text="Verified Offer" color="#3b82f6" bg="rgba(59, 130, 246, 0.1)" />
                      <Badge text="Instant Track" color="#00ff88" bg="rgba(0, 255, 136, 0.1)" />
                   </div>
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} style={{background: '#1a1a1a', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><X size={20} /></button>
            </div>

            {/* --- 💰 THE MONEY BOX (PAYOUT MANAGER) --- */}
            <div style={{
               background: isEditing ? '#111' : 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)', 
               padding: '20px', borderRadius: '20px', marginBottom: '24px', border: isEditing ? '1px solid #333' : '1px solid #222',
               transition: 'all 0.3s'
            }}>
               {/* Toolbar */}
               <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: isEditing ? '16px' : '0'}}>
                  {!isEditing && (
                    <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        {/* VIEW MODE */}
                        <div>
                          <div style={{fontSize: '11px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase'}}>Your Commission</div>
                          <div style={{fontSize: '24px', color: '#00ff88', fontWeight: '900'}}>₹{getSplit(selectedTask).promoterShare}</div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{fontSize: '11px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase'}}>User Bonus</div>
                          <div style={{fontSize: '24px', color: '#fff', fontWeight: '900'}}>₹{getSplit(selectedTask).userShare}</div>
                        </div>
                    </div>
                  )}

                  {/* EDIT TOGGLE BUTTON */}
                  <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    style={{
                      background: isEditing ? '#222' : 'transparent', border: '1px solid', borderColor: isEditing ? '#444' : 'transparent', 
                      borderRadius: '8px', width: '30px', height: '30px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', cursor: 'pointer',
                      marginLeft: isEditing ? '0' : '10px'
                    }}
                    title="Customize Payout"
                  >
                    {isEditing ? <X size={16} /> : <Settings size={18} />}
                  </button>
               </div>

               {/* EDIT MODE INPUTS */}
               {isEditing && (
                 <div className="fade-in">
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px'}}>
                        {/* 1. User Input */}
                        <div>
                           <label style={{fontSize: '10px', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '6px'}}>User Gets</label>
                           <input 
                             type="number" 
                             value={editUserReward}
                             onChange={(e) => setEditUserReward(parseFloat(e.target.value) || 0)}
                             style={{width: '100%', background: '#000', border: '1px solid #333', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 'bold', outline: 'none'}} 
                           />
                        </div>
                        {/* 2. Auto Calc Promoter */}
                        <div>
                           <label style={{fontSize: '10px', color: '#00ff88', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '6px'}}>You Keep</label>
                           <input 
                             type="number" 
                             value={getSplit(selectedTask).totalLimit - editUserReward} // Math happens live
                             disabled
                             style={{width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '10px', borderRadius: '8px', color: '#888', fontWeight: 'bold', cursor: 'not-allowed'}} 
                           />
                        </div>
                    </div>
                    
                    <div style={{fontSize: '10px', color: '#666', textAlign: 'center', marginBottom: '12px'}}>
                       Max Total Limit: ₹{getSplit(selectedTask).totalLimit}
                    </div>

                    <button 
                      onClick={handleSavePayout}
                      disabled={isSaving}
                      style={{
                        width: '100%', background: '#fff', color: '#000', padding: '12px', borderRadius: '10px',
                        border: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px',
                        cursor: isSaving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                       {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                       {isSaving ? 'Saving...' : 'Save New Split'}
                    </button>
                 </div>
               )}
            </div>

            {/* Smart Instructions List */}
            <div style={{marginBottom: '24px'}}>
              <h4 style={{color: '#fff', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Info size={14} color="#666" /> Steps to Complete
              </h4>
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {parseSteps(selectedTask.description).map((step, i) => (
                  <div key={i} style={{display: 'flex', gap: '12px', fontSize: '14px', color: '#ccc', lineHeight: '1.5'}}>
                    <div style={{
                      minWidth: '24px', height: '24px', background: '#222', borderRadius: '50%', 
                      color: '#fff', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-2px'
                    }}>
                      {i + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Link Section */}
            <div style={{background: '#111', padding: '16px', borderRadius: '16px', border: '1px dashed #333'}}>
              <div style={{fontSize: '11px', color: '#666', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase'}}>YOUR UNIQUE SHARE LINK</div>
              
              <button 
                onClick={handleCopy}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                  background: copied ? '#00ff88' : '#fff', 
                  color: '#000', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
                {copied ? 'LINK COPIED!' : 'COPY REFERRAL LINK'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function Badge({ text, color, bg }) {
  return (
    <span style={{fontSize: '10px', fontWeight: '800', color: color, background: bg, padding: '4px 8px', borderRadius: '6px'}}>
      {text}
    </span>
  );
}