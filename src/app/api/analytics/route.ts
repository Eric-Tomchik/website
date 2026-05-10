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

/** Base64url encode (no padding) — required for JWT */
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
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: creds.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signingInput = `${header}.${payload}`;
  const key = await importPKCS8(creds.private_key);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput));
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
  const gaUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runRealtimeReport`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Fire multiple realtime queries in parallel for a comprehensive dashboard
  const [pagesRes, sourcesRes, eventsRes, countriesRes, minutesRes] = await Promise.all([
    // Pages breakdown
    fetch(gaUrl, {
      method: 'POST', headers,
      body: JSON.stringify({
        dimensions: [{ name: 'unifiedScreenName' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      }),
    }),
    // Traffic sources
    fetch(gaUrl, {
      method: 'POST', headers,
      body: JSON.stringify({
        dimensions: [{ name: 'firstUserSource' }],
        metrics: [{ name: 'activeUsers' }],
      }),
    }),
    // Events
    fetch(gaUrl, {
      method: 'POST', headers,
      body: JSON.stringify({
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }, { name: 'activeUsers' }],
      }),
    }),
    // Countries
    fetch(gaUrl, {
      method: 'POST', headers,
      body: JSON.stringify({
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
      }),
    }),
    // Per-minute breakdown (minutesAgo dimension, last 30 min)
    fetch(gaUrl, {
      method: 'POST', headers,
      body: JSON.stringify({
        minuteRanges: [{ startMinutesAgo: 29, endMinutesAgo: 0 }],
        dimensions: [{ name: 'minutesAgo' }],
        metrics: [{ name: 'activeUsers' }],
      }),
    }),
  ]);

  if (!pagesRes.ok) throw new Error(`GA4 realtime: ${pagesRes.status} ${await pagesRes.text()}`);

  const [pages, sources, events, countries, minutes] = await Promise.all([
    pagesRes.json(), sourcesRes.json(), eventsRes.json(), countriesRes.json(), minutesRes.json(),
  ]);

  // Parse pages
  let activeUsers = 0;
  let pageviews = 0;
  const topPages: { page: string; activeUsers: number; pageviews: number }[] = [];
  for (const row of pages.rows ?? []) {
    const page = row.dimensionValues?.[0]?.value ?? '(unknown)';
    const users = parseInt(row.metricValues?.[0]?.value ?? '0');
    const views = parseInt(row.metricValues?.[1]?.value ?? '0');
    activeUsers += users;
    pageviews += views;
    topPages.push({ page, activeUsers: users, pageviews: views });
  }
  topPages.sort((a, b) => b.activeUsers - a.activeUsers);

  // Parse sources
  const topSources: { source: string; activeUsers: number }[] = [];
  for (const row of sources.rows ?? []) {
    topSources.push({
      source: row.dimensionValues?.[0]?.value ?? '(unknown)',
      activeUsers: parseInt(row.metricValues?.[0]?.value ?? '0'),
    });
  }
  topSources.sort((a, b) => b.activeUsers - a.activeUsers);

  // Parse events
  const topEvents: { event: string; count: number; activeUsers: number }[] = [];
  for (const row of events.rows ?? []) {
    topEvents.push({
      event: row.dimensionValues?.[0]?.value ?? '(unknown)',
      count: parseInt(row.metricValues?.[0]?.value ?? '0'),
      activeUsers: parseInt(row.metricValues?.[1]?.value ?? '0'),
    });
  }
  topEvents.sort((a, b) => b.count - a.count);

  // Parse countries
  const topCountries: { country: string; activeUsers: number }[] = [];
  for (const row of countries.rows ?? []) {
    topCountries.push({
      country: row.dimensionValues?.[0]?.value ?? '(unknown)',
      activeUsers: parseInt(row.metricValues?.[0]?.value ?? '0'),
    });
  }
  topCountries.sort((a, b) => b.activeUsers - a.activeUsers);

  // Parse per-minute data (build array of 30 entries for the last 30 minutes)
  const minuteMap = new Map<number, number>();
  for (const row of minutes.rows ?? []) {
    const minsAgo = parseInt(row.dimensionValues?.[0]?.value ?? '0');
    const users = parseInt(row.metricValues?.[0]?.value ?? '0');
    minuteMap.set(minsAgo, users);
  }
  const activeUsersPerMinute: number[] = [];
  for (let i = 29; i >= 0; i--) {
    activeUsersPerMinute.push(minuteMap.get(i) ?? 0);
  }

  // Active in last 5 min
  const activeUsers5min = activeUsersPerMinute.slice(-5).reduce((a, b) => a + b, 0);

  return {
    activeUsers,
    activeUsers5min,
    pageviews,
    topPages: topPages.slice(0, 10),
    topSources: topSources.slice(0, 10),
    topEvents: topEvents.slice(0, 10),
    topCountries: topCountries.slice(0, 10),
    activeUsersPerMinute,
  };
}

async function fetchHistoricalFromGA4(token: string, days: number) {
  const [mainRes, pagesRes, sourcesRes, eventsRes, comparisonRes] = await Promise.all([
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
    // Previous period comparison (same length, offset by days)
    fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'newUsers' },
        ],
      }),
    }),
  ]);

  if (!mainRes.ok) throw new Error(`GA4 historical: ${mainRes.status} ${await mainRes.text()}`);

  const [main, pages, sources, events, comparison] = await Promise.all([
    mainRes.json(),
    pagesRes.json(),
    sourcesRes.json(),
    eventsRes.json(),
    comparisonRes.json(),
  ]);

  // Aggregate main metrics
  let totalUsers = 0, totalSessions = 0, totalPageviews = 0, newUsers = 0;
  let bounceSum = 0, durationSum = 0, rowCount = 0;
  const dailyMap = new Map<string, { pageviews: number; users: number; sessions: number; bounceSum: number; sessionCount: number }>();
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

    const existing = dailyMap.get(date) ?? { pageviews: 0, users: 0, sessions: 0, bounceSum: 0, sessionCount: 0 };
    dailyMap.set(date, {
      pageviews: existing.pageviews + views,
      users: existing.users + users,
      sessions: existing.sessions + sessions,
      bounceSum: existing.bounceSum + bounce * sessions,
      sessionCount: existing.sessionCount + sessions,
    });

    deviceMap.set(device, (deviceMap.get(device) ?? 0) + sessions);
    countryMap.set(country, (countryMap.get(country) ?? 0) + users);
  }

  const bounceRate = rowCount > 0 ? bounceSum / rowCount : 0;
  const avgSessionDuration = rowCount > 0 ? durationSum / rowCount : 0;

  const dailySorted = Array.from(dailyMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  const dailyPageviews = dailySorted.map(([date, v]) => ({ date, pageviews: v.pageviews, users: v.users }));

  // Richer daily series for sparklines on stat cards
  const dailySeries = dailySorted.map(([date, v]) => ({
    date,
    users: v.users,
    sessions: v.sessions,
    pageviews: v.pageviews,
    bounceRate: v.sessionCount > 0 ? v.bounceSum / v.sessionCount : 0,
  }));

  // Parse comparison (previous period) metrics
  let prevUsers = 0, prevSessions = 0, prevPageviews = 0, prevNewUsers = 0, prevBounce = 0;
  let prevBounceWeight = 0;
  for (const row of comparison.rows ?? []) {
    prevUsers += parseInt(row.metricValues?.[0]?.value ?? '0');
    prevSessions += parseInt(row.metricValues?.[1]?.value ?? '0');
    prevPageviews += parseInt(row.metricValues?.[2]?.value ?? '0');
    const b = parseFloat(row.metricValues?.[3]?.value ?? '0');
    const s = parseInt(row.metricValues?.[1]?.value ?? '0');
    prevBounce += b * s;
    prevBounceWeight += s;
    prevNewUsers += parseInt(row.metricValues?.[4]?.value ?? '0');
  }
  const prevBounceRate = prevBounceWeight > 0 ? prevBounce / prevBounceWeight : 0;

  const pctChange = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

  const trends = {
    users: pctChange(totalUsers, prevUsers),
    sessions: pctChange(totalSessions, prevSessions),
    pageviews: pctChange(totalPageviews, prevPageviews),
    bounceRate: pctChange(bounceRate * 100, prevBounceRate * 100),
    newUsers: pctChange(newUsers, prevNewUsers),
    prev: { users: prevUsers, sessions: prevSessions, pageviews: prevPageviews, bounceRate: prevBounceRate },
  };

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
    dailyPageviews, dailySeries, trends, topPages, trafficSources, devices, countries, topEvents,
  };
}

/* ─── Helper: write data to Convex cache ────────────────────────────── */

async function writeToCache(type: 'realtime' | 'historical', period: string, data: Record<string, unknown>) {
  const authSecret = process.env.CONVEX_AUTH_SECRET;
  if (!authSecret) return;

  await fetch(`${CONVEX_URL}/api/mutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: 'analytics:update',
      args: { adminKey: authSecret, type, period, data: JSON.stringify(data) },
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
  const type = (searchParams.get('type') ?? 'historical') as 'realtime' | 'historical';
  const days = parseInt(searchParams.get('days') ?? '30');
  const live = searchParams.get('live') === 'true';

  const creds = getSACredentials();

  // Always try live GA4 first if we have SA credentials
  if (creds) {
    try {
      const token = await getAccessToken(creds);
      const data =
        type === 'realtime' ? await fetchRealtimeFromGA4(token) : await fetchHistoricalFromGA4(token, days);

      // Also update the cache in the background
      const period = type === 'realtime' ? 'realtime' : String(days);
      writeToCache(type, period, data).catch(() => {});

      return NextResponse.json(
        { ...data, _cachedAt: Date.now(), _source: 'live' },
        { headers: { 'Cache-Control': 'private, no-cache' } },
      );
    } catch (err: any) {
      console.error('Live GA4 fetch failed, falling back to cache:', err.message);
      // Fall through to Convex cache
    }
  } else {
    console.error('No SA credentials found. GOOGLE_SA_CREDENTIALS env var is missing or invalid.');
  }

  // Default: read from Convex cache
  try {
    const period = type === 'realtime' ? 'realtime' : String(days);
    const convexRes = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'analytics:get', args: { adminKey: process.env.CONVEX_AUTH_SECRET!, type, period } }),
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

/* ─── Cron endpoint: POST /api/analytics ────────────────────────────── */

export async function POST(req: NextRequest) {
  // Verify cron secret to prevent unauthorized cache refreshes
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

    // Refresh realtime + 7-day + 30-day caches in parallel
    const [realtime, hist7, hist30] = await Promise.all([
      fetchRealtimeFromGA4(token),
      fetchHistoricalFromGA4(token, 7),
      fetchHistoricalFromGA4(token, 30),
    ]);

    await Promise.all([
      writeToCache('realtime', 'realtime', realtime),
      writeToCache('historical', '7', hist7),
      writeToCache('historical', '30', hist30),
    ]);

    return NextResponse.json({ success: true, refreshed: ['realtime', '7d', '30d'] });
  } catch (err: any) {
    console.error('Analytics cron refresh failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
