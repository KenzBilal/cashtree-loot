import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── SET SESSION (called on login) ──
export async function POST(request) {
  const { access_token, refresh_token } = await request.json();

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

  // Store both tokens — access_token for auth, refresh_token to renew it
  response.cookies.set('ct_session', access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 604800, // 7 days
    path: '/',
  });

  response.cookies.set('ct_refresh', refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 604800, // 7 days
    path: '/',
  });

  return response;
}

// ── REFRESH SESSION (called by layout when access token is expired) ──
export async function GET(request) {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('ct_refresh')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    // Use the refresh token to get a new access token
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    // Update both cookies with the new tokens
    response.cookies.set('ct_session', data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 604800,
      path: '/',
    });

    response.cookies.set('ct_refresh', data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 604800,
      path: '/',
    });

    return response;
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ── CLEAR SESSION (called on logout or login page mount) ──
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('ct_session');
  response.cookies.delete('ct_refresh');
  return response;
}