import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Portfolio subdomain → Viktor Space redirects ─────────────────────────────
const SUBDOMAIN_REDIRECTS: Record<string, string> = {
  boonies: 'https://preview-boonies-on-the-bayou-c3c54177.viktor.space/',
  rickeys: 'https://rickeys-on-coleman-980a4959.viktor.space/',
  wickedpig: 'https://wicked-pig-bsl-d1b371ec.viktor.space/wickedpig.html',
  henhouse: 'https://hen-house-bsl-c6861667.viktor.space/henhouse.html',
  uglypirate: 'https://ugly-pirate-13a0ae30.viktor.space/',
  butcherblock: 'https://preview-butcher-block-site-2206c411.viktor.space/butcherblock.html',
  danbs: 'https://preview-dan-bs-bsl-79b3a67f.viktor.space/danbs.html',
  cosmos: 'https://preview-cosmos-bsl-7af4fc1f.viktor.space/cosmos.html',
  lemoines: 'https://preview-lemoines-landing-d7a7aff8.viktor.space/lemoines.html',
};

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const { pathname } = request.nextUrl;

  // ── Subdomain redirect (portfolio showcase projects) ───────────────────────
  const subMatch = host.match(/^([a-z]+)\.erictomchik\.com$/i);
  if (subMatch) {
    const sub = subMatch[1].toLowerCase();
    const target = SUBDOMAIN_REDIRECTS[sub];
    if (target) {
      return NextResponse.redirect(target, 301);
    }
  }

  // ── Protect admin routes (except login page) ──────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Note: full HMAC verification happens in the layout (Node.js runtime);
    // middleware provides a fast first-pass check at the edge.
  }

  // ── Protect portal routes (except login page) ─────────────────────────────
  if (pathname.startsWith('/portal') && pathname !== '/portal/login') {
    const portalSession = request.cookies.get('portal_session');
    if (!portalSession?.value) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|previews|icons|manifest.json).*)'],
};
