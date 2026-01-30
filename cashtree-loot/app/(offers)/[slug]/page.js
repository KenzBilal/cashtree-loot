import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { submitLead } from './actions';

// --- 1. SETUP SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// --- 2. MAIN PAGE COMPONENT ---
export default async function OfferPage({ params, searchParams }) {
  const { slug } = params;       // e.g. "motwal"
  const refCode = searchParams?.ref; // e.g. ?ref=akash

  // Fetch Campaign Details by looking up the "landing_url" (which is now the slug)
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('landing_url', slug) // Matches 'motwal'
    .eq('is_active', true)   // Only show active campaigns
    .single();

  if (error || !campaign) {
    return notFound(); // Shows 404 if campaign doesn't exist
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        
        {/* --- CARD HEADER --- */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-[#111] border border-[#222] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
             {/* Dynamic Logo */}
             {campaign.icon_url ? (
               <img src={campaign.icon_url} alt={campaign.title} className="w-12 h-12 object-contain" />
             ) : (
               <span className="text-3xl">🎁</span>
             )}
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{campaign.title}</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 border border-green-900/50 text-green-400 text-xs font-bold uppercase tracking-wide">
            <Zap size={12} fill="currentColor" /> Earn ₹{campaign.user_reward} Cash
          </div>
        </div>

        {/* --- THE SIGNUP CARD --- */}
        <div className="bg-[#0a0a0f] border border-[#222] rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-gray-400">Instant payout to your UPI ID.</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-green-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-gray-400">100% Safe & Secure Process.</p>
            </div>
          </div>

          {/* --- THE FORM --- */}
          <form action={submitLead} className="space-y-4">
            
            {/* HIDDEN FIELDS (To track who/what) */}
            <input type="hidden" name="campaign_id" value={campaign.id} />
            <input type="hidden" name="referral_code" value={refCode || ''} />
            <input type="hidden" name="redirect_url" value={campaign.affiliate_link || '#'} />

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Your Full Name</label>
              <input 
                name="user_name"
                type="text" 
                placeholder="e.g. Rahul Kumar" 
                required
                className="w-full bg-[#050505] border border-[#222] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">UPI ID (For Payment)</label>
              <input 
                name="upi_id"
                type="text" 
                placeholder="e.g. 9876543210@ybl" 
                required
                className="w-full bg-[#050505] border border-[#222] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all font-medium"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold py-4 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-4 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]"
            >
              Start Mission <ArrowRight size={18} />
            </button>
          </form>

        </div>

        {/* --- FOOTER --- */}
        <div className="text-center mt-8 text-xs text-gray-600">
          By starting, you agree to our Terms & Conditions.
        </div>

      </div>
    </div>
  );
}