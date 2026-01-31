import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { submitLead } from './actions';

// --- 1. SETUP SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const dynamic = 'force-dynamic';

export default async function OfferPage(props) {
  // ✅ DATA FETCHING
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const refCode = searchParams.ref;

  // Search logic (Supports both 'motwal' and full URL)
  const fullLink = `https://cashttree.online/${slug}`;
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .or(`landing_url.ilike.%${slug},landing_url.eq.${slug}`)
    .eq('is_active', true)
    .single();

  if (error || !campaign) return notFound();

  // ✅ DATA PARSING (Convert DB text to Bullet Points)
  // We look for "1. Step" or new lines to break the text into the list
  const steps = campaign.description 
    ? campaign.description.split(/\n|\d+\.\s+/).filter(line => line.trim().length > 0)
    : ["Register using your Phone Number", "Complete basic profile", "Reward credited to UPI"];

  // --- STYLES (Your Exact 'style.css' ported to React) ---
  const colors = {
    bg: '#02050a',
    card: '#0b121a', // Darker card bg
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#eaf2f8',
    muted: '#9aa4af',
    green: '#22c55e',
    greenGlow: 'rgba(34, 197, 94, 0.15)'
  };

  return (
    <div className="page-wrapper">
      
      {/* 1. BACKGROUND (Desktop Only) */}
      <div className="bg-mesh" />

      {/* 2. MAIN CARD */}
      <div className="card">
        
        {/* BRANDING */}
        <div className="brand">
          🌱 CashTree <span style={{color: colors.green}}>Loot</span>
        </div>

        {/* TITLE & BADGE */}
        <h1>{campaign.title}</h1>
        <div className="badge">Verified App Offer</div>

        {/* EARN BOX (Green Gradient) */}
        <div className="earn-box">
          <strong>How you earn ₹{campaign.user_reward}:</strong>
          <ul style={{margin: '8px 0 0 0', paddingLeft: '20px', color: '#d1fae5'}}>
             {steps.map((step, i) => (
               <li key={i} style={{marginBottom: '4px'}}>{step}</li>
             ))}
          </ul>
        </div>

        {/* INFO BOX (Dashed Border) */}
        <div className="info-box">
            <strong>Requirements:</strong><br/>
            • Aadhaar linked to Mobile<br/>
            • Valid PAN Card (If required)<br/>
            • New Users Only<br/>
            • <strong style={{color: '#fff'}}>Reward: ₹{campaign.user_reward}</strong>
        </div>

        {/* FORM SECTION */}
        <form action={submitLead}>
          <input type="hidden" name="campaign_id" value={campaign.id} />
          <input type="hidden" name="referral_code" value={refCode || ''} />
          <input type="hidden" name="redirect_url" value={campaign.affiliate_link || '#'} />

          {/* NAME FIELD (New Requirement) */}
          <div className="section">
            <label>Full Name</label>
            <input name="user_name" type="text" placeholder="Your Name" required />
          </div>

          {/* PHONE FIELD */}
          <div className="section">
            <label>Phone Number (Used for Signup)</label>
            <input name="phone" type="tel" placeholder="Enter 10-digit mobile number" required />
          </div>

          {/* UPI FIELD */}
          <div className="section">
            <label>Your UPI ID (For Payment)</label>
            <input name="upi_id" type="text" placeholder="Ex: name@upi" required />
          </div>

          {/* REFERRAL CODE BOX (Glassmorphism) */}
          {refCode && (
             <div className="referral-glass">
                <span className="ref-label">Referral Applied</span>
                <div className="ref-code">
                   <span>✨ {refCode.toUpperCase()}</span>
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
             </div>
          )}

          {/* SUBMIT BUTTON */}
          <button type="submit" className="submit-btn">
            Submit & Download App
          </button>
        
        </form>

        <p style={{fontSize: '12px', textAlign: 'center', marginTop: '20px', color: '#555'}}>
           100% Safe & Secure • Instant Tracking
        </p>

      </div>

      {/* --- CSS IN JS (Scoped to this page) --- */}
      <style>{`
        /* GLOBAL RESET FOR THIS PAGE */
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, sans-serif;
          color: ${colors.text};
          padding: 20px;
          position: relative;
        }

        /* BACKGROUND MESH (Your requested radial gradient) */
        .bg-mesh {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at top, #111827, #02050a);
          z-index: -1;
        }

        /* CARD STYLES (Exact Match) */
        .card {
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.03); /* Glass Effect */
          border: 1px solid ${colors.border};
          border-radius: 22px;
          padding: 26px;
          backdrop-filter: blur(10px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
          z-index: 10;
        }

        /* TYPOGRAPHY */
        .brand { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-weight: 800; font-size: 20px; }
        h1 { margin: 0; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; }
        
        .badge {
          display: inline-block;
          margin-top: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          background: ${colors.greenGlow};
          color: ${colors.green};
          font-size: 0.85rem;
          font-weight: 700;
        }

        /* BOXES */
        .earn-box {
          margin-top: 20px;
          background: linear-gradient(135deg, rgba(34,197,94,0.1), transparent);
          border: 1px solid rgba(34,197,94,0.2);
          padding: 15px;
          border-radius: 12px;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .info-box {
          margin-top: 15px;
          padding: 15px;
          border-radius: 12px;
          background: rgba(0,0,0,0.3);
          border: 1px dashed ${colors.border};
          font-size: 0.9rem;
          color: ${colors.muted};
          line-height: 1.6;
        }

        /* FORM INPUTS */
        .section { margin-top: 20px; }
        label { display: block; font-size: 0.85rem; color: ${colors.muted}; margin-bottom: 8px; margin-left: 4px; font-weight: 500; }
        
        input {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid ${colors.border};
          background: #0b121a;
          color: ${colors.text};
          font-size: 16px;
          transition: all 0.2s;
        }
        input:focus {
          outline: none;
          border-color: ${colors.green};
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
        }

        /* NEW REFERRAL GLASS BOX */
        .referral-glass {
          margin-top: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ref-label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: 700; letter-spacing: 1px; }
        .ref-code { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #fff; font-size: 14px; }

        /* BUTTON */
        .submit-btn {
          width: 100%;
          margin-top: 25px;
          padding: 16px;
          border-radius: 14px;
          border: none;
          background: ${colors.green};
          color: #000;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          transition: 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .submit-btn:hover {
          background: #16a34a;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(34, 197, 94, 0.4);
        }

        /* MOBILE OPTIMIZATION */
        @media (max-width: 600px) {
          .bg-mesh { display: none; } /* Remove heavy background on mobile */
          .page-wrapper { background: #000; padding: 10px; align-items: flex-start; }
          .card { border: none; background: transparent; box-shadow: none; padding: 10px; }
          .submit-btn { position: sticky; bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        }
      `}</style>
    </div>
  );
}