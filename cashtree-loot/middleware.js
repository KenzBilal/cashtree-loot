import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Get the session cookie
  const session = request.cookies.get('ct_session')?.value;

  // 2. Define Protected Zones
  const isProtectedPath = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  // 3. SECURITY GATE: If trying to access protected area WITHOUT session -> Kick to Login
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // --- LOOP FIX: REMOVED THE AUTO-REDIRECT FROM LOGIN ---
  // We removed the block that said "If at /login and session exists, go to /dashboard".
  // This prevents the infinite loop if the dashboard rejects the token.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/dashboard/:path*', 
    '/login'
  ],
};