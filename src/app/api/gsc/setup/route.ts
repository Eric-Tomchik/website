import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';

/* ─── Shared SA helpers (same as parent route) ─────────────────────── */

interface SACredentials {
  client_email: string;
  private_key: string;
  token_uri: string;
}

function b64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function importPKCS8(pem: string): Promise<CryptoKey> {
  const pemBody = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binary = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    binary,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function getAccessToken(creds: SACredentials, scopes: string[]): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({
      iss: creds.client_email,
      scope: scopes.join(' '),
      aud: creds.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signingInput = `${header}.${payload}`;
  const key = await importPKCS8(creds.private_key);
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput),
  );
  const signature = b64url(String.fromCharCode(...new Uint8Array(sig)));
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch(creds.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

function getSACredentials(): SACredentials | null {
  const json = process.env.GOOGLE_SA_CREDENTIALS;
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    return {
      client_email: parsed.client_email,
      private_key: parsed.private_key,
      token_uri: parsed.token_uri,
    };
  } catch {
    return null;
  }
}

/* ─── GSC Setup route ──────────────────────────────────────────────── */

const GSC_SITE_URL = process.env.GSC_SITE_URL ?? 'sc-domain:erictomchik.com';

export async function POST(req: NextRequest) {
  // Auth check
  const session = req.cookies.get('admin_session')?.value;
  if (!session || !verifyAdminToken(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const creds = getSACredentials();
  if (!creds) {
    return NextResponse.json(
      { error: 'No Google service account credentials configured (GOOGLE_SA_CREDENTIALS).' },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  if (action === 'status') {
    return handleStatus(creds);
  } else if (action === 'getToken') {
    return handleGetToken(creds);
  } else if (action === 'verify') {
    return handleVerify(creds, body.token);
  } else if (action === 'register') {
    return handleRegister(creds);
  }

  return NextResponse.json({ error: 'Invalid action. Use: status, register, getToken, verify' }, { status: 400 });
}

/* ── Step 0: Check current status ──────────────────────────────────── */

async function handleStatus(creds: SACredentials) {
  try {
    const token = await getAccessToken(creds, [
      'https://www.googleapis.com/auth/webmasters.readonly',
    ]);

    // Try to query GSC directly
    const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}/searchAnalytics/query`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        rowLimit: 1,
      }),
    });

    if (res.ok) {
      return NextResponse.json({
        status: 'connected',
        message: 'GSC is connected and working!',
        serviceAccount: creds.client_email,
        siteUrl: GSC_SITE_URL,
      });
    }

    const err = await res.text();
    return NextResponse.json({
      status: 'not_connected',
      message: 'Service account does not have access to this Search Console property.',
      error: err,
      serviceAccount: creds.client_email,
      siteUrl: GSC_SITE_URL,
      nextStep: 'Call with action "register" to try auto-registration, or "getToken" for DNS verification.',
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message,
      serviceAccount: creds.client_email,
    });
  }
}

/* ── Step 1: Try to register the site via Webmasters API ───────────── */

async function handleRegister(creds: SACredentials) {
  try {
    const token = await getAccessToken(creds, [
      'https://www.googleapis.com/auth/webmasters',
    ]);

    // Try to add the site to the service account's Search Console
    const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok || res.status === 204) {
      // Now test if we can actually query
      const testToken = await getAccessToken(creds, [
        'https://www.googleapis.com/auth/webmasters.readonly',
      ]);
      const testUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}/searchAnalytics/query`;
      const testRes = await fetch(testUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
          endDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          rowLimit: 1,
        }),
      });

      if (testRes.ok) {
        return NextResponse.json({
          status: 'success',
          message: 'GSC connected! The service account now has access. Refresh the SEO page.',
        });
      }

      return NextResponse.json({
        status: 'registered_but_no_data',
        message: 'Site registered but data access not yet available. Try DNS verification next.',
        nextStep: 'Call with action "getToken" to get a DNS verification token.',
      });
    }

    const err = await res.text();
    return NextResponse.json({
      status: 'register_failed',
      message: 'Could not register site. DNS verification needed.',
      error: err,
      nextStep: 'Call with action "getToken" to get a DNS verification token.',
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

/* ── Step 2: Get DNS verification token ────────────────────────────── */

async function handleGetToken(creds: SACredentials) {
  try {
    const token = await getAccessToken(creds, [
      'https://www.googleapis.com/auth/siteverification',
    ]);

    // Extract domain from GSC_SITE_URL
    const domain = GSC_SITE_URL.startsWith('sc-domain:')
      ? GSC_SITE_URL.replace('sc-domain:', '')
      : new URL(GSC_SITE_URL).hostname;

    const res = await fetch('https://www.googleapis.com/siteVerification/v1/token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verificationMethod: 'DNS_TXT',
        site: {
          type: 'INET_DOMAIN',
          identifier: domain,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      // Check if it's an API not enabled error
      if (err.includes('has not been used') || err.includes('is disabled')) {
        return NextResponse.json({
          status: 'api_not_enabled',
          message: 'The Google Site Verification API needs to be enabled in your Google Cloud project.',
          steps: [
            '1. Go to Google Cloud Console → APIs & Services → Library',
            '2. Search for "Google Site Verification API"',
            '3. Click Enable',
            '4. Then retry this setup',
          ],
          error: err,
        });
      }
      throw new Error(`Site Verification API error: ${err}`);
    }

    const data = await res.json();
    return NextResponse.json({
      status: 'token_ready',
      message: 'Add this DNS TXT record to your domain, then call with action "verify".',
      dnsRecord: {
        type: 'TXT',
        name: domain,
        value: data.token,
      },
      instructions: [
        `1. Go to your DNS provider (Cloudflare) and add a TXT record:`,
        `   Name: ${domain}`,
        `   Value: ${data.token}`,
        `2. Wait a minute for DNS propagation`,
        `3. Come back and click "Verify" to complete the setup`,
      ],
      token: data.token,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

/* ── Step 3: Verify the DNS record ─────────────────────────────────── */

async function handleVerify(creds: SACredentials, dnsToken?: string) {
  try {
    const token = await getAccessToken(creds, [
      'https://www.googleapis.com/auth/siteverification',
    ]);

    const domain = GSC_SITE_URL.startsWith('sc-domain:')
      ? GSC_SITE_URL.replace('sc-domain:', '')
      : new URL(GSC_SITE_URL).hostname;

    const res = await fetch('https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=DNS_TXT', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site: {
          type: 'INET_DOMAIN',
          identifier: domain,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      if (err.includes('Verification failed')) {
        return NextResponse.json({
          status: 'verification_pending',
          message: 'DNS record not found yet. Make sure the TXT record is added and wait a minute for propagation, then try again.',
          error: err,
        });
      }
      throw new Error(`Verification failed: ${err}`);
    }

    const data = await res.json();
    return NextResponse.json({
      status: 'verified',
      message: 'Domain verified! The service account now has access to Search Console data. Refresh the SEO page.',
      details: data,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
