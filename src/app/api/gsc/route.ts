import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';

/* ─── Google Service-Account helpers (shared pattern w/ analytics) ──── */

interface SACredentials {
  client_email: string;
  private_key: string;
  token_uri: string;
}

let cachedToken: { token: string; expiry: number } | null = null;

function b64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(creds: SACredentials): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiry - 60_000) {
    return cachedToken.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({
      iss: creds.client_email,
      // Both scopes so we can reuse the token if needed
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
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
  cachedToken = { token: data.access_token, expiry: Date.now() + data.expires_in * 1000 };
  return data.access_token;
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

/* ─── GSC API helpers ───────────────────────────────────────────────── */

const GSC_SITE_URL = process.env.GSC_SITE_URL ?? 'https://erictomchik.com';
const GSC_API = 'https://searchconsole.googleapis.com/webmasters/v3';

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

interface GSCRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function gscQuery(
  token: string,
  body: Record<string, unknown>,
): Promise<GSCRow[]> {
  const url = `${GSC_API}/sites/${encodeURIComponent(GSC_SITE_URL)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GSC API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.rows ?? [];
}

/* ─── Fetch functions ───────────────────────────────────────────────── */

async function fetchOverview(token: string, days: number) {
  const startDate = daysAgoStr(days);
  const endDate = daysAgoStr(1); // GSC data lags ~2 days, use yesterday

  // Previous period for comparison
  const prevStart = daysAgoStr(days * 2);
  const prevEnd = daysAgoStr(days + 1);

  const [current, previous, daily] = await Promise.all([
    // Current period totals
    gscQuery(token, { startDate, endDate, rowLimit: 1 }),
    // Previous period totals
    gscQuery(token, { startDate: prevStart, endDate: prevEnd, rowLimit: 1 }),
    // Daily breakdown for sparklines
    gscQuery(token, {
      startDate,
      endDate,
      dimensions: ['date'],
      rowLimit: 500,
    }),
  ]);

  const cur = current[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const prev = previous[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  const pct = (a: number, b: number) =>
    b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 100);

  const dailySeries = daily
    .map((r) => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: Math.round(r.ctr * 1000) / 10,
      position: Math.round(r.position * 10) / 10,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    clicks: cur.clicks,
    impressions: cur.impressions,
    ctr: Math.round(cur.ctr * 1000) / 10,
    position: Math.round(cur.position * 10) / 10,
    trends: {
      clicks: pct(cur.clicks, prev.clicks),
      impressions: pct(cur.impressions, prev.impressions),
      ctr: pct(cur.ctr, prev.ctr),
      position: pct(prev.position, cur.position), // Inverted: lower position is better
    },
    prev: {
      clicks: prev.clicks,
      impressions: prev.impressions,
      ctr: Math.round(prev.ctr * 1000) / 10,
      position: Math.round(prev.position * 10) / 10,
    },
    dailySeries,
  };
}

async function fetchTopQueries(token: string, days: number) {
  const startDate = daysAgoStr(days);
  const endDate = daysAgoStr(1);

  const rows = await gscQuery(token, {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 50,
    orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
  });

  return rows.map((r) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Math.round(r.ctr * 1000) / 10,
    position: Math.round(r.position * 10) / 10,
  }));
}

async function fetchTopPages(token: string, days: number) {
  const startDate = daysAgoStr(days);
  const endDate = daysAgoStr(1);

  const rows = await gscQuery(token, {
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: 50,
    orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
  });

  return rows.map((r) => ({
    page: r.keys[0].replace(GSC_SITE_URL, ''),
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Math.round(r.ctr * 1000) / 10,
    position: Math.round(r.position * 10) / 10,
  }));
}

async function fetchDeviceBreakdown(token: string, days: number) {
  const startDate = daysAgoStr(days);
  const endDate = daysAgoStr(1);

  const rows = await gscQuery(token, {
    startDate,
    endDate,
    dimensions: ['device'],
    rowLimit: 10,
  });

  return rows.map((r) => ({
    device: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Math.round(r.ctr * 1000) / 10,
    position: Math.round(r.position * 10) / 10,
  }));
}

async function fetchCountryBreakdown(token: string, days: number) {
  const startDate = daysAgoStr(days);
  const endDate = daysAgoStr(1);

  const rows = await gscQuery(token, {
    startDate,
    endDate,
    dimensions: ['country'],
    rowLimit: 20,
    orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
  });

  return rows.map((r) => ({
    country: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Math.round(r.ctr * 1000) / 10,
    position: Math.round(r.position * 10) / 10,
  }));
}

/* ─── Convex cache helpers ──────────────────────────────────────────── */

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

async function writeToCache(period: string, data: Record<string, unknown>) {
  const authSecret = process.env.CONVEX_AUTH_SECRET;
  if (!authSecret) return;

  await fetch(`${CONVEX_URL}/api/mutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: 'analytics:update',
      args: {
        adminKey: authSecret,
        type: 'gsc',
        period,
        data: JSON.stringify(data),
      },
    }),
  });
}

/* ─── Route handler ─────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  if (!session || !verifyAdminToken(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') ?? '28');

  const creds = getSACredentials();

  if (creds) {
    try {
      const token = await getAccessToken(creds);

      const [overview, queries, pages, devices, countries] = await Promise.all([
        fetchOverview(token, days),
        fetchTopQueries(token, days),
        fetchTopPages(token, days),
        fetchDeviceBreakdown(token, days),
        fetchCountryBreakdown(token, days),
      ]);

      const result = { overview, queries, pages, devices, countries };

      // Cache in background
      writeToCache(String(days), result).catch(() => {});

      return NextResponse.json(
        { ...result, _source: 'live', _cachedAt: Date.now() },
        { headers: { 'Cache-Control': 'private, max-age=300' } },
      );
    } catch (err: any) {
      console.error('GSC live fetch failed, trying cache:', err.message);

      // Before falling through to cache, check if the connection itself works
      // (newly connected properties may not have data yet)
      try {
        const checkToken = await getAccessToken(creds);
        const checkUrl = `${GSC_API}/sites/${encodeURIComponent(GSC_SITE_URL)}`;
        const checkRes = await fetch(checkUrl, {
          headers: { Authorization: `Bearer ${checkToken}` },
        });
        if (checkRes.ok) {
          // Connection works but no search data yet — return empty dashboard, not an error
          const emptyOverview = {
            clicks: 0, impressions: 0, ctr: 0, position: 0,
            trends: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
            prev: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
            dailySeries: [],
          };
          return NextResponse.json(
            { overview: emptyOverview, queries: [], pages: [], devices: [], countries: [], _source: 'live_empty', _cachedAt: Date.now(), _notice: 'GSC is connected but has no search data yet. Data usually appears within 24–48 hours.' },
            { headers: { 'Cache-Control': 'private, max-age=300' } },
          );
        }
      } catch {
        // Fall through to cache
      }
    }
  }

  // Fallback: read from Convex cache
  try {
    const convexRes = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'analytics:get',
        args: {
          adminKey: process.env.CONVEX_AUTH_SECRET!,
          type: 'gsc',
          period: String(days),
        },
      }),
    });

    if (!convexRes.ok) throw new Error(`Convex query failed: ${convexRes.status}`);
    const result = await convexRes.json();

    if (!result.value) {
      return NextResponse.json(
        {
          error: 'No GSC data yet. Make sure your Google service account has Search Console access and GSC_SITE_URL is set.',
          setup: {
            steps: [
              '1. Go to Google Search Console → Settings → Users and permissions',
              `2. Add ${creds?.client_email ?? 'your service account email'} as a Full user`,
              `3. Set GSC_SITE_URL env var to your verified site URL (e.g. https://erictomchik.com)`,
              '4. Refresh this page',
            ],
          },
        },
        { status: 404 },
      );
    }

    const data = typeof result.value.data === 'string' ? JSON.parse(result.value.data) : result.value.data;
    return NextResponse.json(
      { ...data, _source: 'cache', _cachedAt: result.value.fetched_at },
      { headers: { 'Cache-Control': 'private, max-age=60' } },
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to fetch GSC data' }, { status: 500 });
  }
}

/* ─── Cron endpoint ─────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret');
  const authSecret = process.env.CONVEX_AUTH_SECRET;
  if (!cronSecret || !authSecret || cronSecret !== authSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const creds = getSACredentials();
  if (!creds) {
    return NextResponse.json({ error: 'No SA credentials configured' }, { status: 500 });
  }

  try {
    const token = await getAccessToken(creds);

    // Refresh 7d and 28d caches in parallel
    const [data7, data28] = await Promise.all([
      Promise.all([
        fetchOverview(token, 7),
        fetchTopQueries(token, 7),
        fetchTopPages(token, 7),
        fetchDeviceBreakdown(token, 7),
        fetchCountryBreakdown(token, 7),
      ]).then(([overview, queries, pages, devices, countries]) => ({
        overview, queries, pages, devices, countries,
      })),
      Promise.all([
        fetchOverview(token, 28),
        fetchTopQueries(token, 28),
        fetchTopPages(token, 28),
        fetchDeviceBreakdown(token, 28),
        fetchCountryBreakdown(token, 28),
      ]).then(([overview, queries, pages, devices, countries]) => ({
        overview, queries, pages, devices, countries,
      })),
    ]);

    await Promise.all([
      writeToCache('7', data7),
      writeToCache('28', data28),
    ]);

    return NextResponse.json({ success: true, refreshed: ['7d', '28d'] });
  } catch (err: any) {
    console.error('GSC cron refresh failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
