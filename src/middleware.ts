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

// ── CSP with per-request nonce ──────────────────────────────────────────────
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://www.paypal.com https://static.cloudflareinsights.com https://connect.facebook.net`,
    // style-src keeps 'unsafe-inline' — Next.js and Tailwind inject inline styles
    // that can't be nonce-tagged without a custom document setup
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // img-src allows https: broadly — the news reader shows images from many external sources
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://api.stripe.com https://www.google-analytics.com https://www.paypal.com https://api.resend.com https://cloudflareinsights.com https://www.facebook.com",
    "frame-src 'self' blob: https://*.convex.cloud https://js.stripe.com https://www.paypal.com https://*.viktor.space https://*.github.io",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Base64-encode without padding
  const binStr = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binStr).replace(/=+$/, '');
}

export function middleware(request: NextRequest) {
  try {
    const host = request.headers.get('host') ?? '';
    const { pathname } = request.nextUrl;

    // ── Subdomain proxy (portfolio showcase projects) ──────────────────────────
    const subMatch = host.match(/^([a-z]+)\.erictomchik\.com$/i);
    if (subMatch) {
      const sub = subMatch[1].toLowerCase();
      const target = SUBDOMAIN_TARGETS[sub];
      if (target) {
        try {
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
          return new NextResponse(
            '<!DOCTYPE html><html><body style="font-family:system-ui;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#0a0f1c;color:#fff"><div style="text-align:center"><h1>Temporarily Unavailable</h1><p>This site is currently down for maintenance. Please try again later.</p></div></body></html>',
            { status: 503, headers: { 'Content-Type': 'text/html', 'Retry-After': '60' } }
          );
        }
      }
    }

    // ── Generate CSP nonce ────────────────────────────────────────────────────
    const nonce = generateNonce();
    const csp = buildCsp(nonce);

    // Pass nonce to server components via request header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);

    // ── Protect admin routes (except login page) ──────────────────────────────
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const adminSession = request.cookies.get('admin_session');
      if (!adminSession?.value) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    // ── Protect portal routes (except login page) ─────────────────────────────
    if (pathname.startsWith('/portal') && pathname !== '/portal/login') {
      const portalSession = request.cookies.get('portal_session');
      if (!portalSession?.value) {
        return NextResponse.redirect(new URL('/portal/login', request.url));
      }
    }

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // Set CSP header on the response
    response.headers.set('Content-Security-Policy', csp);

    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json).*)'],
};
