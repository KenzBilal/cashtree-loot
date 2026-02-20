import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Get the session cookie
  const session = request.cookies.get('ct_session')?.value;

  // 2. Define Protected Zones
  const isProtectedPath = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  // 3. Block external POST abuse on session API
  // Only allow session API calls that originate from your own domain
  const isSessionApi = pathname === '/api/auth/session';
  if (isSessionApi) {
    const origin = request.headers.get('origin');
    const host   = request.headers.get('host');
    if (origin && !origin.includes(host)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // 4. SECURITY GATE
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/auth/session',
    '/login',
  ],
};