'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// We use the standard client for auth check, but we'll use a Server Action or the Admin key for the heavy lifting if needed.
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
    payout_amount: '',
    user_reward: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title || !formData.landing_url) throw new Error("Title and URL are required.");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Auth session expired. Please login again.");

      // Insert into campaigns table
      const { error } = await supabase.from('campaigns').insert({
        created_by: user.id,
        title: formData.title,
        description: formData.description,
        landing_url: formData.landing_url,
        payout_amount: parseFloat(formData.payout_amount) || 0,
        user_reward: parseFloat(formData.user_reward) || 0,
        status: 'active' // Ensure this matches your DB schema (status vs is_active)
      });

      if (error) throw error;

      alert("Campaign Launched! 🚀");
      router.push('/admin/campaigns');
      router.refresh();

    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES (Emerald/Dark Theme) ---
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
  const inputStyle = { width: '100%', background: '#000', border: '1px solid #222', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' };
  const cardStyle = { background: '#0a0a0a', border: '1px solid #222', borderRadius: '24px', padding: '32px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' };
  const btnStyle = { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #22c55e, #166534)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px' };

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <Link href="/admin/campaigns" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', textDecoration: 'none' }}>
          ←
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>New Campaign</h1>
          <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>Create a new task for your promoters</p>
        </div>
      </div>

      {/* FORM CARD */}
      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Campaign Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Open Kotak 811 Account" style={inputStyle} required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Tracking / Landing URL</label>
            <input type="url" name="landing_url" value={formData.landing_url} onChange={handleChange} placeholder="https://tracking-link.com/..." style={{ ...inputStyle, color: '#4ade80', fontFamily: 'monospace' }} required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Instructions</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Steps to complete the task..." style={{ ...inputStyle, resize: 'none' }}></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px 0', borderTop: '1px solid #1a1a1a' }}>
            <div>
              <label style={{ ...labelStyle, color: '#22c55e' }}>Promoter Earns (₹)</label>
              <input type="number" name="payout_amount" value={formData.payout_amount} onChange={handleChange} placeholder="0" style={{ ...inputStyle, borderColor: 'rgba(34,197,94,0.2)' }} />
            </div>
            <div>
              <label style={{ ...labelStyle, color: '#60a5fa' }}>User Reward (₹)</label>
              <input type="number" name="user_reward" value={formData.user_reward} onChange={handleChange} placeholder="0" style={{ ...inputStyle, borderColor: 'rgba(96,165,250,0.2)' }} />
            </div>
          </div>

          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? 'Launching...' : '🚀 Launch Campaign'}
          </button>
        </form>
      </div>
    </div>
  );
}