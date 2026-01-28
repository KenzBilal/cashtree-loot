import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import LeadsInterface from './LeadsInterface';

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateLeadStatus(leadId, newStatus) {
  'use server';
  const { error } = await supabaseAdmin
    .from('leads')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', leadId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/leads');
  return { success: true };
}

export default async function LeadsPage() {
  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    // FIXED LINE BELOW: Using simple quotes, no backslashes
    .select('*, campaigns(title, payout_amount), accounts(username, phone)')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>;

  const stats = {
    pendingCount: leads.filter(l => l.status === 'pending').length,
    approvedCount: leads.filter(l => l.status === 'approved').length,
    rejectedCount: leads.filter(l => l.status === 'rejected').length,
    pendingValue: leads.filter(l => l.status === 'pending').reduce((sum, l) => sum + (l.campaigns?.payout_amount || 0), 0)
  };

  return <LeadsInterface initialData={leads || []} stats={stats} updateStatusAction={updateLeadStatus} />;
}