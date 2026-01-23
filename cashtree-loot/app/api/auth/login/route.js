// app/api/auth/login/route.js

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/* =========================================================
   ANON SUPABASE CLIENT (AUTH ONLY)
   ========================================================= */
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

/* =========================================================
   POST /api/auth/login
   ========================================================= */
export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'INVALID_CREDENTIALS' },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       1. Authenticate (ANON CLIENT ONLY)
       ----------------------------------------- */
    const { data: authData, error: authError } =
      await supabaseAuth.auth.signInWithPassword({
        email: `${username}@cashttree.internal`,
        password
      });

    if (authError || !authData?.user || !authData?.session) {
      return NextResponse.json(
        { message: 'ACCESS_DENIED' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    /* -----------------------------------------
       2. Fetch role from accounts (ADMIN CLIENT)
       ----------------------------------------- */
    const { data: account, error: accountError } =
      await supabaseAdmin
        .from('accounts')
        .select('role, is_frozen')
        .eq('id', userId)
        .single();

    if (accountError || !account) {
      return NextResponse.json(
        { message: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    if (account.is_frozen) {
      return NextResponse.json(
        { message: 'ACCOUNT_SUSPENDED' },
        { status: 403 }
      );
    }

    /* -----------------------------------------
       3. Decide redirect (SERVER DECIDES)
       ----------------------------------------- */
    let redirectPath = '/login';

    if (account.role === 'admin') {
      redirectPath = '/admin';
    } else if (account.role === 'promoter') {
      redirectPath = '/dashboard';
    } else {
      return NextResponse.json(
        { message: 'ACCESS_DENIED' },
        { status: 403 }
      );
    }

    /* -----------------------------------------
       4. Set secure session cookie
       ----------------------------------------- */
    const cookieStore = cookies();

    cookieStore.set({
      name: 'ct_session',
      value: authData.session.access_token,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    /* -----------------------------------------
       5. Success
       ----------------------------------------- */
    return NextResponse.json({ redirect: redirectPath });

  } catch {
    return NextResponse.json(
      { message: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
