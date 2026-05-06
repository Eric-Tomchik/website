/**
 * Google Analytics Data API v1 client
 * Uses Web Crypto API for JWT signing — works on Cloudflare Workers / Edge Runtime.
 *
 * Environment variables required:
 *   GA_SERVICE_ACCOUNT_JSON  – full JSON key (base64-encoded)
 *   GA_PROPERTY_ID           – numeric GA4 property ID
 */

// ── types ────────────────────────────────────────────────────────────────────

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

export interface GARealtimeData {
  activeUsers: number;
  pageviews: number;
  topPages: { page: string; activeUsers: number }[];
  topCountries: { country: string; activeUsers: number }[];
}

export interface GAHistoricalData {
  totalUsers: number;
  totalSessions: number;
  totalPageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  newUsers: number;
  dailyPageviews: { date: string; pageviews: number; users: number }[];
  topPages: { page: string; pageviews: number; users: number }[];
  trafficSources: { source: string; medium: string; sessions: number; users: number }[];
  devices: { device: string; sessions: number }[];
  countries: { country: string; users: number }[];
  topEvents: { event: string; count: number }[];
}

// ── JWT / auth helpers ───────────────────────────────────────────────────────

function base64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemBody = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binaryStr = atob(pemBody);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

  return crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function createSignedJWT(sa: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
  };

  const enc = new TextEncoder();
  const headerB64 = base64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64url(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await importPrivateKey(sa.private_key);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(signingInput));

  return `${signingInput}.${base64url(sig)}`;
}

// Token cache (in-memory per worker instance)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(sa: ServiceAccountKey): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token;

  const jwt = await createSignedJWT(sa);
  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function getServiceAccountKey(): ServiceAccountKey {
  const raw = process.env.GA_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GA_SERVICE_ACCOUNT_JSON env var is not set');
  try {
    // Try base64 first, then raw JSON
    const decoded = atob(raw);
    return JSON.parse(decoded);
  } catch {
    return JSON.parse(raw);
  }
}

function getPropertyId(): string {
  const id = process.env.GA_PROPERTY_ID;
  if (!id) throw new Error('GA_PROPERTY_ID env var is not set');
  return id;
}

async function gaFetch(endpoint: string, body: Record<string, unknown>): Promise<unknown> {
  const sa = getServiceAccountKey();
  const token = await getAccessToken(sa);
  const propertyId = getPropertyId();

  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:${endpoint}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GA API ${endpoint} (${res.status}): ${text}`);
  }

  return res.json();
}

// ── public API ───────────────────────────────────────────────────────────────

export async function getRealtimeData(): Promise<GARealtimeData> {
  const [activeReport, pagesReport, countriesReport] = await Promise.all([
    gaFetch('runRealtimeReport', {
      metrics: [{ name: 'activeUsers' }],
    }) as Promise<any>,
    gaFetch('runRealtimeReport', {
      dimensions: [{ name: 'unifiedPagePathScreen' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 10,
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    }) as Promise<any>,
    gaFetch('runRealtimeReport', {
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 10,
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    }) as Promise<any>,
  ]);

  return {
    activeUsers: parseInt(activeReport.rows?.[0]?.metricValues?.[0]?.value ?? '0', 10),
    pageviews: parseInt(activeReport.rows?.[0]?.metricValues?.[0]?.value ?? '0', 10),
    topPages: (pagesReport.rows ?? []).map((r: any) => ({
      page: r.dimensionValues[0].value,
      activeUsers: parseInt(r.metricValues[0].value, 10),
    })),
    topCountries: (countriesReport.rows ?? []).map((r: any) => ({
      country: r.dimensionValues[0].value,
      activeUsers: parseInt(r.metricValues[0].value, 10),
    })),
  };
}

export async function getHistoricalData(days: number = 30): Promise<GAHistoricalData> {
  const startDate = `${days}daysAgo`;
  const endDate = 'today';

  const [overviewReport, dailyReport, pagesReport, sourcesReport, devicesReport, countriesReport, eventsReport] =
    await Promise.all([
      // Overview metrics
      gaFetch('runReport', {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'newUsers' },
        ],
      }) as Promise<any>,

      // Daily breakdown
      gaFetch('runReport', {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }) as Promise<any>,

      // Top pages
      gaFetch('runReport', {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
        limit: 15,
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      }) as Promise<any>,

      // Traffic sources
      gaFetch('runReport', {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        limit: 10,
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }) as Promise<any>,

      // Devices
      gaFetch('runReport', {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }) as Promise<any>,

      // Countries
      gaFetch('runReport', {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'totalUsers' }],
        limit: 10,
        orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
      }) as Promise<any>,

      // Events
      gaFetch('runReport', {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        limit: 10,
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      }) as Promise<any>,
    ]);

  const ov = overviewReport.rows?.[0]?.metricValues ?? [];

  return {
    totalUsers: parseInt(ov[0]?.value ?? '0', 10),
    totalSessions: parseInt(ov[1]?.value ?? '0', 10),
    totalPageviews: parseInt(ov[2]?.value ?? '0', 10),
    bounceRate: parseFloat(ov[3]?.value ?? '0'),
    avgSessionDuration: parseFloat(ov[4]?.value ?? '0'),
    newUsers: parseInt(ov[5]?.value ?? '0', 10),

    dailyPageviews: (dailyReport.rows ?? []).map((r: any) => ({
      date: r.dimensionValues[0].value,
      pageviews: parseInt(r.metricValues[0].value, 10),
      users: parseInt(r.metricValues[1].value, 10),
    })),

    topPages: (pagesReport.rows ?? []).map((r: any) => ({
      page: r.dimensionValues[0].value,
      pageviews: parseInt(r.metricValues[0].value, 10),
      users: parseInt(r.metricValues[1].value, 10),
    })),

    trafficSources: (sourcesReport.rows ?? []).map((r: any) => ({
      source: r.dimensionValues[0].value,
      medium: r.dimensionValues[1].value,
      sessions: parseInt(r.metricValues[0].value, 10),
      users: parseInt(r.metricValues[1].value, 10),
    })),

    devices: (devicesReport.rows ?? []).map((r: any) => ({
      device: r.dimensionValues[0].value,
      sessions: parseInt(r.metricValues[0].value, 10),
    })),

    countries: (countriesReport.rows ?? []).map((r: any) => ({
      country: r.dimensionValues[0].value,
      users: parseInt(r.metricValues[0].value, 10),
    })),

    topEvents: (eventsReport.rows ?? []).map((r: any) => ({
      event: r.dimensionValues[0].value,
      count: parseInt(r.metricValues[0].value, 10),
    })),
  };
}
