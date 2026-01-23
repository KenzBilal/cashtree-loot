export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);




export async function POST(req) {
  try {
    const { leadId } = await req.json();
    if (!leadId) return NextResponse.json({ message: 'INVALID REQUEST' }, { status: 400 });

    const token = cookies().get('ct_session')?.value;
    if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

    const { data: auth } = await supabaseAuth.auth.getUser(token);
    if (!auth?.user) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

    const { data: admin } = await supabase
      .from('accounts')
      .select('role, is_frozen')
      .eq('id', auth.user.id)
      .single();

    if (!admin || admin.role !== 'admin' || admin.is_frozen)
      return NextResponse.json({ message: 'FORBIDDEN' }, { status: 403 });

    // call DB function (best practice)
    const { error } = await supabaseAdmin.rpc('approve_lead', { p_lead_id: leadId });
    if (error) throw error;
    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ message: 'FAILED' }, { status: 500 });
  }
}
