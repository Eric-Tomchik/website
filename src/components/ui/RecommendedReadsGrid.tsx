'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { BookOpen, ExternalLink } from 'lucide-react';
import { cn, amazonBookLink } from '@/lib/utils';
import {
  CATEGORY_LABELS,
  RECOMMENDED_READS,
  type ReadCategory,
  type RecommendedRead,
} from '@/lib/recommendedReads';

type Filter = 'all' | ReadCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'business', label: CATEGORY_LABELS.business },
  { key: 'tech', label: CATEGORY_LABELS.tech },
  { key: 'security', label: CATEGORY_LABELS.security },
  { key: 'ai', label: CATEGORY_LABELS.ai },
];

const CATEGORY_ACCENT: Record<ReadCategory, string> = {
  business: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  tech: 'bg-sky-500/10 text-sky-300 ring-sky-500/30',
  security: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  ai: 'bg-brand-500/10 text-brand-300 ring-brand-500/30',
};

function ReadCard({ read }: { read: RecommendedRead }) {
  const href = amazonBookLink(read.title, read.author, read.asin);
  return (
    <div className="card flex flex-col p-5 h-full">
      {/* Cover: real image when we have a licensed one, otherwise a typographic tile */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored nofollow"
        aria-label={`${read.title} on Amazon`}
        className="block mb-4 rounded-lg overflow-hidden bg-surface-800/60 ring-1 ring-surface-800
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        {read.cover ? (
          <Image
            src={read.cover}
            alt={`Cover of ${read.title} by ${read.author}`}
            width={300}
            height={450}
            loading="lazy"
            // Covers are already pre-sized/compressed webp (<=400px wide), so
            // skip the Workers image optimizer entirely.
            unoptimized
            className="w-full h-56 object-contain p-3 transition-transform duration-300 hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-56 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-surface-800 to-surface-900">
            <span className="text-base font-bold text-white leading-snug line-clamp-4">{read.title}</span>
            <span className="mt-2 text-xs text-surface-400">{read.author}</span>
          </div>
        )}
      </a>

      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className={cn(
            'px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 whitespace-nowrap',
            CATEGORY_ACCENT[read.category]
          )}
        >
          {CATEGORY_LABELS[read.category]}
        </span>
        <BookOpen className="w-4 h-4 text-surface-600 shrink-0" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{read.title}</h3>
      <p className="text-xs sm:text-sm text-surface-400 mt-1">{read.author}</p>
      <p className="text-sm text-surface-300 mt-3 flex-1">{read.note}</p>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored nofollow"
        data-analytics="affiliate_amazon_click"
        data-book-title={read.title}
        className="mt-5 inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-semibold
                   bg-[#FF9900] hover:bg-[#FFa31a] text-black transition-all duration-200
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400
                   focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950"
        onClick={() => {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'affiliate_click', {
              retailer: 'amazon',
              book_title: read.title,
              category: read.category,
            });
          }
        }}
      >
        <ExternalLink className="w-3.5 h-3.5 mr-1.5 shrink-0" />
        View on Amazon
      </a>
    </div>
  );
}

export function RecommendedReadsGrid() {
  const [filter, setFilter] = useState<Filter>('all');

  const reads = useMemo(
    () => (filter === 'all' ? RECOMMENDED_READS : RECOMMENDED_READS.filter((r) => r.category === filter)),
    [filter]
  );

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist" aria-label="Filter recommended reads">
        {FILTERS.map((f) => {
          const count =
            f.key === 'all'
              ? RECOMMENDED_READS.length
              : RECOMMENDED_READS.filter((r) => r.category === f.key).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                active
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-800/60 text-surface-300 hover:text-white hover:bg-surface-800'
              )}
            >
              {f.label}
              <span className="ml-1.5 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reads.map((read) => (
          <ReadCard key={read.title} read={read} />
        ))}
      </div>
    </div>
  );
}
