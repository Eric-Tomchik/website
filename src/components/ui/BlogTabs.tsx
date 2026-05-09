'use client';

import { useState } from 'react';
import { PenLine, Newspaper, ExternalLink } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: string;
}

const categoryLabels: Record<string, string> = {
  cybersecurity: 'Cybersecurity',
  'web-development': 'Web Development',
  ai: 'AI',
  business: 'Business',
  technology: 'Technology',
};

const categoryColors: Record<string, string> = {
  cybersecurity: 'bg-red-600/20 text-red-400 border-red-600/30',
  'web-development': 'bg-brand-600/20 text-brand-400 border-brand-600/30',
  ai: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  business: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
  technology: 'bg-violet-600/20 text-violet-400 border-violet-600/30',
};

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

export function BlogTabs({
  postsContent,
  newsItems,
}: {
  postsContent: React.ReactNode;
  newsItems: NewsItem[];
}) {
  const [tab, setTab] = useState<'posts' | 'news'>('posts');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const newsCategories = [...new Set(newsItems.map((item) => item.category))];
  const filteredNews =
    filterCategory === 'all'
      ? newsItems
      : newsItems.filter((item) => item.category === filterCategory);

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

      {/* Tab content */}
      {tab === 'posts' ? (
        postsContent
      ) : (
        <div>
          {/* Category filter pills */}
          {newsCategories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setFilterCategory('all')}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-brand-600/20 text-brand-400 border-brand-600/30'
                    : 'bg-surface-800/50 text-surface-400 border-surface-700 hover:text-white'
                }`}
              >
                All
              </button>
              {newsCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    filterCategory === cat
                      ? (categoryColors[cat] || 'bg-brand-600/20 text-brand-400 border-brand-600/30')
                      : 'bg-surface-800/50 text-surface-400 border-surface-700 hover:text-white'
                  }`}
                >
                  {categoryLabels[cat] || cat}
                </button>
              ))}
            </div>
          )}

          {/* News items */}
          {filteredNews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNews.map((item, i) => (
                <a
                  key={`${item.link}-${i}`}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group flex flex-col p-5 hover:border-brand-600/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        categoryColors[item.category] || 'bg-surface-600/20 text-surface-400 border-surface-600/30'
                      }`}
                    >
                      {categoryLabels[item.category] || item.category}
                    </span>
                    <span className="text-xs text-surface-500">{item.source}</span>
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
                      Read <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Newspaper className="w-12 h-12 text-surface-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No news available</h3>
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
