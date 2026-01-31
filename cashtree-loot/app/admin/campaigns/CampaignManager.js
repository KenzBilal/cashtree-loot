'use client';

import { useState, useEffect } from 'react';
import { toggleCampaignStatus, updateCampaign, deleteCampaign } from './actions';
import { Settings, ExternalLink, X, Save, Loader2, Trash2, Zap, Search } from 'lucide-react';

export default function CampaignManager({ initialCampaigns }) {
  const [list, setList] = useState(initialCampaigns);
  const [editing, setEditing] = useState(null); 
  const [loading, setLoading] = useState(false);

  // --- BRAND INTELLIGENCE STATE ---
  const [brandInput, setBrandInput] = useState('');
  const [detectedIcon, setDetectedIcon] = useState('');

  // --- SYNC STATE WHEN OPENING EDIT ---
  useEffect(() => {
    if (editing) {
      setDetectedIcon(editing.icon_url || '');
      setBrandInput(''); 
    }
  }, [editing]);

  // --- AUTO-FETCH LOGO LOGIC ---
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (!brandInput) return;
      const cleanInput = brandInput.toLowerCase().trim();
      if (cleanInput.includes('.')) {
        setDetectedIcon(`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanInput}&size=256`);
      } else {
        setDetectedIcon(`https://cdn.simpleicons.org/${cleanInput}/white`);
      }
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [brandInput]);


  // --- 1. TOGGLE STATUS ---
  const handleToggle = async (id, currentStatus) => {
    setList(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    const res = await toggleCampaignStatus(id, currentStatus);
    if (!res.success) {
      alert("Error: " + res.error);
      setList(prev => prev.map(c => c.id === id ? { ...c, is_active: currentStatus } : c));
    }
  };

  // --- 2. DELETE CAMPAIGN ---
  const handleDelete = async (id) => {
    if (!confirm("⚠️ Are you sure? This will delete the mission permanently.")) return;
    setList(prev => prev.filter(c => c.id !== id));
    const res = await deleteCampaign(id);
    if (!res.success) alert("Delete failed: " + res.error);
  };

  // --- 3. SAVE EDITS ---
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    
    // Inject detected icon if changed
    if (detectedIcon) formData.set('icon_url', detectedIcon);

    // Optimistic Update
    const updates = Object.fromEntries(formData.entries());
    setList(prev => prev.map(c => c.id === editing.id ? { ...c, ...updates } : c));
    
    setEditing(null); 
    setLoading(false);

    // Server Update
    const res = await updateCampaign(editing.id, formData);
    if (!res.success) {
      alert("Save failed: " + res.error); // Show real error (e.g. Math Error)
      window.location.reload();
    }
  };

  const neonGreen = '#00ff88';

  return (
    <div className="fade-in">
      
      {/* GRID LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {list.map((camp) => (
          <div key={camp.id} style={{
            background: '#0a0a0f', 
            border: camp.is_active ? '1px solid #222' : '1px solid #1a1a1a', 
            borderRadius: '20px', padding: '24px', position: 'relative',
            opacity: camp.is_active ? 1 : 0.6, transition: 'all 0.3s'
          }}>
            
            {/* HEADER */}
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
              <div style={{display: 'flex', gap: '12px', overflow: 'hidden'}}>
                <div style={{
                  minWidth: '48px', width: '48px', height: '48px', borderRadius: '12px', background: '#111',
                  backgroundImage: `url(${camp.icon_url})`, backgroundSize: 'cover', border: '1px solid #222'
                }} />
                <div style={{overflow: 'hidden'}}>
                  <div style={{color: '#fff', fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{camp.title}</div>
                  <div style={{color: '#666', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'}}>{camp.category}</div>
                </div>
              </div>
              
              <button onClick={() => handleToggle(camp.id, camp.is_active)} style={{
                minWidth: '44px', height: '24px', borderRadius: '20px', 
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

            {/* METRICS (Updated Labels) */}
            <div style={{display: 'flex', gap: '10px', background: '#050505', padding: '12px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #111'}}>
              <div style={{flex: 1}}>
                <div style={{fontSize: '9px', color: '#666', fontWeight: '800', textTransform: 'uppercase'}}>TOTAL LIMIT (MAX)</div>
                <div style={{color: neonGreen, fontWeight: '900', fontSize: '14px'}}>₹{camp.payout_amount}</div>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: '9px', color: '#666', fontWeight: '800', textTransform: 'uppercase'}}>DEFAULT CASHBACK</div>
                <div style={{color: '#fff', fontWeight: '900', fontSize: '14px'}}>₹{camp.user_reward}</div>
              </div>
            </div>

            {/* ACTIONS */}
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={() => setEditing(camp)} style={{
                flex: 1, background: '#1a1a1a', color: '#fff', border: 'none', padding: '12px', 
                borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontSize: '11px', fontWeight: '700'
              }}>
                <Settings size={14} /> EDIT
              </button>
              
              <a href={camp.landing_url} target="_blank" style={{
                width: '40px', background: '#1a1a1a', color: '#888', textDecoration: 'none', padding: '12px', 
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ExternalLink size={16} />
              </a>

              <button onClick={() => handleDelete(camp.id)} style={{
                width: '40px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', 
                borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Trash2 size={16} />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* --- EDIT MODAL --- */}
      {editing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="slide-up" style={{
            background: '#0a0a0f', border: '1px solid #333', borderRadius: '24px', 
            width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto',
            padding: '30px', boxShadow: '0 25px 50px -10px #000'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
              <h2 style={{color: '#fff', margin: 0, fontSize: '18px', fontWeight: '800'}}>EDIT CAMPAIGN</h2>
              <button onClick={() => setEditing(null)} style={{background: 'none', border: 'none', color: '#666', cursor: 'pointer'}}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{display: 'grid', gap: '16px'}}>
              
              {/* BRAND INTELLIGENCE */}
              <div style={{background: '#111', padding: '16px', borderRadius: '16px', border: '1px dashed #333'}}>
                <h3 style={{color: '#fff', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                   <Zap size={12} color={neonGreen} /> Update Identity
                </h3>
                <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                   <div style={{flex: 1}}>
                      <input 
                          placeholder="Search new brand..."
                          value={brandInput}
                          onChange={(e) => setBrandInput(e.target.value)}
                          style={{width: '100%', background: '#000', border: '1px solid #333', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none', fontSize: '13px'}}
                      />
                   </div>
                   <div style={{
                      width: '48px', height: '48px', borderRadius: '12px', 
                      background: '#000', border: `1px solid ${detectedIcon ? neonGreen : '#333'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                   }}>
                      {detectedIcon ? (
                        <img src={detectedIcon} style={{width: '24px', height: '24px', objectFit: 'contain'}} />
                      ) : <Search size={16} color="#333" />}
                   </div>
                </div>
                <input type="hidden" name="icon_url" value={detectedIcon} />
              </div>

              <Input label="Title" name="title" defaultValue={editing.title} />
              
              {/* ✅ ADDED: SLUG */}
              <Input label="URL Slug (e.g. motwal)" name="landing_url" defaultValue={editing.landing_url} />

              {/* ✅ ADDED: AFFILIATE LINK */}
              <Input label="Target/Affiliate Link" name="affiliate_link" defaultValue={editing.affiliate_link} placeholder="https://tracking..." />
              
              {/* ✅ UPDATED LABELS FOR CLARITY */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                 <Input label="Total Limit (Max) ₹" name="payout_amount" type="number" defaultValue={editing.payout_amount} />
                 <Input label="Default Cashback (₹)" name="user_reward" type="number" defaultValue={editing.user_reward} />
              </div>

              <Input label="Category" name="category" defaultValue={editing.category} />

              <div>
                <label style={{display: 'block', fontSize: '10px', fontWeight: '800', color: '#666', marginBottom: '6px', textTransform: 'uppercase'}}>Instructions</label>
                <textarea name="description" defaultValue={editing.description} rows={3} style={{
                   width: '100%', background: '#000', border: '1px solid #222', borderRadius: '10px', padding: '14px', color: '#fff', outline: 'none', fontSize: '13px', fontFamily: 'sans-serif'
                }} />
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
function Input({ label, name, defaultValue, type = "text", placeholder }) {
  return (
    <div>
      <label style={{display: 'block', fontSize: '10px', fontWeight: '800', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{label}</label>
      <input type={type} name={name} defaultValue={defaultValue} placeholder={placeholder} style={{
        width: '100%', background: '#000', border: '1px solid #222', borderRadius: '10px', padding: '14px', color: '#fff', outline: 'none', fontSize: '14px', fontWeight: '600'
      }} />
    </div>
  );
}