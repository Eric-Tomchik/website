import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/debug — Test GA4 connection end-to-end.
 * Protected by admin session cookie. DELETE THIS FILE after debugging.
 */

function b64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function GET(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result: Record<string, unknown> = { build: 'e01f1d2' };

  // 1. Check env vars
  const saJson = process.env.GOOGLE_SA_CREDENTIALS;
  const ga4Property = process.env.GA4_PROPERTY_ID ?? '536329957';
  result.ga4_property = ga4Property;
  result.has_sa_creds = !!saJson;

  if (!saJson) {
    result.error = 'GOOGLE_SA_CREDENTIALS missing';
    return NextResponse.json(result);
  }

  // 2. Parse SA credentials
  let clientEmail: string;
  let privateKey: string;
  let tokenUri: string;
  try {
    const parsed = JSON.parse(saJson);
    clientEmail = parsed.client_email;
    privateKey = parsed.private_key;
    tokenUri = parsed.token_uri || 'https://oauth2.googleapis.com/token';
    result.sa_email = clientEmail;
    result.key_length = privateKey?.length ?? 0;
  } catch (e: any) {
    result.error = `JSON parse failed: ${e.message}`;
    return NextResponse.json(result);
  }

  // 3. Try to get access token
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claim = b64url(JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: tokenUri,
      exp: now + 3600,
      iat: now,
    }));

    const encoder = new TextEncoder();
    const signData = encoder.encode(`${header}.${claim}`);

    // Import private key
    const pemBody = privateKey.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
    const keyBuffer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8', keyBuffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'],
    );
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, signData);
    const signature = b64url(String.fromCharCode(...new Uint8Array(sig)));
    const jwt = `${header}.${claim}.${signature}`;

    result.jwt_created = true;

    // Exchange JWT for access token
    const tokenRes = await fetch(tokenUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    });

    const tokenBody = await tokenRes.text();
    if (!tokenRes.ok) {
      result.error = `Token exchange failed (${tokenRes.status}): ${tokenBody.slice(0, 500)}`;
      return NextResponse.json(result);
    }

    const { access_token } = JSON.parse(tokenBody);
    result.token_obtained = true;

    // 4. Try a simple GA4 realtime request
    const gaUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${ga4Property}:runRealtimeReport`;
    const gaRes = await fetch(gaUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics: [{ name: 'activeUsers' }] }),
    });

    const gaBody = await gaRes.text();
    if (!gaRes.ok) {
      result.error = `GA4 API failed (${gaRes.status}): ${gaBody.slice(0, 500)}`;
      return NextResponse.json(result);
    }

    const gaData = JSON.parse(gaBody);
    const activeUsers = gaData.rows?.[0]?.metricValues?.[0]?.value ?? '0';
    result.success = true;
    result.active_users_realtime = activeUsers;

  } catch (e: any) {
    result.error = `Exception: ${e.message}`;
  }

  return NextResponse.json(result);
}
