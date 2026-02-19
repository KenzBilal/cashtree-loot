import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { ShieldCheck, Zap } from 'lucide-react';
import OfferForm from './OfferForm';
import PageReveal from './PageReveal';

// ✅ Supabase client defined FIRST
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ✅ Cache wrapper — shared between generateMetadata and OfferPage (1 DB call instead of 2)
const getCampaign = cache(async (slug) => {
  return await supabase
    .from('campaigns')
    .select('*')
    .or(`landing_url.ilike.%${slug},landing_url.eq.${slug}`)
    .eq('is_active', true)
    .single();
});

export const dynamic = 'force-dynamic';

// ✅ SEO Metadata — uses cache, no extra DB call
export async function generateMetadata(props) {
  const { slug } = await props.params;
  const { data: campaign } = await getCampaign(slug);

  if (!campaign) return { title: 'Offer Not Found' };

  return {
    title: `${campaign.title} - Get Rewarded | CashTree`,
    description: `Complete this task and earn instant cashback. Verified offer.`,
    openGraph: {
      images: [campaign.icon_url || 'https://cashttree.online/default-og.png'],
    },
  };
}

export default async function OfferPage(props) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const refCode = searchParams.ref;

  // 1. FETCH CAMPAIGN — uses cache, shared with generateMetadata
  const { data: campaign, error } = await getCampaign(slug);
  if (error || !campaign) return notFound();

  // 2. DYNAMIC PAYOUT LOGIC — single RPC call instead of two sequential ones
  let finalReward = campaign.user_reward;
  let referrerId = null;

  if (refCode) {
    const { data: rows } = await supabase
      .rpc('get_promoter_and_bonus', {
        lookup_name: refCode.trim(),
        p_campaign_id: campaign.id
      });

    if (rows && rows.length > 0) {
      referrerId = rows[0].promoter_id;
      if (rows[0].user_bonus !== null) {
        finalReward = rows[0].user_bonus;
      }
    }
  }

  const steps = campaign.description
    ? campaign.description.split(/\n|\d+\.\s+/).filter(line => line.trim().length > 0)
    : ["Register using your Phone Number", "Complete basic profile", "Reward credited to UPI"];

  return (
    <div className="page-wrapper">
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />
      <div className="bg-grid" />

      {/* ✅ PageReveal guarantees card always animates in, even if page loads instantly */}
      <PageReveal>
        <div className="glass-card">

          {/* BRANDING */}
          <div className="brand-header">
            <div className="brand-logo">
              <span className="text-white">Cash</span><span className="text-green">Tree</span>
            </div>
          </div>

          {/* HERO */}
          <div className="hero-section">
            <div className="icon-box">
              {campaign.icon_url ? (
                <img src={campaign.icon_url} alt={campaign.title} />
              ) : (
                <span style={{ fontSize: '24px' }}>🔥</span>
              )}
            </div>
            <div>
              <h1>{campaign.title}</h1>
              <div className="verified-badge">
                <ShieldCheck size={12} strokeWidth={3} /> Verified Offer
              </div>
            </div>
          </div>

          {/* EARNINGS */}
          <div className="earn-glass">
            <div className="earn-header">
              <Zap size={14} fill="currentColor" /> YOUR REWARD: ₹{finalReward}
            </div>
            <ul className="earn-steps">
              {steps.map((step, i) => (
                <li key={i}><span>{i + 1}.</span> {step}</li>
              ))}
            </ul>
          </div>

          {/* FORM */}
          <OfferForm
            campaignId={campaign.id}
            refCode={refCode}
            referrerId={referrerId}
            redirectUrl={campaign.affiliate_link}
            payoutAmount={finalReward}
          />

          <p className="footer-text">
            100% Safe & Secure • Instant Tracking
          </p>
        </div>
      </PageReveal>

      <style>{`
        :root { --bg: #030305; --glass-border: rgba(255, 255, 255, 0.08); --neon: #00ff88; }

        .page-wrapper {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', system-ui, sans-serif; color: #fff; padding: 20px;
          background: var(--bg); overflow: hidden; position: relative;
        }

        .bg-glow-1 { position: fixed; top: -20%; left: -20%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,255,136,0.06), transparent 70%); z-index: 0; pointer-events: none; }
        .bg-glow-2 { position: fixed; bottom: -20%; right: -20%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%); z-index: 0; pointer-events: none; }
        .bg-grid { position: fixed; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 50px 50px; mask-image: radial-gradient(circle at center, black, transparent 80%); z-index: 0; pointer-events: none; }

        .glass-card {
          width: 100%; max-width: 440px; position: relative; z-index: 10;
          background: rgba(10, 10, 15, 0.65); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border: 1px solid var(--glass-border); border-top: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 28px; padding: 36px;
          box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0,0,0,0.4);
        }

        .brand-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .brand-logo { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
        .text-white { color: #fff; } .text-green { color: var(--neon); }

        .hero-section { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
        .icon-box { width: 64px; height: 64px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 18px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 20px rgba(0,0,0,0.5); }
        .icon-box img { width: 36px; height: 36px; object-fit: contain; }
        h1 { margin: 0; font-size: 1.6rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.5px; }
        .verified-badge { display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; font-size: 11px; font-weight: 700; color: var(--neon); background: rgba(0, 255, 136, 0.08); padding: 5px 10px; border-radius: 100px; border: 1px solid rgba(0, 255, 136, 0.15); }

        .earn-glass { background: linear-gradient(180deg, rgba(34,197,94,0.03), transparent); border: 1px solid rgba(34,197,94,0.1); border-radius: 18px; padding: 20px; margin-bottom: 28px; }
        .earn-header { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; color: var(--neon); margin-bottom: 12px; }
        .earn-steps { list-style: none; padding: 0; margin: 0; }
        .earn-steps li { font-size: 13px; color: #cbd5e1; margin-bottom: 8px; display: flex; gap: 10px; line-height: 1.5; }
        .earn-steps li span { color: var(--neon); font-weight: 700; opacity: 0.8; }

        .footer-text { text-align: center; font-size: 11px; color: #64748b; margin-top: 28px; font-weight: 500; letter-spacing: 0.2px; }

        @media (max-width: 600px) {
          .glass-card { border: none; border-radius: 0; height: 100vh; max-width: 100%; padding: 24px; display: flex; flex-direction: column; justify-content: center; background: rgba(5, 5, 8, 0.95); }
          .page-wrapper { padding: 0; }
        }
      `}</style>
    </div>
  );
}