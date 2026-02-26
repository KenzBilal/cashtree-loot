import { NextResponse } from 'next/server';

// SET session cookies on login
export async function POST(request) {
  const { access_token, refresh_token } = await request.json();

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

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
    maxAge: 604800,
    path: '/',
  });

  return response;
}

// REFRESH session (called by layout when access token expires)
export async function GET() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('ct_refresh')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session) {
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set('ct_session', data.session.access_token, {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 604800, path: '/',
    });
    response.cookies.set('ct_refresh', data.session.refresh_token, {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 604800, path: '/',
    });

    return response;
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// CLEAR session on logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('ct_session');
  response.cookies.delete('ct_refresh');
  return response;
}