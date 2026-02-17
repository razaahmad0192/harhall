import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Redirect based on role after login
    if (pathname === '/login' && token) {
      const role = token.role;
      if (role === 'USER') {
        return NextResponse.redirect(new URL('/user/dashboard', req.url));
      } else if (role === 'HANDYMAN') {
        return NextResponse.redirect(new URL('/handyman/dashboard', req.url));
      }
    }

    // Role-based access control
    if (pathname.startsWith('/user') && token?.role !== 'USER') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (pathname.startsWith('/handyman') && token?.role !== 'HANDYMAN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;
        
        // Allow public routes
        if (pathname === '/' || pathname === '/login' || pathname === '/register') {
          return true;
        }

        // Allow /handymen routes for authenticated users
        if (pathname.startsWith('/handymen')) {
          return !!token;
        }

        // Protect user and handyman routes
        if (pathname.startsWith('/user') || pathname.startsWith('/handyman')) {
          return !!token;
        }

        // Protect API routes (except auth routes)
        if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/user/:path*',
    '/handyman/:path*',
    '/handymen/:path*',
    '/api/:path*',
    '/login',
    '/register',
  ],
};