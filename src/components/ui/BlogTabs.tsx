'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PenLine,
  Newspaper,
  ExternalLink,
  ArrowRight,
  Clock,
  Tag,
  Search,
  X,
  ChevronDown,
} from 'lucide-react';

/* ─── Tag helpers ─────────────────────────────────────────────────────── */

/** Normalize a tag so "AI"/"ai", "business-credit"/"business credit" collapse together. */
function normalizeTag(t: string): string {
  return t.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Number of tags shown before the "Show all tags" toggle. */
const TOP_TAG_COUNT = 12;

/* ─── Types ───────────────────────────────────────────────────────────── */

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url?: string;
  category: string;
  tags: string[];
  published_at?: number;
  reading_time_minutes?: number;
}

interface NewsItem {
  title: string;
  link: string;
  slug: string;
  description: string;
  fullContent: string;
  pubDate: string;
  source: string;
  category: string;
}

/* ─── Label / Color maps ──────────────────────────────────────────────── */

const postCategoryLabels: Record<string, string> = {
  'business-credit': 'Business & Credit',
  technology: 'Technology',
  cybersecurity: 'Cybersecurity',
  ai: 'AI',
  general: 'General',
};

const postCategoryColors: Record<string, string> = {
  'business-credit': 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
  technology: 'bg-violet-600/20 text-violet-400 border-violet-600/30',
  cybersecurity: 'bg-red-600/20 text-red-400 border-red-600/30',
  ai: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  general: 'bg-surface-600/20 text-surface-400 border-surface-600/30',
};

const newsCategoryLabels: Record<string, string> = {
  cybersecurity: 'Cybersecurity',
  ai: 'AI & Technology',
  business: 'Business',
  linux: 'Linux & Certifications',
};

const newsCategoryColors: Record<string, string> = {
  cybersecurity: 'bg-red-600/20 text-red-400 border-red-600/30',
  ai: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  business: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
  linux: 'bg-brand-600/20 text-brand-400 border-brand-600/30',
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* ─── Component ───────────────────────────────────────────────────────── */

export function BlogTabs({
  posts,
  newsItems,
}: {
  posts: BlogPost[];
  newsItems: NewsItem[];
}) {
  const [tab, setTab] = useState<'posts' | 'news'>('posts');

  // --- Posts filtering state ---
  const [postSearch, setPostSearch] = useState('');
  const [postCategory, setPostCategory] = useState<string>('all');
  const [postTag, setPostTag] = useState<string>('all');

  // --- News filtering state ---
  const [newsSearch, setNewsSearch] = useState('');
  const [newsCategory, setNewsCategory] = useState<string>('all');
  const [newsSource, setNewsSource] = useState<string>('all');

  // Derive available categories & tags from posts
  const postCategories = useMemo(
    () => [...new Set(posts.map((p) => p.category))].sort(),
    [posts],
  );

  // Merge duplicate tag spellings (case, hyphens, simple plurals) and count usage.
  // Only tags from posts in the selected category are shown.
  const tagGroups = useMemo(() => {
    const scoped =
      postCategory === 'all' ? posts : posts.filter((p) => p.category === postCategory);
    const groups = new Map<string, { count: number; variants: Map<string, number> }>();
    scoped.forEach((p) => {
      const seen = new Set<string>();
      p.tags?.forEach((t) => {
        const key = normalizeTag(t);
        if (!key) return;
        const g = groups.get(key) ?? { count: 0, variants: new Map() };
        if (!seen.has(key)) g.count += 1;
        seen.add(key);
        g.variants.set(t, (g.variants.get(t) ?? 0) + 1);
        groups.set(key, g);
      });
    });
    // Fold simple plurals ("backups" -> "backup") into the singular when both exist.
    for (const key of [...groups.keys()]) {
      const singular = key.endsWith('s') ? key.slice(0, -1) : '';
      if (singular && groups.has(singular)) {
        const from = groups.get(key)!;
        const to = groups.get(singular)!;
        to.count += from.count;
        from.variants.forEach((n, v) => to.variants.set(v, (to.variants.get(v) ?? 0) + n));
        groups.delete(key);
      }
    }
    return [...groups.entries()]
      .map(([key, g]) => {
        // Label: prefer a spelling with capitals (e.g. "AI", "ChatGPT", "POS systems"),
        // otherwise title-case the normalized tag ("business-credit" -> "Business Credit").
        const variants = [...g.variants.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
        const capped = variants.find(([v]) => /[A-Z]/.test(v));
        const label = capped
          ? capped[0].replace(/[-_]+/g, ' ')
          : key.replace(/\b\w/g, (c) => c.toUpperCase());
        return { key, label, count: g.count, keys: new Set([key, ...[...g.variants.keys()].map(normalizeTag)]) };
      })
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [posts, postCategory]);

  const [showAllTags, setShowAllTags] = useState(false);
  const visibleTags = useMemo(() => {
    if (showAllTags) return [...tagGroups].sort((a, b) => a.label.localeCompare(b.label));
    const top = tagGroups.slice(0, TOP_TAG_COUNT);
    const selected = tagGroups.find((g) => g.key === postTag);
    if (selected && !top.includes(selected)) top.push(selected);
    return top;
  }, [tagGroups, showAllTags, postTag]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    let result = posts;

    if (postCategory !== 'all') {
      result = result.filter((p) => p.category === postCategory);
    }

    if (postTag !== 'all') {
      const group = tagGroups.find((g) => g.key === postTag);
      const keys = group ? group.keys : new Set([postTag]);
      result = result.filter((p) => p.tags?.some((t) => keys.has(normalizeTag(t))));
    }

    if (postSearch.trim()) {
      const q = postSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [posts, postCategory, postTag, postSearch, tagGroups]);

  // Filter news
  const newsCategories = useMemo(
    () => [...new Set(newsItems.map((item) => item.category))],
    [newsItems],
  );

  const newsSources = useMemo(
    () => [...new Set(newsItems.map((item) => item.source))].sort(),
    [newsItems],
  );

  const filteredNews = useMemo(() => {
    let result = newsItems;

    if (newsCategory !== 'all') {
      result = result.filter((item) => item.category === newsCategory);
    }

    if (newsSource !== 'all') {
      result = result.filter((item) => item.source === newsSource);
    }

    if (newsSearch.trim()) {
      const q = newsSearch.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q),
      );
    }

    return result;
  }, [newsItems, newsCategory, newsSource, newsSearch]);

  const hasActiveNewsFilters =
    newsCategory !== 'all' || newsSource !== 'all' || newsSearch.trim() !== '';

  function clearNewsFilters() {
    setNewsSearch('');
    setNewsCategory('all');
    setNewsSource('all');
  }

  const hasActivePostFilters =
    postCategory !== 'all' || postTag !== 'all' || postSearch.trim() !== '';

  function clearPostFilters() {
    setPostSearch('');
    setPostCategory('all');
    setPostTag('all');
  }

  return (
    <>
      {/* Tab switcher */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <button
          onClick={() => setTab('posts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            tab === 'posts'
              ? 'glass text-brand-400 border border-brand-600/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          <PenLine className="w-4 h-4" />
          My Articles
        </button>
        <button
          onClick={() => setTab('news')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            tab === 'news'
              ? 'glass text-brand-400 border border-brand-600/30'
              : 'text-surface-400 hover:text-white'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          Industry News
        </button>
      </div>

      {/* ── My Articles ─────────────────────────────────────────────── */}
      {tab === 'posts' ? (
        <div>
          {/* Search + Filters */}
          {posts.length > 0 && (
            <div className="mb-8 space-y-4">
              {/* Search bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="Search articles by title, excerpt, or tag…"
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-surface-900 border border-surface-700
                             text-sm text-white placeholder-surface-500
                             focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20
                             transition-colors"
                />
                {postSearch && (
                  <button
                    onClick={() => setPostSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg
                               text-surface-500 hover:text-white hover:bg-surface-800 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setPostCategory('all')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    postCategory === 'all'
                      ? 'bg-brand-600/20 text-brand-400 border-brand-600/30'
                      : 'bg-surface-800/50 text-surface-400 border-surface-700 hover:text-white'
                  }`}
                >
                  All Categories
                </button>
                {postCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setPostCategory(postCategory === cat ? 'all' : cat)
                    }
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      postCategory === cat
                        ? postCategoryColors[cat] ||
                          'bg-brand-600/20 text-brand-400 border-brand-600/30'
                        : 'bg-surface-800/50 text-surface-400 border-surface-700 hover:text-white'
                    }`}
                  >
                    {postCategoryLabels[cat] || cat}
                  </button>
                ))}
              </div>

              {/* Tag pills (show when there are tags) */}
              {tagGroups.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  <span className="text-[11px] text-surface-500 flex items-center gap-1 mr-1">
                    <Tag className="w-3 h-3" />
                    {showAllTags ? 'All tags:' : 'Popular tags:'}
                  </span>
                  {visibleTags.map((g) => (
                    <button
                      key={g.key}
                      onClick={() => setPostTag(postTag === g.key ? 'all' : g.key)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                        postTag === g.key
                          ? 'bg-brand-600/20 text-brand-400 border-brand-600/30'
                          : 'bg-surface-800/30 text-surface-500 border-surface-700/50 hover:text-surface-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                  {tagGroups.length > TOP_TAG_COUNT && (
                    <button
                      onClick={() => setShowAllTags((v) => !v)}
                      aria-expanded={showAllTags}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                    >
                      {showAllTags ? 'Show fewer' : `Show all ${tagGroups.length} tags`}
                      <ChevronDown className={`w-3 h-3 transition-transform ${showAllTags ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              )}

              {/* Active filter summary */}
              {hasActivePostFilters && (
                <div className="flex items-center justify-center gap-2 text-xs text-surface-400">
                  <span>
                    Showing {filteredPosts.length} of {posts.length} article
                    {posts.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={clearPostFilters}
                    className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Posts grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="card group flex flex-col"
                >
                  {post.cover_image_url && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          postCategoryColors[post.category] ||
                          postCategoryColors.general
                        }`}
                      >
                        {postCategoryLabels[post.category] || post.category}
                      </span>
                      {post.reading_time_minutes && (
                        <span className="flex items-center gap-1 text-xs text-surface-500">
                          <Clock className="w-3 h-3" />
                          {post.reading_time_minutes} min read
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-surface-400 leading-relaxed flex-1">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-surface-800/50
                                       text-surface-500 border border-surface-700/50"
                          >
                            {t}
                          </span>
                        ))}
                        {post.tags.length > 4 && (
                          <span className="text-[10px] text-surface-600">
                            +{post.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {post.published_at && (
                      <div className="mt-4 pt-4 border-t border-surface-800/50 flex items-center justify-between">
                        <span className="text-xs text-surface-500">
                          {formatTimestamp(post.published_at)}
                        </span>
                        <span className="text-brand-400 text-xs font-medium flex items-center gap-1">
                          Read more{' '}
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : posts.length > 0 ? (
            /* No results from filtering */
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-surface-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">
                No articles found
              </h3>
              <p className="text-surface-400 text-sm mb-4">
                Try adjusting your search or filters.
              </p>
              <button
                onClick={clearPostFilters}
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* Empty state — no posts at all */
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center mx-auto mb-6">
                <PenLine className="w-8 h-8 text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Coming Soon
              </h2>
              <p className="text-surface-400 max-w-md mx-auto mb-6">
                I&apos;m working on in-depth articles about business credit, web
                development, and technology. Subscribe below to get notified when
                the first posts go live.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {Object.entries(postCategoryLabels).map(([key, label]) => (
                  <span
                    key={key}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border ${postCategoryColors[key]}`}
                  >
                    <Tag className="w-3 h-3 inline mr-1" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Industry News ────────────────────────────────────────────── */
        <div>
          {/* Search + Filters */}
          <div className="mb-8 space-y-4">
            {/* Search bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                value={newsSearch}
                onChange={(e) => setNewsSearch(e.target.value)}
                placeholder="Search news by title, description, or source…"
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-surface-900 border border-surface-700
                           text-sm text-white placeholder-surface-500
                           focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20
                           transition-colors"
              />
              {newsSearch && (
                <button
                  onClick={() => setNewsSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg
                             text-surface-500 hover:text-white hover:bg-surface-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category pills */}
            {newsCategories.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setNewsCategory('all')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    newsCategory === 'all'
                      ? 'bg-brand-600/20 text-brand-400 border-brand-600/30'
                      : 'bg-surface-800/50 text-surface-400 border-surface-700 hover:text-white'
                  }`}
                >
                  All Categories
                </button>
                {newsCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setNewsCategory(newsCategory === cat ? 'all' : cat)
                    }
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      newsCategory === cat
                        ? newsCategoryColors[cat] ||
                          'bg-brand-600/20 text-brand-400 border-brand-600/30'
                        : 'bg-surface-800/50 text-surface-400 border-surface-700 hover:text-white'
                    }`}
                  >
                    {newsCategoryLabels[cat] || cat}
                  </button>
                ))}
              </div>
            )}

            {/* Source pills */}
            {newsSources.length > 1 && (
              <div className="flex flex-wrap justify-center gap-1.5">
                <span className="text-[11px] text-surface-500 flex items-center gap-1 mr-1">
                  <Newspaper className="w-3 h-3" />
                  Sources:
                </span>
                {newsSources.map((src) => (
                  <button
                    key={src}
                    onClick={() =>
                      setNewsSource(newsSource === src ? 'all' : src)
                    }
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                      newsSource === src
                        ? 'bg-brand-600/20 text-brand-400 border-brand-600/30'
                        : 'bg-surface-800/30 text-surface-500 border-surface-700/50 hover:text-surface-300'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            )}

            {/* Active filter summary */}
            {hasActiveNewsFilters && (
              <div className="flex items-center justify-center gap-2 text-xs text-surface-400">
                <span>
                  Showing {filteredNews.length} of {newsItems.length} article
                  {newsItems.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearNewsFilters}
                  className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* News items */}
          {filteredNews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNews.map((item, i) => (
                <Link
                  key={`${item.slug}-${i}`}
                  href={`/news/${item.slug}`}
                  className="card group flex flex-col p-5 hover:border-brand-600/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        newsCategoryColors[item.category] ||
                        'bg-surface-600/20 text-surface-400 border-surface-600/30'
                      }`}
                    >
                      {newsCategoryLabels[item.category] || item.category}
                    </span>
                    <span className="text-xs text-surface-500">
                      {item.source}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 group-hover:text-brand-400 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-surface-400 leading-relaxed flex-1 line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-surface-800/50 flex items-center justify-between">
                    {item.pubDate && (
                      <span className="text-xs text-surface-500">
                        {formatDate(item.pubDate)}
                      </span>
                    )}
                    <span className="text-brand-400 text-xs font-medium flex items-center gap-1 ml-auto">
                      Read{' '}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : newsItems.length > 0 ? (
            /* No results from filtering */
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-surface-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">
                No news found
              </h3>
              <p className="text-surface-400 text-sm mb-4">
                Try adjusting your search or filters.
              </p>
              <button
                onClick={clearNewsFilters}
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="text-center py-16">
              <Newspaper className="w-12 h-12 text-surface-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">
                No news available
              </h3>
              <p className="text-surface-400 text-sm">
                Industry news feeds are temporarily unavailable. Check back soon.
              </p>
            </div>
          )}

          <p className="text-center text-xs text-surface-500 mt-8">
            Curated from industry-leading sources · Updated hourly
          </p>
        </div>
      )}
    </>
  );
}
