import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Define public paths - now including the homepage as public
  const isPublicPath = path === '/' || path === '/login' || path === '/register';
  
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
        '/slideshow'
    ]
};

// export function middleware(request) {
//   console.log("MIDDLEWARE RUNNING", request.nextUrl.pathname);
//   return Response.redirect(new URL('/login', request.url));
// }