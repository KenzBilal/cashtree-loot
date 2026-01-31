import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import LeadsInterface from './LeadsInterface';

export const revalidate = 0; // Disable cache so you always see new leads

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- SERVER ACTION (Updates Status) ---
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

// --- MAIN PAGE COMPONENT ---
export default async function LeadsPage() {
  // 1. FETCH DATA
  // ✅ FIX: Use Service Role to bypass RLS
  // We fetch 'payout' from the leads table directly (Snapshot)
  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select(`
      *,
      campaigns ( title, icon_url ),
      accounts ( username, phone )
    `) 
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="p-10 text-red-500 bg-red-900/10 border border-red-500 rounded-xl m-4">
        <strong>Error Loading Leads:</strong> {error.message}
        <br/><span className="text-xs opacity-70">Check if 'leads' table exists and Foreign Keys are correct.</span>
      </div>
    );
  }

  // 2. CALCULATE STATS (Fixed Capitalization & Payout Source)
  const stats = {
    // ✅ FIX: Match the 'Pending' (Capital P) from your database
    pendingCount: leads.filter(l => l.status === 'Pending').length,
    approvedCount: leads.filter(l => l.status === 'Approved').length,
    rejectedCount: leads.filter(l => l.status === 'Rejected').length,
    
    // ✅ FIX: Sum 'l.payout' (The lead's value), NOT the campaign's generic price
    pendingValue: leads
      .filter(l => l.status === 'Pending')
      .reduce((sum, l) => sum + (parseFloat(l.payout) || 0), 0)
  };

  return (
    <LeadsInterface 
      initialData={leads || []} 
      stats={stats} 
      updateStatusAction={updateLeadStatus} 
    />
  );
}