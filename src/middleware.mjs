import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Define public paths - now including the homepage as public
  const isPublicPath = path === '/' || path === '/login' || path === '/register';
  
  // Define admin paths
  const isAdminPath = path.startsWith('/admin');
  
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect logic
  if ((path === '/login' || path === '/register') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Admin route protection
  if (isAdminPath) {
    // Check if user is admin
    const isAdmin = token?.isAdmin === true;
    
    if (!isAdmin) {
      // Redirect non-admin users to homepage
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/register',
        '/upload',
        '/photos',
        '/photo/:path*',
        '/account',
        '/images',
        '/slideshow',
        '/admin/:path*'
    ]
};