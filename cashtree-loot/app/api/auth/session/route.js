import { NextResponse } from 'next/server';

export async function POST(request) {
  const { token } = await request.json();
  
  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  
  response.cookies.set('ct_session', token, {
    httpOnly: true,      // ← JS cannot read this
    secure: true,        // ← HTTPS only
    sameSite: 'lax',
    maxAge: 604800,      // 7 days
    path: '/',
  });

  return response;
}