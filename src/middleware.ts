import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Note: full HMAC verification happens in the layout (Node.js runtime);
    // middleware provides a fast first-pass check at the edge.
  }

  // Protect portal routes (except login page)
  if (pathname.startsWith('/portal') && pathname !== '/portal/login') {
    const portalSession = request.cookies.get('portal_session');
    if (!portalSession?.value) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
};
