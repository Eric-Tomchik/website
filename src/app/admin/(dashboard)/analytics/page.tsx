'use client';

import { useQuery } from 'convex/react';
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
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useMemo, useState, useEffect, useCallback } from 'react';

// ── Types matching the API response ──────────────────────────────────────────

interface RealtimeData {
  activeUsers: number;
  pageviews: number;
  topPages: { page: string; activeUsers: number }[];
  topCountries: { country: string; activeUsers: number }[];
}

interface HistoricalData {
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

// ── Hooks ────────────────────────────────────────────────────────────────────

function useAnalytics<T>(type: 'realtime' | 'historical', days?: number, refreshInterval?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type });
      if (days) params.set('days', String(days));
      const res = await fetch(`/api/analytics?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
      setLastUpdated(new Date());
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

function formatDate(yyyymmdd: string): string {
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${m}/${d}`;
}

const deviceIcons: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

// ── Mini chart (sparkline bars) ──────────────────────────────────────────────

function SparkBars({ values, color = 'bg-brand-400' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[2px] h-10">
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

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'text-brand-400',
}: {
  label: string;
  value: string;
  icon: typeof Eye;
  subtitle?: string;
  trend?: 'up' | 'down';
  color?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-surface-400">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {trend && (
          <span className={trend === 'up' ? 'text-green-400' : 'text-red-400'}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-surface-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Real-time Pulse ──────────────────────────────────────────────────────────

function RealtimeSection() {
  const { data, error, loading, lastUpdated, refresh } = useAnalytics<RealtimeData>(
    'realtime',
    undefined,
    30_000, // refresh every 30s
  );

  if (error) {
    return (
      <div className="card p-6 border-red-500/20">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Failed to load real-time data: {error}</span>
        </div>
        <p className="text-xs text-surface-500 mt-2">
          Make sure the GA service account has Viewer access to the property and the env vars are set.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 border-green-500/20 relative overflow-hidden">
      {/* Pulse animation */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
        </span>
        <span className="text-xs text-green-400 font-medium">LIVE</span>
        <button onClick={refresh} className="text-surface-500 hover:text-white transition-colors ml-2" title="Refresh">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <h2 className="text-lg font-semibold text-white mb-1">Real-time</h2>
      <p className="text-xs text-surface-500 mb-4">
        {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
      </p>

      {loading && !data ? (
        <div className="flex items-center gap-2 text-surface-500 text-sm py-8 justify-center">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading real-time data...
        </div>
      ) : data ? (
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Active users */}
          <div>
            <div className="text-5xl font-bold text-green-400 mb-1">{data.activeUsers}</div>
            <div className="text-sm text-surface-400">active users right now</div>
          </div>

          {/* Top active pages */}
          <div>
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Active Pages</h3>
            {data.topPages.length === 0 ? (
              <p className="text-xs text-surface-500">No active pages</p>
            ) : (
              <div className="space-y-1.5">
                {data.topPages.slice(0, 5).map((p) => (
                  <div key={p.page} className="flex items-center justify-between text-xs">
                    <span className="text-surface-300 truncate mr-2">{p.page}</span>
                    <span className="text-green-400 font-mono font-medium">{p.activeUsers}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top countries */}
          <div>
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Countries</h3>
            {data.topCountries.length === 0 ? (
              <p className="text-xs text-surface-500">No data yet</p>
            ) : (
              <div className="space-y-1.5">
                {data.topCountries.slice(0, 5).map((c) => (
                  <div key={c.country} className="flex items-center justify-between text-xs">
                    <span className="text-surface-300">{c.country}</span>
                    <span className="text-green-400 font-mono font-medium">{c.activeUsers}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── SEO section (existing logic) ─────────────────────────────────────────────

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
    {
      label: 'Title',
      pass: book.title.length > 0 && book.title.length <= 70,
      detail: `${book.title.length} chars${book.title.length > 70 ? ' (too long)' : ''}`,
    },
    {
      label: 'Short Description',
      pass: book.description.length >= 50 && book.description.length <= 160,
      detail: `${book.description.length} chars${book.description.length < 50 ? ' (short)' : book.description.length > 160 ? ' (long)' : ' ✓'}`,
    },
    {
      label: 'Long Description',
      pass: !!book.long_description && book.long_description.length > 100,
      detail: book.long_description ? `${book.long_description.length} chars` : 'Missing',
    },
    { label: 'Cover Image', pass: !!book.cover_image_url, detail: book.cover_image_url ? 'Set' : 'Missing' },
    { label: 'ISBN', pass: !!book.isbn, detail: book.isbn || 'Missing' },
    { label: 'Page Count', pass: !!book.page_count, detail: book.page_count ? `${book.page_count}` : 'Missing' },
    { label: 'Published Date', pass: !!book.published_date, detail: book.published_date || 'Missing' },
    { label: 'Amazon Link', pass: !!book.amazon_url, detail: book.amazon_url ? 'Set' : 'Missing' },
  ];
}

function SeoScore({ checks }: { checks: { pass: boolean }[] }) {
  const score = Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);
  const color = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-surface-800"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={color}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>
          {score}
        </span>
      </div>
      <div>
        <div className={`text-sm font-semibold ${color}`}>{score}%</div>
        <div className="text-xs text-surface-500">
          {checks.filter((c) => c.pass).length}/{checks.length} passed
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const books = useQuery(api.books.list, {}) ?? [];
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [activeTab, setActiveTab] = useState<'analytics' | 'seo'>('analytics');

  const { data: historical, error: histError, loading: histLoading, refresh: histRefresh } =
    useAnalytics<HistoricalData>('historical', period, 300_000); // refresh every 5 min

  const overallChecks = useMemo(() => books.flatMap((b) => getBookSeoChecks(b)), [books]);
  const overallScore = overallChecks.length > 0
    ? Math.round((overallChecks.filter((c) => c.pass).length / overallChecks.length) * 100)
    : 0;

  const sitePages = useMemo(() => [
    { path: '/', title: 'Home', hasSchema: true, note: 'Website + Organization schema' },
    { path: '/books', title: 'Books', hasSchema: true, note: 'ItemList schema' },
    { path: '/services', title: 'Services', hasSchema: true, note: 'Service schema' },
    { path: '/portfolio', title: 'Portfolio', hasSchema: false, note: 'Add structured data' },
    { path: '/about', title: 'About', hasSchema: false, note: 'Add Person schema' },
    { path: '/contact', title: 'Contact', hasSchema: false, note: 'Add ContactPage schema' },
    { path: '/links', title: 'Links', hasSchema: false, note: 'Low priority' },
  ], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">SEO & Analytics</h1>
          <p className="text-surface-400 mt-1">Site performance, traffic insights, and search optimization.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-brand-500 text-white'
                : 'bg-surface-800 text-surface-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'seo'
                ? 'bg-brand-500 text-white'
                : 'bg-surface-800 text-surface-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            SEO
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <>
          {/* Real-time section */}
          <RealtimeSection />

          {/* Period selector */}
          <div className="flex items-center gap-2">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                onClick={() => setPeriod(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
              className="ml-auto text-surface-500 hover:text-white transition-colors text-xs flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${histLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {histError ? (
            <div className="card p-6 border-red-500/20">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Failed to load analytics: {histError}</span>
              </div>
            </div>
          ) : histLoading && !historical ? (
            <div className="card p-12 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin text-surface-500 mr-2" />
              <span className="text-surface-500">Loading analytics data...</span>
            </div>
          ) : historical ? (
            <>
              {/* Overview stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Users"
                  value={formatNumber(historical.totalUsers)}
                  icon={Users}
                  subtitle={`${formatNumber(historical.newUsers)} new`}
                  color="text-brand-400"
                />
                <StatCard
                  label="Sessions"
                  value={formatNumber(historical.totalSessions)}
                  icon={Activity}
                  color="text-green-400"
                />
                <StatCard
                  label="Pageviews"
                  value={formatNumber(historical.totalPageviews)}
                  icon={Eye}
                  color="text-blue-400"
                />
                <StatCard
                  label="Bounce Rate"
                  value={`${(historical.bounceRate * 100).toFixed(1)}%`}
                  icon={Zap}
                  subtitle={`Avg session: ${formatDuration(historical.avgSessionDuration)}`}
                  color="text-yellow-400"
                />
              </div>

              {/* Daily pageviews chart */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-1">Daily Pageviews</h2>
                <p className="text-xs text-surface-500 mb-4">Last {period} days</p>
                {historical.dailyPageviews.length > 0 ? (
                  <div>
                    <SparkBars
                      values={historical.dailyPageviews.map((d) => d.pageviews)}
                      color="bg-brand-400"
                    />
                    <div className="flex justify-between mt-2 text-[10px] text-surface-500">
                      <span>{formatDate(historical.dailyPageviews[0]?.date)}</span>
                      <span>{formatDate(historical.dailyPageviews[historical.dailyPageviews.length - 1]?.date)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No data for this period</p>
                )}
              </div>

              {/* Two-column: Top Pages + Traffic Sources */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Top pages */}
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Top Pages</h2>
                  <div className="space-y-2">
                    {historical.topPages.map((p, i) => {
                      const maxPV = Math.max(...historical.topPages.map((x) => x.pageviews), 1);
                      return (
                        <div key={p.page} className="group">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-surface-300 truncate mr-2 max-w-[70%]">{p.page}</span>
                            <div className="flex items-center gap-3 text-xs text-surface-500 shrink-0">
                              <span>{formatNumber(p.pageviews)} views</span>
                              <span>{formatNumber(p.users)} users</span>
                            </div>
                          </div>
                          <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-400 rounded-full transition-all"
                              style={{ width: `${(p.pageviews / maxPV) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Traffic sources */}
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Traffic Sources</h2>
                  <div className="space-y-2">
                    {historical.trafficSources.map((s) => {
                      const maxSess = Math.max(...historical.trafficSources.map((x) => x.sessions), 1);
                      const sourceLabel = s.source === '(direct)' ? 'Direct' : s.source;
                      const mediumLabel = s.medium === '(none)' ? '' : ` / ${s.medium}`;
                      return (
                        <div key={`${s.source}-${s.medium}`}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-surface-300 truncate mr-2">
                              {sourceLabel}{mediumLabel}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-surface-500 shrink-0">
                              <span>{formatNumber(s.sessions)} sessions</span>
                              <span>{formatNumber(s.users)} users</span>
                            </div>
                          </div>
                          <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-400 rounded-full transition-all"
                              style={{ width: `${(s.sessions / maxSess) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Three-column: Devices, Countries, Events */}
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Devices */}
                <div className="card p-6">
                  <h2 className="text-sm font-semibold text-white mb-3">Devices</h2>
                  <div className="space-y-3">
                    {historical.devices.map((d) => {
                      const Icon = deviceIcons[d.device.toLowerCase()] || Monitor;
                      const total = historical.devices.reduce((a, x) => a + x.sessions, 0) || 1;
                      const pct = ((d.sessions / total) * 100).toFixed(1);
                      return (
                        <div key={d.device} className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-surface-500" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-surface-300 capitalize">{d.device}</span>
                              <span className="text-surface-500">{pct}%</span>
                            </div>
                            <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-400 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Countries */}
                <div className="card p-6">
                  <h2 className="text-sm font-semibold text-white mb-3">Top Countries</h2>
                  <div className="space-y-2">
                    {historical.countries.slice(0, 8).map((c, i) => (
                      <div key={c.country} className="flex items-center justify-between text-xs">
                        <span className="text-surface-300">{c.country}</span>
                        <span className="text-surface-500 font-mono">{formatNumber(c.users)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events */}
                <div className="card p-6">
                  <h2 className="text-sm font-semibold text-white mb-3">Top Events</h2>
                  <div className="space-y-2">
                    {historical.topEvents.slice(0, 8).map((e) => (
                      <div key={e.event} className="flex items-center justify-between text-xs">
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
        /* ── SEO Tab ──────────────────────────────────────────────────────── */
        <>
          {/* SEO Quick Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-surface-400">Google Analytics</span>
                <BarChart3 className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <CheckCircle className="w-3 h-3" />
                Tracking active on all pages
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-surface-400">SEO Health</span>
                <Search className="w-5 h-5 text-brand-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{overallScore}%</div>
              <div className="text-xs text-surface-500">Across {books.length} books</div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-surface-400">Schema Markup</span>
                <FileText className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{books.length}</div>
              <div className="text-xs text-surface-500">Book pages with structured data</div>
            </div>
          </div>

          {/* Book SEO Audit */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Book SEO Audit</h2>
            <p className="text-xs text-surface-500 mb-6">
              Each book page includes JSON-LD structured data (Book + Product schema).
            </p>
            <div className="space-y-6">
              {books.map((book) => {
                const checks = getBookSeoChecks(book);
                return (
                  <div key={book._id} className="p-4 rounded-xl bg-surface-900/50 border border-surface-800">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        {book.cover_image_url && (
                          <img
                            src={book.cover_image_url}
                            alt=""
                            className="w-10 h-14 rounded object-cover border border-surface-700"
                          />
                        )}
                        <div>
                          <h3 className="text-white font-medium">{book.title}</h3>
                          <a
                            href={`/books/${book.slug}`}
                            target="_blank"
                            className="text-xs text-brand-400 hover:text-brand-300"
                          >
                            /books/{book.slug}
                          </a>
                        </div>
                      </div>
                      <SeoScore checks={checks} />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {checks.map((check) => (
                        <div
                          key={check.label}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                            check.pass ? 'bg-green-500/5 text-green-400' : 'bg-red-500/5 text-red-400'
                          }`}
                        >
                          {check.pass ? (
                            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          )}
                          <span className="font-medium">{check.label}</span>
                          <span className="text-surface-500 ml-auto truncate">{check.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Site Pages SEO */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Site Pages</h2>
            <p className="text-xs text-surface-500 mb-4">Schema markup status per page</p>
            <div className="space-y-2">
              {sitePages.map((page) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-900/50 border border-surface-800"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-surface-500" />
                    <div>
                      <span className="text-sm text-white font-medium">{page.title}</span>
                      <span className="text-xs text-surface-500 ml-2">{page.path}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-surface-500">{page.note}</span>
                    {page.hasSchema ? (
                      <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3" /> Schema
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Tips */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">SEO Quick Tips</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Tag,
                  title: 'Fill all book metadata',
                  desc: 'ISBN, page count, and published date help Google show rich book results.',
                },
                {
                  icon: FileText,
                  title: 'Write long descriptions',
                  desc: 'Detailed descriptions improve search ranking and give readers confidence.',
                },
                {
                  icon: Search,
                  title: 'Submit sitemap',
                  desc: 'Submit your sitemap.xml to Google Search Console for faster indexing.',
                },
                {
                  icon: Globe,
                  title: 'Get backlinks',
                  desc: 'Get your books listed on Goodreads, BookBub, and book review sites.',
                },
              ].map((tip) => (
                <div key={tip.title} className="flex gap-3 p-3 rounded-lg bg-surface-900/50">
                  <tip.icon className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-white">{tip.title}</div>
                    <div className="text-xs text-surface-500 mt-0.5">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
