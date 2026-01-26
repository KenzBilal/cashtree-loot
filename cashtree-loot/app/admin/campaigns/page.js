import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import CampaignCard from './campaign-card';

export const revalidate = 0;

export default async function CampaignsPage() {
  // 1. FETCH CAMPAIGNS with Lead Counts
  // We use the .select() with count logic for leads
  const { data: campaigns, error } = await supabaseAdmin
    .from('campaigns')
    .select(`
      *,
      leads ( count )
    `)
    .order('created_at', { ascending: false });

  if (error) return <div className="text-red-500">Error loading campaigns.</div>;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Campaigns</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Manage Offers & Tasks
          </p>
        </div>
        
        {/* NEW CAMPAIGN BUTTON */}
        <Link 
          href="/admin/campaigns/create" 
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg shadow-green-900/20 transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> New Campaign
        </Link>
      </div>

      {/* CAMPAIGN GRID */}
      {campaigns?.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
          <div className="text-slate-500 font-bold">No campaigns yet. Launch one!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} />
          ))}
        </div>
      )}
    </div>
  );
}