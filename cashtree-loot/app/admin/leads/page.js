import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import LeadsInterface from './LeadsInterface';

export const revalidate = 0;

// Initialize Admin Client (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- SERVER ACTIONS (Securely run on server) ---
async function updateLeadStatus(leadId, newStatus) {
  'use server'; // <--- Magic line: Allows Client to call this Server Function

  console.log(`Processing lead ${leadId} to ${newStatus}...`);

  const { error } = await supabaseAdmin
    .from('leads')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', leadId);

  if (error) {
    console.error('Update Error:', error);
    return { success: false, error: error.message };
  }

  // Refresh the page data instantly
  revalidatePath('/admin/leads');
  return { success: true };
}

export default async function LeadsPage() {
  // 1. FETCH DATA
  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select(`
      *,
      campaigns ( title, payout_amount, icon_url ),
      accounts ( id, username, phone )
    `)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return <div className="p-10 text-red-500">Error loading leads: {error.message}</div>;
  }

  // 2. CALCULATE STATS
  const pending = leads.filter(l => l.status === 'pending');
  const approved = leads.filter(l => l.status === 'approved');
  
  const stats = {
    pendingCount: pending.length,
    approvedCount: approved.length,
    rejectedCount: leads.filter(l => l.status === 'rejected').length,
    pendingValue: pending.reduce((sum, l) => sum + (l.campaigns?.payout_amount || 0), 0)
  };

  // 3. RENDER INTERFACE (Pass the Server Action)
  return (
    <div className="fade-in-animation">
      <LeadsInterface 
        initialData={leads || []} 
        stats={stats} 
        updateStatusAction={updateLeadStatus} // <--- Passing the power to the client
      />
    </div>
  );
}