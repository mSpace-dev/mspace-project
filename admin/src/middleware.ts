import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-2025-agrilink-admin';

// Define protected routes
const protectedRoutes = [
  '/',
  '/send-sms',
  '/email-campaign',
  '/campaign-history',
  '/delivery-persons',
  '/users',
  '/analytics',
  '/settings'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    // Check for access token in cookies
    const accessToken = request.cookies.get('adminAccessToken')?.value;

    if (!accessToken) {
      // No token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify the token
      jwt.verify(accessToken, JWT_SECRET);

      // Token is valid, allow the request
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'session_expired');

      // Clear invalid cookies
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('adminAccessToken');
      response.cookies.delete('adminRefreshToken');
      response.cookies.delete('admin');

      return response;
    }
  }

  // Allow access to public routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
