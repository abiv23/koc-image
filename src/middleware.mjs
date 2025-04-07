import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Define public paths
  const isPublicPath = path === '/' || path === '/login' || path === '/register';
  
  // Define admin paths
  const isAdminPath = path.startsWith('/admin');
  
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect logic for authentication
  if ((path === '/login' || path === '/register') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Check for admin route access
  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check if user is an admin
    const isAdmin = token.isAdmin === true;
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // General authentication check
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
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