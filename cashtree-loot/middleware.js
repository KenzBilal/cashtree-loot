import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const { pathname } = url;

  // 1. Double-Check: Is this an Admin path?
  if (pathname.startsWith('/admin')) {
    
    // 2. SECURITY CHECK: Look for "?secret=MY_PASS" in the URL
    // Change 'MY_PASS' to your own strong password
    const secret = url.searchParams.get('secret');
    
    if (secret !== 'MY_PASS') { 
      // 3. If no secret, FORCE redirect to Login
      // We use a 307 redirect to preserve the request method if needed
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// --- THE CRITICAL FIX ---
export const config = {
  // Use an ARRAY to lock strictly:
  // 1. The main /admin page
  // 2. ANY sub-page inside /admin (files, inquiries, etc.)
  matcher: [
    '/admin', 
    '/admin/:path*'
  ], 
};