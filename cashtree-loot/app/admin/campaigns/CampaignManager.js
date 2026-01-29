'use client';

import { useState } from 'react';
import { toggleCampaignStatus, updateCampaign } from './actions';
import { Settings, ExternalLink, X, Save, Loader2 } from 'lucide-react';

export default function CampaignManager({ initialCampaigns }) {
  const [list, setList] = useState(initialCampaigns);
  const [editing, setEditing] = useState(null); 
  const [loading, setLoading] = useState(false);

  // --- 1. INSTANT TOGGLE (Zero Lag) ---
  const handleToggle = async (id, currentStatus) => {
    // Optimistic UI: Update screen BEFORE server responds
    setList(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));

    // Call Server
    const res = await toggleCampaignStatus(id, currentStatus);
    
    // If error, revert
    if (!res.success) {
      alert("Error: " + res.error);
      setList(prev => prev.map(c => c.id === id ? { ...c, is_active: currentStatus } : c));
    }
  };

  // --- 2. SAVE EDITS (INSTANT VERSION) ---
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Capture the new data from the form
    const formData = new FormData(e.target);
    const updates = {
      title: formData.get('title'),
      landing_url: formData.get('landing_url'),
      payout_amount: parseFloat(formData.get('payout_amount')),
      user_reward: parseFloat(formData.get('user_reward')),
      category: formData.get('category'),
      icon_url: formData.get('icon_url'),
      description: formData.get('description'),
    };

    // 2. OPTIMISTIC UPDATE: Update the list on screen INSTANTLY
    setList(prev => prev.map(c => 
      c.id === editing.id ? { ...c, ...updates } : c
    ));

    // 3. Close the popup INSTANTLY (Don't wait for server)
    setEditing(null); 
    setLoading(false);

    // 4. Send to server in the background (Silent Sync)
    const res = await updateCampaign(editing.id, formData);

    // 5. Handle failure if server rejects it
    if (!res.success) {
      alert("Save failed! The changes were not saved to the database.");
      window.location.reload(); // Reload to reset to true server state
    }
  };

  const neonGreen = '#00ff88';

 

  return (
    <div className="fade-in">
      
      {/* GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {list.map((camp) => (
          <div key={camp.id} style={{
            background: '#0a0a0f', 
            border: camp.is_active ? '1px solid #222' : '1px solid #1a1a1a', 
            borderRadius: '20px', padding: '24px', position: 'relative',
            opacity: camp.is_active ? 1 : 0.6, 
            transition: 'all 0.3s'
          }}>
            
            {/* HEADER */}
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
              <div style={{display: 'flex', gap: '12px'}}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px', background: '#111',
                  backgroundImage: `url(${camp.icon_url})`, backgroundSize: 'cover', border: '1px solid #222'
                }} />
                <div>
                  <div style={{color: '#fff', fontWeight: 'bold', fontSize: '15px'}}>{camp.title}</div>
                  <div style={{color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'}}>{camp.category}</div>
                </div>
              </div>
              
              {/* TOGGLE SWITCH */}
              <button onClick={() => handleToggle(camp.id, camp.is_active)} style={{
                width: '44px', height: '24px', borderRadius: '20px', 
                background: camp.is_active ? neonGreen : '#333',
                border: 'none', cursor: 'pointer', position: 'relative', transition: '0.3s',
                boxShadow: camp.is_active ? `0 0 15px ${neonGreen}66` : 'none'
              }}>
                <div style={{
                  width: '18px', height: '18px', background: '#fff', borderRadius: '50%',
                  position: 'absolute', top: '3px', 
                  left: camp.is_active ? '23px' : '3px', transition: '0.3s'
                }} />
              </button>
            </div>

            {/* METRICS */}
            <div style={{display: 'flex', gap: '10px', background: '#050505', padding: '12px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #111'}}>
              <div style={{flex: 1}}>
                <div style={{fontSize: '9px', color: '#666', fontWeight: '800', textTransform: 'uppercase'}}>PAYOUT</div>
                <div style={{color: neonGreen, fontWeight: '900', fontSize: '14px'}}>₹{camp.payout_amount}</div>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: '9px', color: '#666', fontWeight: '800', textTransform: 'uppercase'}}>USER GETS</div>
                <div style={{color: '#fff', fontWeight: '900', fontSize: '14px'}}>₹{camp.user_reward}</div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={() => setEditing(camp)} style={{
                flex: 1, background: '#1a1a1a', color: '#fff', border: 'none', padding: '12px', 
                borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontSize: '12px', fontWeight: '700'
              }}>
                <Settings size={14} /> EDIT
              </button>
              <a href={camp.landing_url} target="_blank" style={{
                flex: 1, background: '#1a1a1a', color: '#888', textDecoration: 'none', padding: '12px', 
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', fontWeight: '700'
              }}>
                <ExternalLink size={14} /> LINK
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* --- EDIT MODAL --- */}
      {editing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="slide-up" style={{
            background: '#0a0a0f', border: '1px solid #333', borderRadius: '24px', 
            width: '90%', maxWidth: '450px', padding: '30px', boxShadow: '0 25px 50px -10px #000'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
              <h2 style={{color: '#fff', margin: 0, fontSize: '18px', fontWeight: '800'}}>EDIT CAMPAIGN</h2>
              <button onClick={() => setEditing(null)} style={{background: 'none', border: 'none', color: '#666', cursor: 'pointer'}}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{display: 'grid', gap: '16px'}}>
              <Input label="Title" name="title" defaultValue={editing.title} />
              <Input label="Landing URL" name="landing_url" defaultValue={editing.landing_url} />
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                 <Input label="Payout (₹)" name="payout_amount" type="number" defaultValue={editing.payout_amount} />
                 <Input label="User Reward (₹)" name="user_reward" type="number" defaultValue={editing.user_reward} />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                 <Input label="Category" name="category" defaultValue={editing.category} />
                 <Input label="Icon URL" name="icon_url" defaultValue={editing.icon_url} />
              </div>

              <button type="submit" disabled={loading} style={{
                background: neonGreen, color: '#000', border: 'none', padding: '16px', borderRadius: '12px',
                fontWeight: '900', cursor: 'pointer', marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '10px',
                textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {loading ? 'SAVING...' : 'UPDATE MISSION'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper for Inputs
function Input({ label, name, defaultValue, type = "text" }) {
  return (
    <div>
      <label style={{display: 'block', fontSize: '10px', fontWeight: '800', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{label}</label>
      <input type={type} name={name} defaultValue={defaultValue} style={{
        width: '100%', background: '#000', border: '1px solid #222', borderRadius: '10px', padding: '14px', color: '#fff', outline: 'none', fontSize: '14px', fontWeight: '600'
      }} />
    </div>
  );
}