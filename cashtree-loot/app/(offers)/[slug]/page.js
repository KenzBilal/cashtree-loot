import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { submitLead } from './actions';
import { ShieldCheck, Zap } from 'lucide-react';

// --- 1. SETUP SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const dynamic = 'force-dynamic';

export default async function OfferPage(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const refCode = searchParams.ref;

  // Search Campaign
  const fullLink = `https://cashttree.online/${slug}`;
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .or(`landing_url.ilike.%${slug},landing_url.eq.${slug}`)
    .eq('is_active', true)
    .single();

  if (error || !campaign) return notFound();

  // Parse Steps
  const steps = campaign.description 
    ? campaign.description.split(/\n|\d+\.\s+/).filter(line => line.trim().length > 0)
    : ["Register using your Phone Number", "Complete basic profile", "Reward credited to UPI"];

  return (
    <div className="page-wrapper">
      
      {/* BACKGROUND MESH (Premium Dark Aura) */}
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />
      <div className="bg-grid" />

      {/* MAIN GLASS CARD */}
      <div className="glass-card">
        
        {/* BRANDING */}
        <div className="brand-header">
           <div className="brand-logo">
             <span className="text-white">Cash</span><span className="text-green">Tree</span>
           </div>
           <div className="brand-badge">LOOT</div>
        </div>

        {/* CAMPAIGN TITLE */}
        <div className="hero-section">
          <div className="icon-box">
            {campaign.icon_url ? (
              <img src={campaign.icon_url} alt={campaign.title} />
            ) : (
              <span style={{fontSize:'24px'}}>🎁</span>
            )}
          </div>
          <div>
            <h1>{campaign.title}</h1>
            <div className="verified-badge">
              <ShieldCheck size={12} strokeWidth={3} /> Verified Offer
            </div>
          </div>
        </div>

        {/* EARNINGS (Frosted Green Glass) */}
        <div className="earn-glass">
          <div className="earn-header">
            <Zap size={14} fill="currentColor" /> YOUR REWARD: ₹{campaign.user_reward}
          </div>
          <ul className="earn-steps">
             {steps.map((step, i) => (
               <li key={i}><span>{i+1}.</span> {step}</li>
             ))}
          </ul>
        </div>

        {/* FORM SECTION */}
        <form action={submitLead} className="form-stack">
          <input type="hidden" name="campaign_id" value={campaign.id} />
          <input type="hidden" name="referral_code" value={refCode || ''} />
          <input type="hidden" name="redirect_url" value={campaign.affiliate_link || '#'} />

          <div className="input-group">
            <label>Full Name</label>
            <input name="user_name" type="text" placeholder="e.g. Rahul Kumar" required />
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input name="phone" type="tel" placeholder="98765 XXXXX" required />
          </div>

          <div className="input-group">
            <label>UPI ID (For Payment)</label>
            <input name="upi_id" type="text" placeholder="username@upi" required />
          </div>

          {/* REFERRAL BOX (If exists) */}
          {refCode && (
             <div className="referral-box">
                <span className="label">Referral Applied</span>
                <span className="code">{refCode.toUpperCase()}</span>
             </div>
          )}

          <button type="submit" className="neon-btn">
            Submit & Download App
          </button>
        </form>

        <p className="footer-text">
           100% Safe & Secure • Instant Tracking
        </p>

      </div>

      {/* --- PREMIUM CSS STYLES --- */}
      <style>{`
        :root {
          --bg: #030305;
          --glass-surface: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.08);
          --glass-highlight: rgba(255, 255, 255, 0.15);
          --neon: #00ff88;
          --neon-glow: rgba(0, 255, 136, 0.4);
        }

        .page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', system-ui, sans-serif;
          color: #fff;
          padding: 20px;
          position: relative;
          background: var(--bg);
          overflow: hidden;
        }

        /* --- AMBIENT LIGHTING --- */
        .bg-glow-1 {
          position: fixed; top: -10%; left: -10%; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(0,255,136,0.08), transparent 70%);
          z-index: 0; pointer-events: none;
        }
        .bg-glow-2 {
          position: fixed; bottom: -10%; right: -10%; width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%);
          z-index: 0; pointer-events: none;
        }
        .bg-grid {
          position: fixed; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
          z-index: 0; pointer-events: none;
        }

        /* --- THE GLASS CARD --- */
        .glass-card {
          width: 100%; max-width: 420px;
          position: relative; z-index: 10;
          
          /* The Magic Glass Effect */
          background: rgba(10, 10, 15, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          
          border: 1px solid var(--glass-border);
          border-top: 1px solid var(--glass-highlight); /* Top highlight for 3D feel */
          border-radius: 24px;
          padding: 32px;
          
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.6), /* Deep Shadow */
            0 0 0 1px rgba(0,0,0,0.2); /* Black ring */
        }

        /* --- BRANDING --- */
        .brand-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .brand-logo { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
        .text-white { color: #fff; }
        .text-green { color: var(--neon); }
        
        .brand-badge {
          font-size: 10px; font-weight: 800; background: #fff; color: #000;
          padding: 2px 6px; border-radius: 4px; letter-spacing: 1px;
        }

        /* --- HERO SECTION --- */
        .hero-section { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        
        .icon-box {
          width: 56px; height: 56px; 
          background: rgba(255,255,255,0.03); 
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
        }
        .icon-box img { width: 32px; height: 32px; object-fit: contain; }

        h1 { margin: 0; font-size: 1.5rem; font-weight: 800; line-height: 1.1; }
        
        .verified-badge {
          display: inline-flex; align-items: center; gap: 4px;
          margin-top: 6px;
          font-size: 11px; font-weight: 700; color: var(--neon);
          background: rgba(0, 255, 136, 0.1);
          padding: 4px 8px; border-radius: 100px;
          border: 1px solid rgba(0, 255, 136, 0.2);
        }

        /* --- EARN GLASS BOX --- */
        .earn-glass {
          background: linear-gradient(180deg, rgba(34,197,94,0.05), transparent);
          border: 1px solid rgba(34,197,94,0.15);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .earn-header {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.5px;
          color: var(--neon); margin-bottom: 10px;
        }
        .earn-steps { list-style: none; padding: 0; margin: 0; }
        .earn-steps li {
          font-size: 13px; color: #ccc; margin-bottom: 6px; display: flex; gap: 8px;
        }
        .earn-steps li span { color: var(--neon); font-weight: 700; }

        /* --- FORM --- */
        .form-stack { display: flex; flex-direction: column; gap: 16px; }
        
        .input-group label {
          display: block; font-size: 11px; font-weight: 600; 
          color: #888; text-transform: uppercase; margin-bottom: 6px; padding-left: 4px;
        }
        
        .input-group input {
          width: 100%;
          background: rgba(0, 0, 0, 0.3); /* Deep inputs */
          border: 1px solid var(--glass-border);
          padding: 14px 16px;
          border-radius: 12px;
          color: #fff; font-size: 14px; font-weight: 500;
          transition: all 0.2s;
        }
        .input-group input:focus {
          outline: none;
          background: rgba(0, 0, 0, 0.5);
          border-color: var(--neon);
          box-shadow: 0 0 15px -5px var(--neon-glow);
        }

        /* --- REFERRAL BOX --- */
        .referral-box {
          background: rgba(255,255,255,0.05);
          border: 1px dashed rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .referral-box .label { font-size: 11px; color: #aaa; font-weight: 600; }
        .referral-box .code { font-size: 13px; color: #fff; font-weight: 700; letter-spacing: 1px; }

        /* --- NEON BUTTON --- */
        .neon-btn {
          width: 100%;
          background: var(--neon);
          color: #000;
          font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
          padding: 16px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.2s;
          box-shadow: 0 0 20px -5px var(--neon-glow);
        }
        .neon-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -5px var(--neon-glow);
        }

        .footer-text {
          text-align: center; font-size: 11px; color: #555; margin-top: 24px; font-weight: 500;
        }

        /* --- MOBILE TWEAKS --- */
        @media (max-width: 600px) {
          .glass-card { 
             border: none; 
             background: rgba(10, 10, 15, 0.8); /* Darker on mobile for readability */
             backdrop-filter: blur(40px);
             box-shadow: none;
          }
          .page-wrapper { padding: 0; background: #000; }
        }
      `}</style>
    </div>
  );
}