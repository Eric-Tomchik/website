import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUBDOMAIN_TARGETS: Record<string, { origin: string; defaultPath: string; basePath?: string }> = {
  boonies: { origin: 'https://boonies-bsl-b04f03d9.viktor.space', defaultPath: '/' },
  rickeys: { origin: 'https://rickeys-on-coleman-980a4959.viktor.space', defaultPath: '/' },
  wickedpig: { origin: 'https://wicked-pig-bsl-d1b371ec.viktor.space', defaultPath: '/wickedpig.html' },
  henhouse: { origin: 'https://hen-house-bsl-c6861667.viktor.space', defaultPath: '/henhouse.html' },
  uglypirate: { origin: 'https://ugly-pirate-13a0ae30.viktor.space', defaultPath: '/' },
  butcherblock: { origin: 'https://preview-butcher-block-site-2206c411.viktor.space', defaultPath: '/butcherblock.html' },
  danbs: { origin: 'https://preview-dan-bs-bsl-79b3a67f.viktor.space', defaultPath: '/danbs.html' },
  cosmos: { origin: 'https://preview-cosmos-bsl-7af4fc1f.viktor.space', defaultPath: '/cosmos.html' },
  lemoines: { origin: 'https://preview-lemoines-landing-d7a7aff8.viktor.space', defaultPath: '/lemoines.html' },
  sparkles: { origin: 'https://sparklestravelgroup.github.io', defaultPath: '/webcommunity/', basePath: '/webcommunity' },
};

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://www.paypal.com https://static.cloudflareinsights.com https://connect.facebook.net https://app.cal.com https://cal.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://app.cal.com https://cal.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://api.stripe.com https://www.google-analytics.com https://www.paypal.com https://api.resend.com https://cloudflareinsights.com https://www.facebook.com https://app.cal.com https://cal.com",
    "frame-src 'self' blob: https://*.convex.cloud https://js.stripe.com https://www.paypal.com https://*.viktor.space https://*.github.io https://app.cal.com https://cal.com",
    "object-src 'none'", "base-uri 'self'", "form-action 'self'", "upgrade-insecure-requests",
  ].join('; ');
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join('')).replace(/=+$/, '');
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function verifyAdminSession(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [data, signature] = parts;
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const signatureBytes = Uint8Array.from(decodeBase64Url(signature), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, new TextEncoder().encode(data));
    if (!valid) return false;
    const payload = JSON.parse(decodeBase64Url(data));
    const now = Date.now();
    return payload?.admin === true && typeof payload?.exp === 'number' && payload.exp > now &&
      typeof payload?.iat === 'number' && payload.iat <= now + 60_000 && payload.exp - payload.iat <= 7 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  try {
    const host = request.headers.get('host') ?? '';
    const { pathname } = request.nextUrl;

    const subMatch = host.match(/^([a-z]+)\.erictomchik\.com$/i);
    if (subMatch) {
      const target = SUBDOMAIN_TARGETS[subMatch[1].toLowerCase()];
      if (target) {
        try {
          const proxyPath = pathname === '/' ? target.defaultPath : target.basePath ? `${target.basePath}${pathname}` : pathname;
          const proxyUrl = new URL(proxyPath, target.origin);
          proxyUrl.search = request.nextUrl.search;
          return NextResponse.rewrite(proxyUrl);
        } catch {
          return new NextResponse('<!DOCTYPE html><html><body>Temporarily Unavailable</body></html>', {
            status: 503, headers: { 'Content-Type': 'text/html', 'Retry-After': '60' },
          });
        }
      }
    }

    const nonce = generateNonce();
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);

    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const session = request.cookies.get('admin_session')?.value;
      if (!session || !(await verifyAdminSession(session))) {
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('admin_session');
        response.cookies.delete('admin_ck');
        return response;
      }
    }

    // Portal middleware is navigation protection only; every data operation is
    // authorized again inside Convex using the opaque portal session token.
    if (pathname.startsWith('/portal') && pathname !== '/portal/login') {
      if (!request.cookies.get('portal_session')?.value) {
        return NextResponse.redirect(new URL('/portal/login', request.url));
      }
    }

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('Content-Security-Policy', buildCsp(nonce));
    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json).*)'] };
