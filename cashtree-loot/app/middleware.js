import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  
  // 1. Check if the path starts with '/admin' (e.g., /admin, /admin/inquiries, /admin/users)
  if (url.pathname.startsWith('/admin')) {
    
    // 2. SECRET KEY CHECK (Optional Security)
    // You can only access if the URL has ?secret=MY_PASS
    // Example: https://cashttree.online/admin/inquiries?secret=MY_PASS
    const secret = url.searchParams.get('secret');
    
    if (secret !== 'kenz') { // Change 'MY_PASS' to your own secret word
      // 3. If no secret, KICK them to the login page immediately
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// --- CRITICAL FIX: THE WILDCARD MATCHER ---
export const config = {
  // The :path* means "match this path AND anything after it"
  matcher: '/admin/:path*', 
};