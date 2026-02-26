import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Don't allow fake internal emails
    if (email.endsWith('@cashttree.internal')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Get the session token from cookie to identify the user
    const cookieStore = await cookies();
    const token = cookieStore.get('ct_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check email isn't already taken by another user
    const { data: existing } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('email', email)
      .neq('id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Email already in use by another account' }, { status: 409 });
    }

    // Update Supabase auth email (service role = no confirmation email needed)
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email, email_confirm: true }
    );

    if (updateAuthError) {
      return NextResponse.json({ error: updateAuthError.message }, { status: 500 });
    }

    // Update accounts table
    const { error: updateDbError } = await supabaseAdmin
      .from('accounts')
      .update({ email })
      .eq('id', user.id);

    if (updateDbError) {
      return NextResponse.json({ error: updateDbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}