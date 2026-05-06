'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import {
  BarChart3,
  Search,
  Globe,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  Eye,
  FileText,
  Tag,
} from 'lucide-react';
import { useMemo } from 'react';

const GA_PROPERTY_ID = 'G-S7LEXFE3ND';

// SEO checklist items for each book
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
      detail: `${book.title.length} chars${book.title.length > 70 ? ' (too long for search)' : ''}`,
    },
    {
      label: 'Short Description',
      pass: book.description.length >= 50 && book.description.length <= 160,
      detail: `${book.description.length} chars${book.description.length < 50 ? ' (too short)' : book.description.length > 160 ? ' (too long for meta)' : ' ✓'}`,
    },
    {
      label: 'Long Description',
      pass: !!book.long_description && book.long_description.length > 100,
      detail: book.long_description ? `${book.long_description.length} chars` : 'Missing',
    },
    { label: 'Cover Image', pass: !!book.cover_image_url, detail: book.cover_image_url ? 'Set' : 'Missing' },
    { label: 'ISBN', pass: !!book.isbn, detail: book.isbn || 'Missing' },
    { label: 'Page Count', pass: !!book.page_count, detail: book.page_count ? `${book.page_count} pages` : 'Missing' },
    { label: 'Published Date', pass: !!book.published_date, detail: book.published_date || 'Missing' },
    { label: 'Amazon Link', pass: !!book.amazon_url, detail: book.amazon_url ? 'Set' : 'Missing' },
  ];
}

function SeoScore({ checks }: { checks: { pass: boolean }[] }) {
  const score = Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);
  const color = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const bgColor = score >= 80 ? 'bg-green-400' : score >= 50 ? 'bg-yellow-400' : 'bg-red-400';

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
        <div className={`text-sm font-semibold ${color}`}>{score}% Complete</div>
        <div className="text-xs text-surface-500">
          {checks.filter((c) => c.pass).length}/{checks.length} checks passed
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const books = useQuery(api.books.list, {}) ?? [];

  const sitePages = useMemo(() => [
    { path: '/', title: 'Home', hasSchema: true, note: 'Website + Organization schema' },
    { path: '/books', title: 'Books', hasSchema: true, note: 'ItemList schema' },
    { path: '/services', title: 'Services', hasSchema: true, note: 'Service schema' },
    { path: '/portfolio', title: 'Portfolio', hasSchema: false, note: 'Add structured data' },
    { path: '/about', title: 'About', hasSchema: false, note: 'Add Person schema' },
    { path: '/contact', title: 'Contact', hasSchema: false, note: 'Add ContactPage schema' },
    { path: '/links', title: 'Links', hasSchema: false, note: 'Low priority' },
  ], []);

  const overallChecks = useMemo(() => {
    return books.flatMap((b) => getBookSeoChecks(b));
  }, [books]);

  const overallScore = overallChecks.length > 0
    ? Math.round((overallChecks.filter((c) => c.pass).length / overallChecks.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">SEO & Analytics</h1>
        <p className="text-surface-400 mt-1">
          Track site performance and optimize for search engines.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-surface-400">Google Analytics</span>
            <BarChart3 className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-sm font-mono text-white mb-1">{GA_PROPERTY_ID}</div>
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
          <div className="text-xs text-surface-500">
            Across {books.length} books
          </div>
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

      {/* Google Analytics Embed */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Google Analytics</h2>
            <p className="text-xs text-surface-500 mt-1">
              View full analytics in Google Analytics dashboard
            </p>
          </div>
          <a
            href={`https://analytics.google.com/analytics/web/#/p${GA_PROPERTY_ID.replace('G-', '')}/reports/home`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm py-2 px-4"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Google Analytics
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[
            {
              label: 'Real-time',
              icon: Eye,
              url: `https://analytics.google.com/analytics/web/#/report/visitors-actives/`,
              desc: 'Active users right now',
            },
            {
              label: 'Acquisition',
              icon: TrendingUp,
              url: `https://analytics.google.com/analytics/web/#/report/trafficsources-overview/`,
              desc: 'How visitors find you',
            },
            {
              label: 'Pages',
              icon: FileText,
              url: `https://analytics.google.com/analytics/web/#/report/content-pages/`,
              desc: 'Top pages by views',
            },
            {
              label: 'Search Console',
              icon: Search,
              url: 'https://search.google.com/search-console',
              desc: 'Search performance',
            },
          ].map((item) => (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-surface-900/50 border border-surface-800 hover:border-brand-500/30 transition-colors group"
            >
              <item.icon className="w-6 h-6 text-brand-400 mb-2" />
              <div className="text-sm font-medium text-white group-hover:text-brand-400 transition-colors">
                {item.label}
              </div>
              <div className="text-xs text-surface-500">{item.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Book SEO Audit */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Book SEO Audit</h2>
        <p className="text-xs text-surface-500 mb-6">
          Each book page includes JSON-LD structured data (Book + Product schema). Fill in all fields for best search results.
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
                        check.pass
                          ? 'bg-green-500/5 text-green-400'
                          : 'bg-red-500/5 text-red-400'
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
    </div>
  );
}
