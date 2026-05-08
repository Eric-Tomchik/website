'use client';

import Link from 'next/link';
import { CheckCircle2, Minus, BookOpen } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface BookInfo {
  slug: string;
  title: string;
  shortTitle: string;
  color: string;
  headerBg: string;
}

const books: BookInfo[] = [
  {
    slug: 'credit-without-a-credit-score',
    title: 'Credit Without a Credit Score',
    shortTitle: 'Business Credit',
    color: 'text-emerald-400',
    headerBg: 'bg-emerald-600/15 border-emerald-600/30',
  },
  {
    slug: 'the-ai-powered-business',
    title: 'The AI-Powered Business',
    shortTitle: 'AI Business',
    color: 'text-amber-400',
    headerBg: 'bg-amber-600/15 border-amber-600/30',
  },
  {
    slug: 'the-complete-ai-platform-guide-2026',
    title: 'The Complete AI Platform Guide 2026',
    shortTitle: 'AI Platforms',
    color: 'text-violet-400',
    headerBg: 'bg-violet-600/15 border-violet-600/30',
  },
  {
    slug: 'the-complete-cybersecurity-guide-for-small-business',
    title: 'The Complete Cybersecurity Guide',
    shortTitle: 'Cybersecurity',
    color: 'text-red-400',
    headerBg: 'bg-red-600/15 border-red-600/30',
  },
  {
    slug: 'the-complete-pos-systems-guide',
    title: 'The Complete POS Systems Guide',
    shortTitle: 'POS Systems',
    color: 'text-sky-400',
    headerBg: 'bg-sky-600/15 border-sky-600/30',
  },
  {
    slug: 'business-solution-provider',
    title: 'Business Solution Provider',
    shortTitle: 'B2B Sales',
    color: 'text-brand-400',
    headerBg: 'bg-brand-600/15 border-brand-600/30',
  },
];

interface TopicRow {
  topic: string;
  coverage: boolean[];
}

const topics: TopicRow[] = [
  { topic: 'Building Business Credit', coverage: [true, false, false, false, false, false] },
  { topic: 'EIN-Only Credit Strategies', coverage: [true, false, false, false, false, false] },
  { topic: 'AI Tools & Platforms', coverage: [false, true, true, false, false, false] },
  { topic: 'AI for Marketing & Sales', coverage: [false, true, true, false, false, true] },
  { topic: 'AI Platform Comparisons', coverage: [false, false, true, false, false, false] },
  { topic: 'Prompt Engineering', coverage: [false, true, true, false, false, false] },
  { topic: 'Cybersecurity Fundamentals', coverage: [false, false, false, true, false, false] },
  { topic: 'Data Protection & Privacy', coverage: [false, false, false, true, false, false] },
  { topic: 'POS System Selection', coverage: [false, false, false, false, true, false] },
  { topic: 'Payment Processing', coverage: [false, false, false, false, true, false] },
  { topic: 'D2D / B2B Sales Strategies', coverage: [false, false, false, false, false, true] },
  { topic: 'Objection Handling Scripts', coverage: [false, false, false, false, false, true] },
  { topic: 'Small Business Operations', coverage: [true, true, false, true, true, true] },
  { topic: 'Industry-Specific Guides', coverage: [false, true, false, true, true, false] },
  { topic: 'Step-by-Step Action Plans', coverage: [true, true, true, true, true, true] },
];

export function BookComparisonTable() {
  return (
    <ScrollReveal animation="fade-up">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Find the <span className="gradient-text">Right Book</span> for You
          </h2>
          <p className="text-surface-400 max-w-xl mx-auto">
            Each book tackles a different challenge. See what&apos;s covered at a glance.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-surface-400 bg-surface-800/50 border-b border-surface-700/50 w-56">
                    Topic
                  </th>
                  {books.map((book) => (
                    <th key={book.slug} className={`px-3 py-4 text-center border-b border-surface-700/50 ${book.headerBg}`}>
                      <Link href={`/books/${book.slug}`} className="group">
                        <div className={`text-xs font-bold ${book.color} group-hover:brightness-125 transition-all`}>
                          {book.shortTitle}
                        </div>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topics.map((row, i) => (
                  <tr
                    key={row.topic}
                    className={`${i % 2 === 0 ? 'bg-surface-900/30' : ''} hover:bg-surface-800/30 transition-colors`}
                  >
                    <td className="px-5 py-3 text-sm text-surface-300 font-medium border-b border-surface-800/50">
                      {row.topic}
                    </td>
                    {row.coverage.map((covered, j) => (
                      <td key={j} className="px-3 py-3 text-center border-b border-surface-800/50">
                        {covered ? (
                          <CheckCircle2 className={`w-5 h-5 mx-auto ${books[j].color}`} />
                        ) : (
                          <Minus className="w-4 h-4 mx-auto text-surface-700" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-4">
          {books.map((book, bookIdx) => {
            const coveredTopics = topics.filter((t) => t.coverage[bookIdx]);
            return (
              <Link
                key={book.slug}
                href={`/books/${book.slug}`}
                className={`card p-5 block border ${book.headerBg} hover:brightness-110 transition-all`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className={`w-5 h-5 ${book.color}`} />
                  <h3 className={`font-bold ${book.color}`}>{book.shortTitle}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {coveredTopics.map((t) => (
                    <span
                      key={t.topic}
                      className="text-xs px-2.5 py-1 rounded-full bg-surface-800/80 text-surface-300 border border-surface-700/50"
                    >
                      {t.topic}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}
