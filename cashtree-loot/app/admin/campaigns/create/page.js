'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Init Supabase
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
    payout_amount: '',  // For Promoter
    user_reward: ''     // For Task User
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Basic Validation
      if (!formData.title || !formData.landing_url) throw new Error("Title and URL are required.");
      if (Number(formData.payout_amount) < 0) throw new Error("Payout cannot be negative.");

      // 2. Get Current Admin ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      // 3. Insert into DB
      const { error } = await supabase.from('campaigns').insert({
        created_by: user.id,
        title: formData.title,
        description: formData.description,
        landing_url: formData.landing_url,
        payout_amount: formData.payout_amount || 0,
        user_reward: formData.user_reward || 0,
        is_active: true
      });

      if (error) throw error;

      // 4. Success -> Go back to list
      router.push('/admin/campaigns');
      router.refresh(); // Refresh the list to show new item

    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/campaigns" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          <i className="fas fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">New Campaign</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Create a new task</p>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl">
        
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Campaign Title</label>
          <input 
            type="text" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Download WinZO App"
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tracking URL</label>
          <input 
            type="url" 
            name="landing_url"
            value={formData.landing_url}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-blue-400 font-mono focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Task Instructions</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Steps the user must follow..."
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-green-500 transition-colors"
          ></textarea>
        </div>

        {/* MONEY SECTION */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
          
          {/* Promoter Payout */}
          <div>
            <label className="block text-xs font-bold text-green-500 uppercase tracking-widest mb-2">Promoter Earns (₹)</label>
            <input 
              type="number" 
              name="payout_amount"
              value={formData.payout_amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 font-black text-lg focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {/* User Reward */}
          <div>
            <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">User Reward (₹)</label>
            <input 
              type="number" 
              name="user_reward"
              value={formData.user_reward}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 text-blue-400 font-black text-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

        </div>

        {/* SUBMIT */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-rocket"></i>}
          Launch Campaign
        </button>

      </form>
    </div>
  );
}