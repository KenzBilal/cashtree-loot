'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Use standard client for auth context
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    landing_url: '',
    icon_url: '', 
    category: 'CPI', 
    payout_amount: '',
    user_reward: ''
  });

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategory = (cat) => {
    setFormData({ ...formData, category: cat });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title || !formData.landing_url) throw new Error("Title and URL are required.");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired. Please login again.");

      // ✅ FIX: Send 'is_active' (boolean) and ensure numbers are correct
      // We do NOT send 'id' because the Database now generates it automatically.
      const payload = {
        created_by: user.id,
        title: formData.title,
        description: formData.description,
        landing_url: formData.landing_url,
        icon_url: formData.icon_url || 'https://via.placeholder.com/100',
        category: formData.category,
        payout_amount: parseFloat(formData.payout_amount) || 0,
        user_reward: parseFloat(formData.user_reward) || 0,
        is_active: true // ✅ CHANGED from "status: 'active'" to match your new Schema
      };

      const { error } = await supabase.from('campaigns').insert(payload);

      if (error) throw error;

      alert("✅ Campaign Deployed Successfully!");
      router.push('/admin/campaigns');
      router.refresh();

    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const neonGreen = '#00ff88';
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
  const inputStyle = { width: '100%', background: '#050505', border: '1px solid #222', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '14px', outline: 'none', transition: 'border 0.2s', fontFamily: 'Inter, sans-serif' };

  return (
    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
      
      {/* 1. HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <Link href="/admin/campaigns" style={{ 
          width: '40px', height: '40px', borderRadius: '12px', background: '#111', border: '1px solid #222', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' 
        }}>
          ←
        </Link>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: '#fff', letterSpacing: '-1px' }}>New Mission</h1>
          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0', fontWeight: '600' }}>DEPLOY NEW CAMPAIGN SIGNAL</p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', alignItems: 'start'}}>
        
        {/* 2. LEFT: THE FORM (Tactical Card) */}
        <div style={{ background: '#0a0a0f', border: '1px solid #222', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Campaign Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Airtel Thanks App Task" style={inputStyle} required />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Tracking URL (Destination)</label>
              <input type="url" name="landing_url" value={formData.landing_url} onChange={handleChange} placeholder="https://..." style={{ ...inputStyle, color: neonGreen, fontFamily: 'monospace' }} required />
            </div>

            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
               <div>
                 <label style={labelStyle}>Icon URL</label>
                 <input type="url" name="icon_url" value={formData.icon_url} onChange={handleChange} placeholder="https://imgur.com/..." style={inputStyle} />
               </div>
               <div>
                 <label style={labelStyle}>Category</label>
                 <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                   {['CPI', 'CPA', 'FINANCE', 'CRYPTO'].map(cat => (
                     <button key={cat} type="button" onClick={() => handleCategory(cat)} style={{
                       background: formData.category === cat ? neonGreen : '#111',
                       color: formData.category === cat ? '#000' : '#666',
                       border: '1px solid #222', borderRadius: '8px', padding: '8px 12px',
                       fontSize: '10px', fontWeight: '800', cursor: 'pointer'
                     }}>
                       {cat}
                     </button>
                   ))}
                 </div>
               </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Task Instructions</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="1. Download App&#10;2. Register&#10;3. Use for 2 mins..." style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '24px 0', borderTop: '1px dashed #222' }}>
              <div>
                <label style={{ ...labelStyle, color: '#fff' }}>PAYOUT (₹)</label>
                <input type="number" name="payout_amount" value={formData.payout_amount} onChange={handleChange} placeholder="0" style={{ ...inputStyle, borderColor: '#333', fontSize: '18px', fontWeight: 'bold' }} />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#888' }}>USER BONUS (₹)</label>
                <input type="number" name="user_reward" value={formData.user_reward} onChange={handleChange} placeholder="0" style={{ ...inputStyle, borderColor: '#333' }} />
              </div>
            </div>

            <button type="submit" style={{ 
              width: '100%', padding: '18px', background: neonGreen, color: '#000', border: 'none', borderRadius: '16px', 
              fontWeight: '900', fontSize: '14px', cursor: loading ? 'wait' : 'pointer', textTransform: 'uppercase', 
              letterSpacing: '1px', marginTop: '10px', boxShadow: `0 0 25px ${neonGreen}44`, opacity: loading ? 0.7 : 1 
            }} disabled={loading}>
              {loading ? 'INITIALIZING...' : 'DEPLOY CAMPAIGN'}
            </button>
          </form>
        </div>

        {/* 3. RIGHT: LIVE PREVIEW (Mobile Card) */}
        <div style={{position: 'sticky', top: '20px'}}>
           <div style={{fontSize: '11px', fontWeight: '800', color: '#666', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center'}}>
             Live Mobile Preview
           </div>
           
           {/* Preview Component */}
           <div style={{
             background: '#000', border: '1px solid #222', borderRadius: '24px', padding: '20px',
             maxWidth: '320px', margin: '0 auto', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)'
           }}>
              <div style={{display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px'}}>
                 <div style={{
                   width: '48px', height: '48px', borderRadius: '12px', background: '#111', 
                   backgroundImage: `url(${formData.icon_url || 'https://via.placeholder.com/50/111/333?text=ICON'})`,
                   backgroundSize: 'cover', border: '1px solid #333'
                 }}></div>
                 <div>
                    <div style={{fontSize: '14px', fontWeight: '700', color: '#fff', lineHeight: '1.2'}}>
                      {formData.title || 'Campaign Title'}
                    </div>
                    <div style={{fontSize: '10px', color: neonGreen, fontWeight: '700', marginTop: '4px'}}>
                      EARN ₹{formData.payout_amount || '0'}
                    </div>
                 </div>
              </div>
              
              <div style={{background: '#111', padding: '12px', borderRadius: '12px', fontSize: '11px', color: '#888', lineHeight: '1.5', whiteSpace: 'pre-wrap'}}>
                 {formData.description || 'Task instructions will appear here...'}
              </div>

              <div style={{marginTop: '16px', height: '40px', background: '#333', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#aaa'}}>
                 START TASK →
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}