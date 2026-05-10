import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Clock, Tag } from 'lucide-react';
import { fetchAllFeeds, FEED_SOURCES } from '@/lib/rss';

export const revalidate = 3600;

const categoryLabels: Record<string, string> = {
  cybersecurity: 'Cybersecurity',
  'web-development': 'Web Development',
  ai: 'AI & Technology',
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
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Sanitize HTML: allow safe tags, strip scripts/iframes/styles, improve formatting */
function sanitizeHtml(html: string): string {
  let cleaned = html
    // Remove script tags and content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Remove style tags and content
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // Remove iframes
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<iframe[^>]*\/>/gi, '')
    // Remove event handlers
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .replace(/\s+on\w+='[^']*'/gi, '')
    // Remove javascript: urls
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    // Remove form elements
    .replace(/<\/?(?:form|input|button|select|textarea)[^>]*>/gi, '')
    // Remove inline styles and classes (let prose handle styling)
    .replace(/\s+style="[^"]*"/gi, '')
    .replace(/\s+class="[^"]*"/gi, '')
    // Remove WordPress-specific boilerplate divs
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '')
    // Remove empty paragraphs
    .replace(/<p[^>]*>\s*(&nbsp;|\s)*<\/p>/gi, '');

  // If content has very few HTML tags, it's likely plain text — wrap in <p> tags
  const tagCount = (cleaned.match(/<(?:p|h[1-6]|ul|ol|li|blockquote|pre|figure|table)\b/gi) || []).length;
  const textLength = cleaned.replace(/<[^>]*>/g, '').trim().length;

  if (textLength > 200 && tagCount < 3) {
    // Plain text content: split on double newlines into paragraphs
    cleaned = cleaned
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        // If block already wrapped in a block-level tag, keep it
        if (/^<(?:p|h[1-6]|ul|ol|li|blockquote|pre|figure|table)\b/i.test(block)) {
          return block;
        }
        return `<p>${block.replace(/\n/g, '<br />')}</p>`;
      })
      .join('\n');
  }

  return cleaned;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const items = await fetchAllFeeds(FEED_SOURCES).catch(() => []);
  const article = items.find((item) => item.slug === slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: `${article.title} — Industry News`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://erictomchik.com/news/${slug}`,
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const items = await fetchAllFeeds(FEED_SOURCES).catch(() => []);
  const article = items.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  const readingTime = estimateReadingTime(article.fullContent || article.description);
  const hasFullContent = article.fullContent && article.fullContent.length > 100;
  const sanitizedContent = sanitizeHtml(article.fullContent || article.description);

  return (
    <div className="py-16">
      <div className="section-container max-w-3xl">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-brand-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Article header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                categoryColors[article.category] ||
                'bg-surface-600/20 text-surface-400 border-surface-600/30'
              }`}
            >
              <Tag className="w-3 h-3 inline mr-1" />
              {categoryLabels[article.category] || article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-surface-500">
              <Clock className="w-3 h-3" />
              {readingTime} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-surface-400">
            <span>
              From{' '}
              <span className="text-brand-400 font-medium">{article.source}</span>
            </span>
            {article.pubDate && (
              <>
                <span className="text-surface-600">·</span>
                <span>{formatDate(article.pubDate)}</span>
              </>
            )}
          </div>
        </header>

        {/* Article content */}
        <article
          className="prose prose-invert prose-brand max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-p:text-surface-300 prose-p:leading-relaxed
            prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-blockquote:border-brand-600/50 prose-blockquote:text-surface-400
            prose-code:text-brand-400 prose-code:bg-surface-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-img:rounded-lg prose-img:mx-auto
            prose-li:text-surface-300"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Source attribution */}
        <div className="mt-12 pt-8 border-t border-surface-800">
          <div className="rounded-lg bg-surface-800/50 border border-surface-700 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-surface-400">
                Originally published on{' '}
                <span className="text-white font-medium">{article.source}</span>
              </p>
              {!hasFullContent && (
                <p className="text-xs text-surface-500 mt-1">
                  Read the full article at the original source.
                </p>
              )}
            </div>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600/10 border border-brand-600/30 text-brand-400 text-sm font-medium hover:bg-brand-600/20 transition-colors flex-shrink-0"
            >
              View Original
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Back to blog */}
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all articles
          </Link>
        </div>
      </div>
    </div>
  );
}
