export const dynamic = 'force-dynamic';


import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  // 🔒 clear session cookie
  cookies().set({
    name: 'ct_session',
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });

  return NextResponse.json({ success: true });
}
