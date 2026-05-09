import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Portfolio subdomain → Viktor Space proxy (URL masking) ───────────────────
// Each entry maps a subdomain to its origin base and default page path.
const SUBDOMAIN_TARGETS: Record<string, { origin: string; defaultPath: string; basePath?: string }> = {
  boonies: {
    origin: 'https://boonies-bsl-b04f03d9.viktor.space',
    defaultPath: '/',
  },
  rickeys: {
    origin: 'https://rickeys-on-coleman-980a4959.viktor.space',
    defaultPath: '/',
  },
  wickedpig: {
    origin: 'https://wicked-pig-bsl-d1b371ec.viktor.space',
    defaultPath: '/wickedpig.html',
  },
  henhouse: {
    origin: 'https://hen-house-bsl-c6861667.viktor.space',
    defaultPath: '/henhouse.html',
  },
  uglypirate: {
    origin: 'https://ugly-pirate-13a0ae30.viktor.space',
    defaultPath: '/',
  },
  butcherblock: {
    origin: 'https://preview-butcher-block-site-2206c411.viktor.space',
    defaultPath: '/butcherblock.html',
  },
  danbs: {
    origin: 'https://preview-dan-bs-bsl-79b3a67f.viktor.space',
    defaultPath: '/danbs.html',
  },
  cosmos: {
    origin: 'https://preview-cosmos-bsl-7af4fc1f.viktor.space',
    defaultPath: '/cosmos.html',
  },
  lemoines: {
    origin: 'https://preview-lemoines-landing-d7a7aff8.viktor.space',
    defaultPath: '/lemoines.html',
  },
  sparkles: {
    origin: 'https://sparklestravelgroup.github.io',
    defaultPath: '/webcommunity/',
    basePath: '/webcommunity',
  },
};

export function middleware(request: NextRequest) {
  try {
    const host = request.headers.get('host') ?? '';
    const { pathname } = request.nextUrl;

    // ── Subdomain proxy (portfolio showcase projects) ──────────────────────────
    // Serves Viktor Space content while keeping the subdomain URL in the browser.
    const subMatch = host.match(/^([a-z]+)\.erictomchik\.com$/i);
    if (subMatch) {
      const sub = subMatch[1].toLowerCase();
      const target = SUBDOMAIN_TARGETS[sub];
      if (target) {
        try {
          // Root path → serve the default page; other paths → prepend basePath if set
          const proxyPath =
            pathname === '/'
              ? target.defaultPath
              : target.basePath
                ? `${target.basePath}${pathname}`
                : pathname;
          const proxyUrl = new URL(proxyPath, target.origin);
          proxyUrl.search = request.nextUrl.search;
          return NextResponse.rewrite(proxyUrl);
        } catch {
          // If the upstream is unreachable or URL is malformed, return a friendly error
          return new NextResponse(
            '<!DOCTYPE html><html><body style="font-family:system-ui;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#0a0f1c;color:#fff"><div style="text-align:center"><h1>Temporarily Unavailable</h1><p>This site is currently down for maintenance. Please try again later.</p></div></body></html>',
            { status: 503, headers: { 'Content-Type': 'text/html', 'Retry-After': '60' } }
          );
        }
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
  } catch {
    // Catch-all: never let middleware crash the entire request
    return NextResponse.next();
  }
}

export const config = {
  // NOTE: Do NOT exclude /images, /previews, /icons, or /assets here — they
  // must pass through middleware so subdomain proxying can serve portfolio-site
  // images & scripts. The overhead for main-domain requests is negligible
  // (middleware falls through to NextResponse.next()).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json).*)'],
};
