import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { submitLead } from './actions';

// --- 1. SETUP SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const dynamic = 'force-dynamic';

// --- 2. MAIN PAGE COMPONENT ---
export default async function OfferPage(props) {
  // ✅ FIX FOR NEXT.JS 15: We must 'await' params and searchParams
  const params = await props.params;
  const searchParams = await props.searchParams;

  const slug = params.slug;
  const refCode = searchParams.ref;

  // Debug Log (Check your server terminal to see this)
  console.log(`✅ SLUG FIXED: ${slug}`);

  // --- 3. DATABASE SEARCH ---
  // We search for 'motwal' OR 'https://cashttree.online/motwal'
  const fullLink = `https://cashttree.online/${slug}`;
  
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .or(`landing_url.ilike.%${slug},landing_url.eq.${slug}`) 
    .eq('is_active', true)   
    .single();

  if (error || !campaign) {
    console.error("❌ Still Not Found. DB Error:", error);
    return notFound(); 
  }

  // --- 4. PARSE DESCRIPTION ---
  const steps = campaign.description 
    ? campaign.description.split(/\n|\d+\.\s+/).filter(line => line.trim().length > 0)
    : ["Register to continue", "Complete verification", "Get Reward"];

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Mesh */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#111827,#000)] -z-10" />
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Offer Card */}
      <div className="w-full max-w-md bg-[#0a0a0f] border border-[#222] rounded-3xl p-6 md:p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#111] border border-[#222] rounded-2xl mb-4 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
             {campaign.icon_url ? (
               <img src={campaign.icon_url} alt={campaign.title} className="w-10 h-10 object-contain" />
             ) : (
               <span className="text-3xl">🎁</span>
             )}
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">{campaign.title}</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 border border-green-900/50 text-green-400 text-[10px] font-bold uppercase tracking-wider">
            <Zap size={12} fill="currentColor" /> Earn ₹{campaign.user_reward} Cash
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#111] border border-[#222] border-dashed rounded-xl p-5 mb-6">
           <strong className="text-xs text-gray-500 uppercase tracking-widest block mb-3">Steps to Qualify:</strong>
           <ul className="space-y-3">
             {steps.map((step, i) => (
               <li key={i} className="text-xs text-gray-300 flex gap-3 leading-relaxed">
                 <span className="text-green-500 font-bold shrink-0 mt-0.5">{i+1}.</span> 
                 {step}
               </li>
             ))}
           </ul>
        </div>

        {/* Form */}
        <form action={submitLead} className="space-y-4">
          <input type="hidden" name="campaign_id" value={campaign.id} />
          <input type="hidden" name="referral_code" value={refCode || ''} />
          <input type="hidden" name="redirect_url" value={campaign.affiliate_link || '#'} />

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
            <input name="user_name" required placeholder="e.g. Rahul Kumar" className="w-full bg-[#050505] border border-[#222] text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-green-500/50 transition-colors" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Phone Number</label>
            <input name="phone" type="tel" required placeholder="+91 98765 43210" className="w-full bg-[#050505] border border-[#222] text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-green-500/50 transition-colors" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">UPI ID (For Payment)</label>
            <input name="upi_id" type="text" required placeholder="e.g. 9876543210@ybl" className="w-full bg-[#050505] border border-[#222] text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-green-500/50 transition-colors" />
          </div>

          <button type="submit" className="w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-extrabold text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] mt-2 uppercase tracking-wide flex items-center justify-center gap-2">
            Submit & Start Mission <ArrowRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}