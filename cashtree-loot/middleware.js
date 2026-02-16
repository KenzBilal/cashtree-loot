import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. CHECK FOR SESSION
  // We look for the "ct_session" cookie you set in page.js line 70
  const session = request.cookies.get('ct_session')?.value;

  // 2. DEFINE PROTECTED ZONES
  // This covers /admin, /admin/files, /admin/inquiries, etc.
  // I added /dashboard too so users can't skip login to see that either.
  const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  // 3. SECURITY GATE
  // If trying to enter a protected zone WITHOUT a session -> Kick to Login
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. CONVENIENCE REDIRECT
  // If they are ALREADY logged in but try to go to /login -> Send to Dashboard
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 5. MATCHER CONFIGURATION
  // This tells Next.js to ONLY run this check on these specific paths.
  // It ignores your API, images, and static files so the site stays fast.
  matcher: [
    '/admin/:path*',     // Locks Admin & all sub-pages
    '/dashboard/:path*', // Locks Dashboard & all sub-pages
    '/login'             // Checks login page for redirect
  ],
};