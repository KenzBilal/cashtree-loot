// app/api/admin/audit-logs/route.js

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// anon client ONLY for auth verification
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

export async function GET() {
  try {
    // 🔐 session check
    const token = cookies().get('ct_session')?.value;
    if (!token) {
      return NextResponse.json([], { status: 401 });
    }

    const { data: authData, error: authError } =
      await supabaseAuth.auth.getUser(token);

    if (authError || !authData?.user) {
      return NextResponse.json([], { status: 401 });
    }

    // 🔐 admin role check (read-only)
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('accounts')
      .select('role, is_frozen')
      .eq('id', authData.user.id)
      .single();

    if (
      adminError ||
      !admin ||
      admin.role !== 'admin' ||
      admin.is_frozen
    ) {
      return NextResponse.json([], { status: 403 });
    }

    // 📜 read audit logs (admin-only, read-only)
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data || []);

  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
