'use client';

import { api } from '../../../../../convex/_generated/api';
import {
  BarChart3,
  Search,
  Globe,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  Tag,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  Activity,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  RefreshCw,
  Zap,
  MousePointerClick,
  Crosshair,
  Loader2,
} from 'lucide-react';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { useAdminQuery } from '@/hooks/useAdminAuth';

// ── Types ────────────────────────────────────────────────────────────────────

interface RealtimeData {
  activeUsers: number;
  activeUsers5min?: number;
  pageviews: number;
  topPages: { page: string; activeUsers: number; pageviews?: number }[];
  topSources?: { source: string; activeUsers: number }[];
  topEvents?: { event: string; count: number; activeUsers?: number }[];
  topCountries: { country: string; activeUsers: number }[];
  activeUsersPerMinute?: number[];
  _source?: string;
}

interface DailySeries {
  date: string;
  users: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
}

interface Trends {
  users: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
  newUsers: number;
  prev: { users: number; sessions: number; pageviews: number; bounceRate: number };
}

interface HistoricalData {
  totalUsers: number;
  totalSessions: number;
  totalPageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  newUsers: number;
  dailyPageviews: { date: string; pageviews: number; users: number }[];
  dailySeries?: DailySeries[];
  trends?: Trends;
  topPages: { page: string; pageviews: number; users: number }[];
  trafficSources: { source: string; medium: string; sessions: number; users: number }[];
  devices: { device: string; sessions: number }[];
  countries: { country: string; users: number }[];
  topEvents: { event: string; count: number }[];
}

// ── Hooks ────────────────────────────────────────────────────────────────────

function useAnalytics<T>(type: 'realtime' | 'historical', days?: number, refreshInterval?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type, live: 'true' });
      if (days) params.set('days', String(days));
      const res = await fetch(`/api/analytics?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
      setLastUpdated(json._cachedAt ? new Date(json._cachedAt) : new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type, days]);

  useEffect(() => {
    fetchData();
    if (refreshInterval) {
      const id = setInterval(fetchData, refreshInterval);
      return () => clearInterval(id);
    }
  }, [fetchData, refreshInterval]);

  return { data, error, loading, lastUpdated, refresh: fetchData };
}

// ── Utility ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function formatDate(dateStr: string): string {
  // Supports both YYYYMMDD and YYYY-MM-DD formats
  if (dateStr.includes('-')) {
    const [, m, d] = dateStr.split('-');
    return `${m}/${d}`;
  }
  const m = dateStr.slice(4, 6);
  const d = dateStr.slice(6, 8);
  return `${m}/${d}`;
}

const deviceIcons: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

// ── Sparkline bars ───────────────────────────────────────────────────────────

function SparkBars({ values, color = 'bg-brand-400' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[2px] h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className={`${color} rounded-t-sm opacity-80 hover:opacity-100 transition-opacity`}
          style={{ width: `${100 / values.length}%`, height: `${(v / max) * 100}%`, minHeight: v > 0 ? '2px' : '0' }}
          title={`${v}`}
        />
      ))}
    </div>
  );
}

/** SVG sparkline for stat cards */
function Sparkline({ values, color = '#6366f1', height = 28 }: { values: number[]; color?: string; height?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 100;
  const pad = 2;
  const step = (w - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => `${pad + i * step},${pad + (1 - (v - min) / range) * (height - pad * 2)}`).join(' ');
  const fillPoints = `${pad},${height - pad} ${points} ${pad + (values.length - 1) * step},${height - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <polygon points={fillPoints} fill={color} opacity={0.1} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pad + (values.length - 1) * step} cy={pad + (1 - (values[values.length - 1] - min) / range) * (height - pad * 2)} r={2} fill={color} />
    </svg>
  );
}

/** Trend badge: shows % change with up/down arrow */
function TrendBadge({ pct, invertColor = false }: { pct: number; invertColor?: boolean }) {
  if (pct === 0) return <span className="text-[10px] text-surface-500 font-medium">—</span>;
  const isUp = pct > 0;
  // For bounce rate, up is bad (invertColor=true)
  const isGood = invertColor ? !isUp : isUp;
  const color = isGood ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>
      {isUp ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
      {Math.abs(pct)}%
    </span>
  );
}

// ── GSC Types & Hook ─────────────────────────────────────────────────────────

interface GSCOverview {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  trends: { clicks: number; impressions: number; ctr: number; position: number };
  prev: { clicks: number; impressions: number; ctr: number; position: number };
  dailySeries: { date: string; clicks: number; impressions: number; ctr: number; position: number }[];
}

interface GSCQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCDevice {
  device: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCCountry {
  country: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCData {
  overview: GSCOverview;
  queries: GSCQuery[];
  pages: GSCPage[];
  devices: GSCDevice[];
  countries: GSCCountry[];
  _source?: string;
  _cachedAt?: number;
  _notice?: string;
}

function useGSC(days: number) {
  const [data, setData] = useState<GSCData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/gsc?days=${days}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refresh: fetchData };
}

// ── GSC Setup Wizard ─────────────────────────────────────────────────────────

function GSCSetupWizard({ error, onComplete }: { error: string; onComplete: () => void }) {
  const [step, setStep] = useState<'idle' | 'checking' | 'registering' | 'getting_token' | 'verifying' | 'done'>('idle');
  const [status, setStatus] = useState<string>('');
  const [dnsRecord, setDnsRecord] = useState<{ name: string; value: string } | null>(null);
  const [details, setDetails] = useState<string>('');

  const callSetup = async (action: string, extra?: Record<string, unknown>) => {
    const res = await fetch('/api/gsc/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    });
    return res.json();
  };

  const runSetup = async () => {
    try {
      // Step 1: Check status
      setStep('checking');
      setStatus('Checking current GSC connection...');
      const statusRes = await callSetup('status');

      if (statusRes.status === 'connected') {
        setStep('done');
        setStatus('GSC is already connected!');
        onComplete();
        return;
      }

      // Step 2: Try auto-registration
      setStep('registering');
      setStatus('Attempting auto-registration...');
      const regRes = await callSetup('register');

      if (regRes.status === 'success') {
        setStep('done');
        setStatus('GSC connected successfully!');
        onComplete();
        return;
      }

      // Step 3: Get DNS verification token
      setStep('getting_token');
      setStatus('Getting DNS verification token...');
      const tokenRes = await callSetup('getToken');

      if (tokenRes.status === 'api_not_enabled') {
        setStep('idle');
        setStatus('');
        setDetails(
          'The Google Site Verification API needs to be enabled in your Google Cloud project.\n\n' +
          '1. Go to Google Cloud Console → APIs & Services → Library\n' +
          '2. Search for "Google Site Verification API"\n' +
          '3. Click Enable\n' +
          '4. Then click "Setup GSC" again'
        );
        return;
      }

      if (tokenRes.status === 'token_ready') {
        setDnsRecord({ name: tokenRes.dnsRecord.name, value: tokenRes.dnsRecord.value });
        setStatus(
          `Add this DNS TXT record to your domain in Cloudflare, then click "Verify":`
        );
        setStep('getting_token');
        return;
      }

      setStep('idle');
      setDetails(JSON.stringify(tokenRes, null, 2));
    } catch (err: any) {
      setStep('idle');
      setStatus(`Error: ${err.message}`);
    }
  };

  const runVerify = async () => {
    try {
      setStep('verifying');
      setStatus('Verifying DNS record...');
      const verifyRes = await callSetup('verify');

      if (verifyRes.status === 'verified') {
        setStep('done');
        setStatus('Domain verified! GSC is now connected. Refreshing...');
        setTimeout(onComplete, 1500);
        return;
      }

      if (verifyRes.status === 'verification_pending') {
        setStep('getting_token');
        setStatus('DNS record not found yet. Make sure it\'s added in Cloudflare and wait a minute, then try again.');
        return;
      }

      setStep('getting_token');
      setStatus(`Verification issue: ${verifyRes.message}`);
    } catch (err: any) {
      setStep('getting_token');
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="card p-4 border-yellow-500/20">
      <div className="flex items-start gap-2 text-yellow-400 text-xs">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium mb-2">{error}</p>

          {step === 'idle' && !dnsRecord && !details && (
            <button
              onClick={runSetup}
              className="mt-1 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-[11px] font-medium hover:bg-brand-600 transition-colors"
            >
              🔧 Setup GSC Connection
            </button>
          )}

          {step === 'idle' && details && (
            <div className="mt-2 text-surface-400 whitespace-pre-line text-[11px]">
              {details}
              <button
                onClick={() => { setDetails(''); runSetup(); }}
                className="mt-2 block px-3 py-1.5 rounded-lg bg-brand-500 text-white text-[11px] font-medium hover:bg-brand-600 transition-colors"
              >
                🔄 Retry Setup
              </button>
            </div>
          )}

          {(step === 'checking' || step === 'registering' || step === 'verifying') && (
            <div className="mt-2 flex items-center gap-2 text-surface-400 text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{status}</span>
            </div>
          )}

          {step === 'getting_token' && dnsRecord && (
            <div className="mt-2 space-y-2">
              <p className="text-surface-300 text-[11px]">{status}</p>
              <div className="bg-surface-900 rounded-lg p-3 text-[11px] font-mono space-y-1">
                <p><span className="text-surface-500">Type:</span> <span className="text-white">TXT</span></p>
                <p><span className="text-surface-500">Name:</span> <span className="text-white">{dnsRecord.name}</span></p>
                <p><span className="text-surface-500">Value:</span> <span className="text-brand-400 break-all">{dnsRecord.value}</span></p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={runVerify}
                  className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-[11px] font-medium hover:bg-green-700 transition-colors"
                >
                  ✓ Verify DNS Record
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(dnsRecord.value); }}
                  className="px-3 py-1.5 rounded-lg bg-surface-700 text-surface-300 text-[11px] font-medium hover:bg-surface-600 transition-colors"
                >
                  📋 Copy Value
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="mt-2 text-green-400 text-[11px] flex items-center gap-1">
              <span>✓</span> {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SEO helpers ──────────────────────────────────────────────────────────────

function getBookSeoChecks(book: {
  title: string;
  description: string;
  long_description?: string;
  cover_image_url?: string;
  isbn?: string;
  page_count?: number;
  published_date?: string;
  amazon_url?: string;
}) {
  return [
    { label: 'Title', pass: book.title.length > 0 && book.title.length <= 70, detail: `${book.title.length}ch` },
    { label: 'Short Desc', pass: book.description.length >= 50 && book.description.length <= 160, detail: `${book.description.length}ch` },
    { label: 'Long Desc', pass: !!book.long_description && book.long_description.length > 100, detail: book.long_description ? `${book.long_description.length}ch` : 'Missing' },
    { label: 'Cover', pass: !!book.cover_image_url, detail: book.cover_image_url ? '✓' : 'Missing' },
    { label: 'ISBN', pass: !!book.isbn, detail: book.isbn || 'Missing' },
    { label: 'Pages', pass: !!book.page_count, detail: book.page_count ? `${book.page_count}` : 'Missing' },
    { label: 'Published', pass: !!book.published_date, detail: book.published_date || 'Missing' },
    { label: 'Amazon', pass: !!book.amazon_url, detail: book.amazon_url ? '✓' : 'Missing' },
  ];
}

function SeoScore({ checks }: { checks: { pass: boolean }[] }) {
  const score = Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);
  const color = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-9 h-9">
        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
          <path className="text-surface-800" stroke="currentColor" strokeWidth="3.5" fill="none"
            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className={color} stroke="currentColor" strokeWidth="3.5" fill="none"
            strokeDasharray={`${score}, 100`} strokeLinecap="round"
            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${color}`}>
          {score}
        </span>
      </div>
      <span className="text-[10px] text-surface-500">{checks.filter((c) => c.pass).length}/{checks.length}</span>
    </div>
  );
}

// ── Real-time Pulse ──────────────────────────────────────────────────────────

function MinuteChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[2px] h-14">
      {values.map((v, i) => (
        <div
          key={i}
          className="bg-blue-400 rounded-t-sm hover:bg-blue-300 transition-colors relative group"
          style={{
            width: `${100 / values.length}%`,
            height: `${Math.max((v / max) * 100, v > 0 ? 4 : 0)}%`,
            minHeight: v > 0 ? '3px' : '0',
          }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-700 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {v} user{v !== 1 ? 's' : ''}
          </div>
        </div>
      ))}
    </div>
  );
}

function RealtimeSection() {
  const { data, error, loading, lastUpdated, refresh } = useAnalytics<RealtimeData>(
    'realtime', undefined, 30_000,
  );

  if (error) {
    return (
      <div className="card p-3 border-red-500/20">
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Real-time data unavailable: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main realtime header card */}
      <div className="card p-4 border-green-500/20 relative overflow-hidden">
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-[10px] text-green-400 font-medium">
            {data?._source === 'live' ? 'LIVE' : 'CACHED'}
          </span>
          <button onClick={refresh} className="text-surface-500 hover:text-white transition-colors ml-1" title="Refresh">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <h2 className="text-sm font-semibold text-white mb-3">Realtime Overview</h2>

        {loading && !data ? (
          <div className="flex items-center gap-2 text-surface-500 text-xs py-4 justify-center">
            <RefreshCw className="w-3 h-3 animate-spin" /> Loading...
          </div>
        ) : data ? (
          <>
            {/* Active users stats */}
            <div className="flex items-start gap-8 mb-4">
              <div>
                <div className="text-[10px] text-surface-400 uppercase tracking-wider mb-0.5">
                  Active Users in Last 30 Min
                </div>
                <div className="text-4xl font-bold text-green-400">{data.activeUsers}</div>
              </div>
              {data.activeUsers5min !== undefined && (
                <div>
                  <div className="text-[10px] text-surface-400 uppercase tracking-wider mb-0.5">
                    Active Users in Last 5 Min
                  </div>
                  <div className="text-4xl font-bold text-blue-400">{data.activeUsers5min}</div>
                </div>
              )}
            </div>

            {/* Per-minute chart */}
            {data.activeUsersPerMinute && data.activeUsersPerMinute.length > 0 && (
              <div className="mb-2">
                <div className="text-[10px] text-surface-400 uppercase tracking-wider mb-2">
                  Active Users Per Minute
                </div>
                <MinuteChart values={data.activeUsersPerMinute} />
                <div className="flex justify-between mt-1 text-[9px] text-surface-500">
                  <span>-30 min</span>
                  <span>-15 min</span>
                  <span>Now</span>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Detailed breakdowns grid */}
      {data && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Active by Source */}
          <div className="card p-3">
            <h3 className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">
              Active Users by Source
            </h3>
            {(data.topSources ?? []).length === 0 ? (
              <p className="text-[10px] text-surface-500">No data</p>
            ) : (
              <div className="space-y-1">
                {(data.topSources ?? []).slice(0, 6).map((s, i) => {
                  const maxVal = Math.max(...(data.topSources ?? []).map((x) => x.activeUsers), 1);
                  return (
                    <div key={s.source}>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="text-surface-300 truncate mr-2">
                          #{i + 1} {s.source === '(direct)' ? '(direct)' : s.source}
                        </span>
                        <span className="text-green-400 font-mono font-medium">{s.activeUsers}</span>
                      </div>
                      <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${(s.activeUsers / maxVal) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Views by Page */}
          <div className="card p-3">
            <h3 className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">
              Views by Page Title
            </h3>
            {data.topPages.length === 0 ? (
              <p className="text-[10px] text-surface-500">No data</p>
            ) : (
              <div className="space-y-1">
                {data.topPages.slice(0, 6).map((p, i) => {
                  const maxVal = Math.max(...data.topPages.map((x) => x.pageviews ?? x.activeUsers), 1);
                  return (
                    <div key={p.page}>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="text-surface-300 truncate mr-2 max-w-[70%]">
                          #{i + 1} {p.page}
                        </span>
                        <span className="text-blue-400 font-mono font-medium">{p.pageviews ?? p.activeUsers}</span>
                      </div>
                      <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${((p.pageviews ?? p.activeUsers) / maxVal) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Event Count */}
          <div className="card p-3">
            <h3 className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">
              Event Count by Event Name
            </h3>
            {(data.topEvents ?? []).length === 0 ? (
              <p className="text-[10px] text-surface-500">No data</p>
            ) : (
              <div className="space-y-1">
                {(data.topEvents ?? []).slice(0, 6).map((e, i) => {
                  const maxVal = Math.max(...(data.topEvents ?? []).map((x) => x.count), 1);
                  return (
                    <div key={e.event}>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="text-surface-300 truncate mr-2">
                          #{i + 1} {e.event}
                        </span>
                        <span className="text-yellow-400 font-mono font-medium">{e.count}</span>
                      </div>
                      <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(e.count / maxVal) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Countries */}
          <div className="card p-3">
            <h3 className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">
              Active Users by Country
            </h3>
            {data.topCountries.length === 0 ? (
              <p className="text-[10px] text-surface-500">No data</p>
            ) : (
              <div className="space-y-1">
                {data.topCountries.slice(0, 6).map((c, i) => {
                  const maxVal = Math.max(...data.topCountries.map((x) => x.activeUsers), 1);
                  return (
                    <div key={c.country}>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="text-surface-300">
                          #{i + 1} {c.country}
                        </span>
                        <span className="text-purple-400 font-mono font-medium">{c.activeUsers}</span>
                      </div>
                      <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(c.activeUsers / maxVal) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const books = useQuery(api.books.list, {}) ?? [];
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [activeTab, setActiveTab] = useState<'analytics' | 'seo'>('analytics');
  const [gscPeriod, setGscPeriod] = useState<7 | 28 | 90>(28);
  const [gscSubTab, setGscSubTab] = useState<'overview' | 'queries' | 'pages' | 'audit'>('overview');

  const { data: historical, error: histError, loading: histLoading, refresh: histRefresh } =
    useAnalytics<HistoricalData>('historical', period, 300_000);

  const { data: gsc, error: gscError, loading: gscLoading, refresh: gscRefresh } = useGSC(gscPeriod);

  const overallChecks = useMemo(() => books.flatMap((b) => getBookSeoChecks(b)), [books]);
  const overallScore = overallChecks.length > 0
    ? Math.round((overallChecks.filter((c) => c.pass).length / overallChecks.length) * 100)
    : 0;

  const sitePages = useMemo(() => [
    { path: '/', title: 'Home', hasSchema: true, note: 'Website + Org' },
    { path: '/books', title: 'Books', hasSchema: true, note: 'ItemList' },
    { path: '/services', title: 'Services', hasSchema: true, note: 'Service' },
    { path: '/portfolio', title: 'Portfolio', hasSchema: true, note: 'CollectionPage' },
    { path: '/about', title: 'About', hasSchema: true, note: 'Person' },
    { path: '/contact', title: 'Contact', hasSchema: true, note: 'ContactPage' },
    { path: '/links', title: 'Links', hasSchema: true, note: 'Person (redirect)' },
  ], []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO & Analytics</h1>
          <p className="text-surface-400 text-sm">Performance, traffic & search optimization.</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'analytics' ? 'bg-brand-500 text-white' : 'bg-surface-800 text-surface-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'seo' ? 'bg-brand-500 text-white' : 'bg-surface-800 text-surface-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            SEO
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <>
          <RealtimeSection />

          {/* Period selector */}
          <div className="flex items-center gap-1.5">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                onClick={() => setPeriod(d)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  period === d
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'bg-surface-800 text-surface-400 hover:text-white border border-transparent'
                }`}
              >
                {d}d
              </button>
            ))}
            <button
              onClick={histRefresh}
              className="ml-auto text-surface-500 hover:text-white transition-colors text-[11px] flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${histLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {histError ? (
            <div className="card p-4 border-red-500/20">
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Failed to load analytics: {histError}</span>
              </div>
            </div>
          ) : histLoading && !historical ? (
            <div className="card p-8 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin text-surface-500 mr-2" />
              <span className="text-surface-500 text-sm">Loading...</span>
            </div>
          ) : historical ? (
            <>
              {/* Overview stats — single row with sparklines */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-surface-400">Users</span>
                    <Users className="w-3.5 h-3.5 text-brand-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold text-white">{formatNumber(historical.totalUsers)}</div>
                    {historical.trends && <TrendBadge pct={historical.trends.users} />}
                  </div>
                  <div className="text-[10px] text-surface-500">{formatNumber(historical.newUsers)} new</div>
                  {historical.dailySeries && historical.dailySeries.length > 1 && (
                    <div className="mt-2">
                      <Sparkline values={historical.dailySeries.map(d => d.users)} color="#6366f1" />
                    </div>
                  )}
                </div>
                <div className="card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-surface-400">Sessions</span>
                    <Activity className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold text-white">{formatNumber(historical.totalSessions)}</div>
                    {historical.trends && <TrendBadge pct={historical.trends.sessions} />}
                  </div>
                  {historical.dailySeries && historical.dailySeries.length > 1 && (
                    <div className="mt-2">
                      <Sparkline values={historical.dailySeries.map(d => d.sessions)} color="#22c55e" />
                    </div>
                  )}
                </div>
                <div className="card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-surface-400">Pageviews</span>
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold text-white">{formatNumber(historical.totalPageviews)}</div>
                    {historical.trends && <TrendBadge pct={historical.trends.pageviews} />}
                  </div>
                  {historical.dailySeries && historical.dailySeries.length > 1 && (
                    <div className="mt-2">
                      <Sparkline values={historical.dailySeries.map(d => d.pageviews)} color="#3b82f6" />
                    </div>
                  )}
                </div>
                <div className="card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-surface-400">Bounce</span>
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold text-white">{historical.bounceRate < 1 ? (historical.bounceRate * 100).toFixed(1) : historical.bounceRate.toFixed(1)}%</div>
                    {historical.trends && <TrendBadge pct={historical.trends.bounceRate} invertColor />}
                  </div>
                  <div className="text-[10px] text-surface-500">Avg: {formatDuration(historical.avgSessionDuration)}</div>
                  {historical.dailySeries && historical.dailySeries.length > 1 && (
                    <div className="mt-2">
                      <Sparkline values={historical.dailySeries.map(d => d.bounceRate < 1 ? d.bounceRate * 100 : d.bounceRate)} color="#eab308" />
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly summary trend card */}
              {historical.trends && (
                <div className="card p-4 border-brand-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-brand-400" />
                    <h2 className="text-sm font-semibold text-white">
                      Period Comparison
                    </h2>
                    <span className="text-[10px] text-surface-500 ml-auto">
                      vs previous {period} days
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Users', curr: historical.totalUsers, prev: historical.trends.prev.users, pct: historical.trends.users },
                      { label: 'Sessions', curr: historical.totalSessions, prev: historical.trends.prev.sessions, pct: historical.trends.sessions },
                      { label: 'Pageviews', curr: historical.totalPageviews, prev: historical.trends.prev.pageviews, pct: historical.trends.pageviews },
                      { label: 'Bounce', curr: historical.bounceRate < 1 ? +(historical.bounceRate * 100).toFixed(1) : +historical.bounceRate.toFixed(1), prev: historical.trends.prev.bounceRate < 1 ? +(historical.trends.prev.bounceRate * 100).toFixed(1) : +historical.trends.prev.bounceRate.toFixed(1), pct: historical.trends.bounceRate, invert: true },
                    ].map(({ label, curr, prev, pct, invert }) => (
                      <div key={label} className="p-2.5 rounded-lg bg-surface-900/50 border border-surface-800">
                        <div className="text-[10px] text-surface-400 mb-1">{label}</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-white">
                            {label === 'Bounce' ? `${curr}%` : formatNumber(curr)}
                          </span>
                          <TrendBadge pct={pct} invertColor={invert} />
                        </div>
                        <div className="text-[9px] text-surface-500 mt-0.5">
                          was {label === 'Bounce' ? `${prev}%` : formatNumber(prev)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily chart — compact */}
              <div className="card p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-sm font-semibold text-white">Daily Pageviews</h2>
                  <span className="text-[10px] text-surface-500">Last {period}d</span>
                </div>
                {historical.dailyPageviews.length > 0 ? (
                  <div>
                    <SparkBars values={historical.dailyPageviews.map((d) => d.pageviews)} color="bg-brand-400" />
                    <div className="flex justify-between mt-1 text-[9px] text-surface-500">
                      <span>{formatDate(historical.dailyPageviews[0]?.date)}</span>
                      <span>{formatDate(historical.dailyPageviews[historical.dailyPageviews.length - 1]?.date)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-surface-500">No data</p>
                )}
              </div>

              {/* Top Pages + Traffic Sources */}
              <div className="grid lg:grid-cols-2 gap-3">
                <div className="card p-4">
                  <h2 className="text-sm font-semibold text-white mb-2">Top Pages</h2>
                  <div className="space-y-1.5">
                    {historical.topPages.map((p) => {
                      const maxPV = Math.max(...historical.topPages.map((x) => x.pageviews), 1);
                      return (
                        <div key={p.page}>
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="text-surface-300 truncate mr-2 max-w-[65%]">{p.page}</span>
                            <span className="text-surface-500 shrink-0">{formatNumber(p.pageviews)} · {formatNumber(p.users)}u</span>
                          </div>
                          <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-400 rounded-full" style={{ width: `${(p.pageviews / maxPV) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card p-4">
                  <h2 className="text-sm font-semibold text-white mb-2">Traffic Sources</h2>
                  <div className="space-y-1.5">
                    {historical.trafficSources.map((s) => {
                      const maxSess = Math.max(...historical.trafficSources.map((x) => x.sessions), 1);
                      const label = (s.source === '(direct)' ? 'Direct' : s.source) + (s.medium === '(none)' ? '' : ` / ${s.medium}`);
                      return (
                        <div key={`${s.source}-${s.medium}`}>
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="text-surface-300 truncate mr-2">{label}</span>
                            <span className="text-surface-500 shrink-0">{formatNumber(s.sessions)}s · {formatNumber(s.users)}u</span>
                          </div>
                          <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-400 rounded-full" style={{ width: `${(s.sessions / maxSess) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Devices + Countries + Events — compact row */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="card p-3">
                  <h2 className="text-xs font-semibold text-white mb-2">Devices</h2>
                  <div className="space-y-2">
                    {historical.devices.map((d) => {
                      const Icon = deviceIcons[d.device.toLowerCase()] || Monitor;
                      const total = historical.devices.reduce((a, x) => a + x.sessions, 0) || 1;
                      const pct = ((d.sessions / total) * 100).toFixed(1);
                      return (
                        <div key={d.device} className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-surface-500" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-[11px] mb-0.5">
                              <span className="text-surface-300 capitalize">{d.device}</span>
                              <span className="text-surface-500">{pct}%</span>
                            </div>
                            <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card p-3">
                  <h2 className="text-xs font-semibold text-white mb-2">Countries</h2>
                  <div className="space-y-0.5">
                    {historical.countries.slice(0, 8).map((c) => (
                      <div key={c.country} className="flex items-center justify-between text-[11px]">
                        <span className="text-surface-300">{c.country}</span>
                        <span className="text-surface-500 font-mono">{formatNumber(c.users)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-3">
                  <h2 className="text-xs font-semibold text-white mb-2">Events</h2>
                  <div className="space-y-0.5">
                    {historical.topEvents.slice(0, 8).map((e) => (
                      <div key={e.event} className="flex items-center justify-between text-[11px]">
                        <span className="text-surface-300 truncate mr-2">{e.event}</span>
                        <span className="text-surface-500 font-mono">{formatNumber(e.count)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : (
        /* ── SEO Tab ──────────────────────────────────────────────────── */
        <>
          {/* GSC period selector + sub-tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1">
              {(['overview', 'queries', 'pages', 'audit'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setGscSubTab(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors capitalize ${
                    gscSubTab === t
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      : 'bg-surface-800 text-surface-400 hover:text-white border border-transparent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {([7, 28, 90] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setGscPeriod(d)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    gscPeriod === d
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      : 'bg-surface-800 text-surface-400 hover:text-white border border-transparent'
                  }`}
                >
                  {d}d
                </button>
              ))}
              <button
                onClick={gscRefresh}
                className="ml-1 text-surface-500 hover:text-white transition-colors text-[11px] flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${gscLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {gscError ? (
            <GSCSetupWizard error={gscError} onComplete={gscRefresh} />
          ) : gsc?._notice ? (
            <div className="card p-4 border-brand-500/20">
              <div className="flex items-start gap-2 text-brand-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">✓ GSC Connected</p>
                  <p className="text-surface-400 mt-1">{gsc._notice}</p>
                </div>
              </div>
            </div>
          ) : gscLoading && !gsc ? (
            <div className="card p-8 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
            </div>
          ) : null}

          {/* Overview sub-tab */}
          {gscSubTab === 'overview' && gsc && (
            <>
              {/* Stat cards with sparklines */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Clicks', value: gsc.overview.clicks.toLocaleString(), trend: gsc.overview.trends.clicks, color: '#6366f1', series: gsc.overview.dailySeries.map((d) => d.clicks) },
                  { label: 'Impressions', value: gsc.overview.impressions.toLocaleString(), trend: gsc.overview.trends.impressions, color: '#06b6d4', series: gsc.overview.dailySeries.map((d) => d.impressions) },
                  { label: 'Avg CTR', value: `${gsc.overview.ctr}%`, trend: gsc.overview.trends.ctr, color: '#10b981', series: gsc.overview.dailySeries.map((d) => d.ctr) },
                  { label: 'Avg Position', value: gsc.overview.position.toFixed(1), trend: gsc.overview.trends.position, color: '#f59e0b', series: gsc.overview.dailySeries.map((d) => d.position), invert: true },
                ].map((stat) => (
                  <div key={stat.label} className="card p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-surface-400">{stat.label}</span>
                      <TrendBadge pct={stat.trend} invertColor={stat.invert} />
                    </div>
                    <div className="text-xl font-bold text-white mb-2">{stat.value}</div>
                    <Sparkline values={stat.series} color={stat.color} height={24} />
                  </div>
                ))}
              </div>

              {/* Click & Impression daily chart */}
              <div className="card p-4">
                <h2 className="text-sm font-semibold text-white mb-3">Daily Performance</h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[11px] text-surface-400">Clicks</span>
                    </div>
                    <Sparkline values={gsc.overview.dailySeries.map((d) => d.clicks)} color="#6366f1" height={40} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      <span className="text-[11px] text-surface-400">Impressions</span>
                    </div>
                    <Sparkline values={gsc.overview.dailySeries.map((d) => d.impressions)} color="#06b6d4" height={40} />
                  </div>
                </div>
              </div>

              {/* Device + Country breakdown */}
              <div className="grid lg:grid-cols-2 gap-3">
                <div className="card p-4">
                  <h2 className="text-sm font-semibold text-white mb-2">Devices</h2>
                  <div className="space-y-1.5">
                    {gsc.devices.map((d) => {
                      const DevIcon = d.device === 'MOBILE' ? Smartphone : d.device === 'TABLET' ? Tablet : Monitor;
                      const total = gsc.devices.reduce((s, x) => s + x.clicks, 0) || 1;
                      return (
                        <div key={d.device} className="flex items-center gap-2">
                          <DevIcon className="w-3.5 h-3.5 text-surface-500 shrink-0" />
                          <span className="text-[11px] text-white font-medium w-16">{d.device.charAt(0) + d.device.slice(1).toLowerCase()}</span>
                          <div className="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(d.clicks / total) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-surface-400 w-10 text-right">{d.clicks}</span>
                          <span className="text-[10px] text-surface-500 w-10 text-right">{d.ctr}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card p-4">
                  <h2 className="text-sm font-semibold text-white mb-2">Countries</h2>
                  <div className="space-y-1">
                    {gsc.countries.slice(0, 8).map((c) => (
                      <div key={c.country} className="flex items-center justify-between px-2 py-1 rounded bg-surface-900/50">
                        <span className="text-[11px] text-white font-medium">{c.country}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-surface-400">{c.clicks} clicks</span>
                          <span className="text-[10px] text-surface-500">{c.impressions.toLocaleString()} imp</span>
                          <span className="text-[10px] text-brand-400">{c.ctr}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Period comparison */}
              <div className="card p-4">
                <h2 className="text-sm font-semibold text-white mb-3">Period Comparison</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Clicks', current: gsc.overview.clicks, prev: gsc.overview.prev.clicks },
                    { label: 'Impressions', current: gsc.overview.impressions, prev: gsc.overview.prev.impressions },
                    { label: 'CTR', current: `${gsc.overview.ctr}%`, prev: `${gsc.overview.prev.ctr}%` },
                    { label: 'Position', current: gsc.overview.position.toFixed(1), prev: gsc.overview.prev.position.toFixed(1) },
                  ].map((item) => (
                    <div key={item.label} className="p-2 rounded-lg bg-surface-900/50 border border-surface-800">
                      <div className="text-[10px] text-surface-500 mb-1">{item.label}</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white">{typeof item.current === 'number' ? item.current.toLocaleString() : item.current}</span>
                        <span className="text-[10px] text-surface-500">vs {typeof item.prev === 'number' ? item.prev.toLocaleString() : item.prev}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Queries sub-tab */}
          {gscSubTab === 'queries' && gsc && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Top Search Queries</h2>
                <span className="text-[10px] text-surface-500">{gsc.queries.length} queries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-surface-800">
                      <th className="text-[10px] font-medium text-surface-500 pb-2 pr-4">Query</th>
                      <th className="text-[10px] font-medium text-surface-500 pb-2 pr-3 text-right">Clicks</th>
                      <th className="text-[10px] font-medium text-surface-500 pb-2 pr-3 text-right">Impressions</th>
                      <th className="text-[10px] font-medium text-surface-500 pb-2 pr-3 text-right">CTR</th>
                      <th className="text-[10px] font-medium text-surface-500 pb-2 text-right">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gsc.queries.map((q, i) => (
                      <tr key={q.query} className={`border-b border-surface-800/50 ${i % 2 === 0 ? '' : 'bg-surface-900/30'}`}>
                        <td className="py-1.5 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-surface-600 w-4">{i + 1}</span>
                            <Search className="w-3 h-3 text-surface-600 shrink-0" />
                            <span className="text-[11px] text-white font-medium">{q.query}</span>
                          </div>
                        </td>
                        <td className="py-1.5 pr-3 text-right">
                          <span className="text-[11px] text-brand-400 font-semibold">{q.clicks}</span>
                        </td>
                        <td className="py-1.5 pr-3 text-right">
                          <span className="text-[11px] text-surface-300">{q.impressions.toLocaleString()}</span>
                        </td>
                        <td className="py-1.5 pr-3 text-right">
                          <span className={`text-[11px] font-medium ${q.ctr >= 5 ? 'text-green-400' : q.ctr >= 2 ? 'text-yellow-400' : 'text-surface-400'}`}>
                            {q.ctr}%
                          </span>
                        </td>
                        <td className="py-1.5 text-right">
                          <span className={`text-[11px] font-medium ${q.position <= 10 ? 'text-green-400' : q.position <= 20 ? 'text-yellow-400' : 'text-surface-400'}`}>
                            {q.position}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {gsc.queries.length === 0 && (
                <p className="text-xs text-surface-500 text-center py-4">No query data yet for this period.</p>
              )}
            </div>
          )}

          {/* Pages sub-tab */}
          {gscSubTab === 'pages' && gsc && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Top Pages in Search</h2>
                <span className="text-[10px] text-surface-500">{gsc.pages.length} pages</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-surface-800">
                      <th className="text-[10px] font-medium text-surface-500 pb-2 pr-4">Page</th>
                      <th className="text-[10px] font-medium text-surface-500 pb-2 pr-3 text-right">Clicks</th>
                      <th className="text-[10px] font-medium text-surface-500 pb-2 pr-3 text-right">Impressions</th>
                      <th className="text-[10px] font-medium text-surface-500 pb-2 pr-3 text-right">CTR</th>
                      <th className="text-[10px] font-medium text-surface-500 pb-2 text-right">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gsc.pages.map((p, i) => (
                      <tr key={p.page} className={`border-b border-surface-800/50 ${i % 2 === 0 ? '' : 'bg-surface-900/30'}`}>
                        <td className="py-1.5 pr-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe className="w-3 h-3 text-surface-600 shrink-0" />
                            <a
                              href={`https://erictomchik.com${p.page}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-brand-400 hover:text-brand-300 font-medium truncate max-w-[300px]"
                            >
                              {p.page || '/'}
                            </a>
                          </div>
                        </td>
                        <td className="py-1.5 pr-3 text-right">
                          <span className="text-[11px] text-brand-400 font-semibold">{p.clicks}</span>
                        </td>
                        <td className="py-1.5 pr-3 text-right">
                          <span className="text-[11px] text-surface-300">{p.impressions.toLocaleString()}</span>
                        </td>
                        <td className="py-1.5 pr-3 text-right">
                          <span className={`text-[11px] font-medium ${p.ctr >= 5 ? 'text-green-400' : p.ctr >= 2 ? 'text-yellow-400' : 'text-surface-400'}`}>
                            {p.ctr}%
                          </span>
                        </td>
                        <td className="py-1.5 text-right">
                          <span className={`text-[11px] font-medium ${p.position <= 10 ? 'text-green-400' : p.position <= 20 ? 'text-yellow-400' : 'text-surface-400'}`}>
                            {p.position}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {gsc.pages.length === 0 && (
                <p className="text-xs text-surface-500 text-center py-4">No page data yet for this period.</p>
              )}
            </div>
          )}

          {/* Audit sub-tab — existing book audit + schema + tips */}
          {gscSubTab === 'audit' && (
            <>
              {/* Quick stats row */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-surface-400">Analytics</span>
                    <BarChart3 className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Tracking active
                  </div>
                </div>
                <div className="card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-surface-400">SEO Health</span>
                    <Search className="w-3.5 h-3.5 text-brand-400" />
                  </div>
                  <div className="text-xl font-bold text-white">{overallScore}%</div>
                  <div className="text-[10px] text-surface-500">{books.length} books</div>
                </div>
                <div className="card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-surface-400">Schema Markup</span>
                    <FileText className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <div className="text-xl font-bold text-white">{books.length}</div>
                  <div className="text-[10px] text-surface-500">pages w/ structured data</div>
                </div>
              </div>

              {/* Book SEO Audit */}
              <div className="card p-4">
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white">Book SEO Audit</h2>
                  <span className="text-[10px] text-surface-500">JSON-LD on each page</span>
                </div>
                <div className="space-y-3">
                  {books.map((book) => {
                    const checks = getBookSeoChecks(book);
                    return (
                      <div key={book._id} className="p-3 rounded-lg bg-surface-900/50 border border-surface-800">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {book.cover_image_url && (
                              <img src={book.cover_image_url} alt="" className="w-7 h-10 rounded object-cover border border-surface-700 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <h3 className="text-xs text-white font-medium truncate">{book.title}</h3>
                              <a href={`/books/${book.slug}`} target="_blank" className="text-[10px] text-brand-400 hover:text-brand-300">
                                /books/{book.slug}
                              </a>
                            </div>
                          </div>
                          <SeoScore checks={checks} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                          {checks.map((check) => (
                            <div
                              key={check.label}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] ${
                                check.pass ? 'bg-green-500/5 text-green-400' : 'bg-red-500/5 text-red-400'
                              }`}
                            >
                              {check.pass ? <CheckCircle className="w-2.5 h-2.5 shrink-0" /> : <AlertCircle className="w-2.5 h-2.5 shrink-0" />}
                              <span className="font-medium">{check.label}</span>
                              <span className="text-surface-500 ml-auto text-[9px] truncate">{check.detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Site Pages + SEO Tips */}
              <div className="grid lg:grid-cols-2 gap-3">
                <div className="card p-4">
                  <h2 className="text-sm font-semibold text-white mb-2">Site Pages</h2>
                  <div className="space-y-1">
                    {sitePages.map((page) => (
                      <div key={page.path} className="flex items-center justify-between px-2 py-1.5 rounded bg-surface-900/50 border border-surface-800">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-surface-500" />
                          <span className="text-[11px] text-white font-medium">{page.title}</span>
                          <span className="text-[10px] text-surface-500">{page.path}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-surface-500 hidden sm:inline">{page.note}</span>
                          {page.hasSchema ? (
                            <span className="flex items-center gap-0.5 text-[9px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                              <CheckCircle className="w-2.5 h-2.5" /> ✓
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-[9px] text-surface-500 bg-surface-800 px-1.5 py-0.5 rounded">
                              <AlertCircle className="w-2.5 h-2.5" /> —
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-4">
                  <h2 className="text-sm font-semibold text-white mb-2">SEO Tips</h2>
                  <div className="space-y-2">
                    {[
                      { icon: Tag, title: 'Fill all metadata', desc: 'ISBN, page count, published date → rich results.' },
                      { icon: FileText, title: 'Long descriptions', desc: 'Detailed content improves ranking.' },
                      { icon: Search, title: 'Submit sitemap', desc: 'sitemap.xml → Google Search Console.' },
                      { icon: Globe, title: 'Get backlinks', desc: 'Goodreads, BookBub, review sites.' },
                    ].map((tip) => (
                      <div key={tip.title} className="flex gap-2 p-2 rounded bg-surface-900/50">
                        <tip.icon className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[11px] font-medium text-white">{tip.title}</div>
                          <div className="text-[10px] text-surface-500">{tip.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
