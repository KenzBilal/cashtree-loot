export const dynamic = 'force-dynamic';


import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/* =========================================================
   POST /api/promoter/signup
   (Public → Server-only → No session yet)
========================================================= */
export async function POST(req) {
  try {
    const {
      username,
      password,
      full_name,
      phone,
      upi_id,
      ref
    } = await req.json();

    /* ---------- BASIC VALIDATION ---------- */
    if (!username || !password || password.length < 6) {
      return NextResponse.json(
        { message: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    /* ---------- CREATE AUTH USER ---------- */
    const email = `${username}@cashttree.internal`;

    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

    if (authError || !authUser?.user) {
      return NextResponse.json(
        { message: 'USERNAME_ALREADY_EXISTS' },
        { status: 400 }
      );
    }

    const userId = authUser.user.id;

    /* ---------- HANDLE REFERRAL (OPTIONAL) ---------- */
    let referredBy = null;

    if (ref) {
      const { data: refUser } = await supabaseAdmin
        .from('accounts')
        .select('id')
        .eq('username', ref)
        .eq('role', 'promoter')
        .single();

      if (refUser) {
        referredBy = refUser.id;
      }
    }

    /* ---------- INSERT PROMOTER ACCOUNT ---------- */
    await supabaseAdmin.from('accounts').insert({
      id: userId,
      role: 'promoter',
      username,
      full_name: full_name || null,
      phone: phone || null,
      upi_id: upi_id || null,
      referred_by: referredBy,
      is_frozen: false,
      signup_bonus_given: false,
      referral_bonus_paid: false
    });

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json(
      { message: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
