import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export async function POST() {
  try {
    const token = cookies().get('ct_session')?.value;
    if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

    const { data: auth } = await supabase.auth.getUser(token);
    if (!auth?.user) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

    const userId = auth.user.id;

    const { data: account } = await supabase
      .from('accounts')
      .select('wallet_balance, role, is_frozen')
      .eq('id', userId)
      .single();

    if (!account || account.role !== 'promoter' || account.is_frozen)
      return NextResponse.json({ message: 'FORBIDDEN' }, { status: 403 });

    if (Number(account.wallet_balance) < 500)
      return NextResponse.json({ message: 'INSUFFICIENT BALANCE' }, { status: 400 });

    await supabase
      .from('withdraw_requests')
      .insert({ promoter_id: userId, amount: account.wallet_balance });

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ message: 'SERVER ERROR' }, { status: 500 });
  }
}
