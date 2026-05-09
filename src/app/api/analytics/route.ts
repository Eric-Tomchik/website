import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

/* ─── Google Service-Account helpers ────────────────────────────────── */

interface SACredentials {
  client_email: string;
  private_key: string;
  token_uri: string;
}

let cachedToken: { token: string; expiry: number } | null = null;

async function getAccessToken(creds: SACredentials): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiry - 60_000) {
    return cachedToken.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      iss: creds.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: creds.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signingInput = `${header}.${payload}`;
  const key = await importPKCS8(creds.private_key);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

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
  return crypto.subtle.importKey('pkcs8', binary, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
}

function getSACredentials(): SACredentials | null {
  const json = process.env.GOOGLE_SA_CREDENTIALS;
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    return { client_email: parsed.client_email, private_key: parsed.private_key, token_uri: parsed.token_uri };
  } catch {
    return null;
  }
}

/* ─── GA4 Data API helpers ──────────────────────────────────────────── */

const GA4_PROPERTY = process.env.GA4_PROPERTY_ID ?? '536329957';

async function fetchRealtimeFromGA4(token: string) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runRealtimeReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dimensions: [{ name: 'unifiedScreenName' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      }),
    },
  );
  if (!res.ok) throw new Error(`GA4 realtime: ${res.status} ${await res.text()}`);
  const data = await res.json();

  let activeUsers = 0;
  let pageviews = 0;
  const topPages: { page: string; activeUsers: number }[] = [];

  for (const row of data.rows ?? []) {
    const page = row.dimensionValues?.[0]?.value ?? '(unknown)';
    const users = parseInt(row.metricValues?.[0]?.value ?? '0');
    const views = parseInt(row.metricValues?.[1]?.value ?? '0');
    activeUsers += users;
    pageviews += views;
    topPages.push({ page, activeUsers: users });
  }

  topPages.sort((a, b) => b.activeUsers - a.activeUsers);

  return { activeUsers, pageviews, topPages: topPages.slice(0, 10), topCountries: [] };
}

async function fetchHistoricalFromGA4(token: string, days: number) {
  const [mainRes, pagesRes, sourcesRes, eventsRes] = await Promise.all([
    fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'date' }, { name: 'deviceCategory' }, { name: 'country' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'newUsers' },
        ],
      }),
    }),
    fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
        limit: 20,
      }),
    }),
    fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        limit: 20,
      }),
    }),
    fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        limit: 20,
      }),
    }),
  ]);

  if (!mainRes.ok) throw new Error(`GA4 historical: ${mainRes.status} ${await mainRes.text()}`);

  const [main, pages, sources, events] = await Promise.all([
    mainRes.json(),
    pagesRes.json(),
    sourcesRes.json(),
    eventsRes.json(),
  ]);

  // Aggregate main metrics
  let totalUsers = 0, totalSessions = 0, totalPageviews = 0, newUsers = 0;
  let bounceSum = 0, durationSum = 0, rowCount = 0;
  const dailyMap = new Map<string, { pageviews: number; users: number }>();
  const deviceMap = new Map<string, number>();
  const countryMap = new Map<string, number>();

  for (const row of main.rows ?? []) {
    const date = row.dimensionValues?.[0]?.value ?? '';
    const device = row.dimensionValues?.[1]?.value ?? 'unknown';
    const country = row.dimensionValues?.[2]?.value ?? 'unknown';
    const users = parseInt(row.metricValues?.[0]?.value ?? '0');
    const sessions = parseInt(row.metricValues?.[1]?.value ?? '0');
    const views = parseInt(row.metricValues?.[2]?.value ?? '0');
    const bounce = parseFloat(row.metricValues?.[3]?.value ?? '0');
    const duration = parseFloat(row.metricValues?.[4]?.value ?? '0');
    const nUsers = parseInt(row.metricValues?.[5]?.value ?? '0');

    totalUsers += users;
    totalSessions += sessions;
    totalPageviews += views;
    newUsers += nUsers;
    bounceSum += bounce * sessions;
    durationSum += duration * sessions;
    rowCount += sessions;

    const existing = dailyMap.get(date) ?? { pageviews: 0, users: 0 };
    dailyMap.set(date, { pageviews: existing.pageviews + views, users: existing.users + users });

    deviceMap.set(device, (deviceMap.get(device) ?? 0) + sessions);
    countryMap.set(country, (countryMap.get(country) ?? 0) + users);
  }

  const bounceRate = rowCount > 0 ? bounceSum / rowCount : 0;
  const avgSessionDuration = rowCount > 0 ? durationSum / rowCount : 0;

  const dailyPageviews = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  const topPages = (pages.rows ?? []).map((r: any) => ({
    page: r.dimensionValues?.[0]?.value ?? '',
    pageviews: parseInt(r.metricValues?.[0]?.value ?? '0'),
    users: parseInt(r.metricValues?.[1]?.value ?? '0'),
  }));

  const trafficSources = (sources.rows ?? []).map((r: any) => ({
    source: r.dimensionValues?.[0]?.value ?? '',
    medium: r.dimensionValues?.[1]?.value ?? '',
    sessions: parseInt(r.metricValues?.[0]?.value ?? '0'),
    users: parseInt(r.metricValues?.[1]?.value ?? '0'),
  }));

  const topEvents = (events.rows ?? []).map((r: any) => ({
    event: r.dimensionValues?.[0]?.value ?? '',
    count: parseInt(r.metricValues?.[0]?.value ?? '0'),
  }));

  const devices = Array.from(deviceMap.entries()).map(([device, sessions]) => ({ device, sessions }));
  const countries = Array.from(countryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([country, users]) => ({ country, users }));

  return {
    totalUsers, totalSessions, totalPageviews, bounceRate, avgSessionDuration, newUsers,
    dailyPageviews, topPages, trafficSources, devices, countries, topEvents,
  };
}

/* ─── Route handler ─────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  if (!session || !verifyAdminToken(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'historical';
  const days = parseInt(searchParams.get('days') ?? '30');
  const live = searchParams.get('live') === 'true';

  const creds = getSACredentials();

  // If live=true AND we have SA credentials, call GA4 directly
  if (live && creds) {
    try {
      const token = await getAccessToken(creds);
      const data =
        type === 'realtime' ? await fetchRealtimeFromGA4(token) : await fetchHistoricalFromGA4(token, days);
      return NextResponse.json(
        { ...data, _cachedAt: Date.now(), _source: 'live' },
        { headers: { 'Cache-Control': 'private, no-cache' } },
      );
    } catch (err: any) {
      console.error('Live GA4 fetch failed, falling back to cache:', err.message);
      // Fall through to Convex cache
    }
  }

  // Default: read from Convex cache
  try {
    const period = type === 'realtime' ? 'realtime' : String(days);
    const convexRes = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'analytics:get', args: { type, period } }),
    });

    if (!convexRes.ok) throw new Error(`Convex query failed: ${convexRes.status}`);
    const result = await convexRes.json();

    if (!result.value) {
      return NextResponse.json(
        { error: 'No analytics data yet. Click refresh to pull live data.' },
        { status: 404 },
      );
    }

    const data = typeof result.value.data === 'string' ? JSON.parse(result.value.data) : result.value.data;
    return NextResponse.json(
      { ...data, _cachedAt: result.value.fetched_at, _source: 'cache' },
      { headers: { 'Cache-Control': type === 'realtime' ? 'private, max-age=30' : 'private, max-age=60' } },
    );
  } catch (err: any) {
    console.error('Analytics API error:', err);
    return NextResponse.json({ error: err.message ?? 'Failed to fetch analytics' }, { status: 500 });
  }
}
