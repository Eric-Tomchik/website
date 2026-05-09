/**
 * Lightweight RSS feed fetcher and parser.
 * No external dependencies — parses XML with regex for Cloudflare Workers compatibility.
 */

export interface FeedSource {
  name: string;
  url: string;
  category: string;
}

export interface FeedItem {
  title: string;
  link: string;
  slug: string;
  description: string;
  fullContent: string;
  pubDate: string;
  source: string;
  category: string;
}

/** Generate a URL-safe slug from an article link */
export function articleSlug(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash) + url.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Curated feed sources organized by category (free, no-paywall sources)
export const FEED_SOURCES: FeedSource[] = [
  // Cybersecurity
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', category: 'cybersecurity' },
  { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', category: 'cybersecurity' },
  { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', category: 'cybersecurity' },

  // Web Development
  { name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/', category: 'web-development' },
  { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/', category: 'web-development' },
  { name: 'The New Stack', url: 'https://thenewstack.io/feed/', category: 'web-development' },

  // AI & Technology
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'ai' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'ai' },
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', category: 'ai' },
];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)));
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

function extractTag(xml: string, tag: string): string {
  // Handle CDATA sections
  const cdataPattern = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
  const cdataMatch = xml.match(cdataPattern);
  if (cdataMatch) return cdataMatch[1].trim();

  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(pattern);
  return match ? match[1].trim() : '';
}

function parseItems(xml: string): Array<{
  title: string;
  link: string;
  description: string;
  fullContent: string;
  pubDate: string;
}> {
  const items: Array<{
    title: string;
    link: string;
    description: string;
    fullContent: string;
    pubDate: string;
  }> = [];

  // Match both <item> (RSS) and <entry> (Atom) elements
  const itemPattern = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;

  while ((match = itemPattern.exec(xml)) !== null) {
    const content = match[1];
    const title = decodeHtmlEntities(stripHtml(extractTag(content, 'title')));

    // RSS uses <link>, Atom uses <link href="..."/>
    let link = extractTag(content, 'link');
    if (!link) {
      const linkHrefMatch = content.match(/<link[^>]*href=["']([^"']*)["']/i);
      if (linkHrefMatch) link = linkHrefMatch[1];
    }

    // Get full content (prefer content:encoded > content > summary > description)
    const rawFullContent =
      extractTag(content, 'content:encoded') ||
      extractTag(content, 'content') ||
      extractTag(content, 'summary') ||
      extractTag(content, 'description');

    const fullContent = decodeHtmlEntities(rawFullContent);

    // Short description for cards (strip HTML, limit length)
    const description = stripHtml(decodeHtmlEntities(
      extractTag(content, 'description') ||
      extractTag(content, 'summary') ||
      rawFullContent
    )).slice(0, 300);

    const pubDate = extractTag(content, 'pubDate') ||
      extractTag(content, 'published') ||
      extractTag(content, 'updated') ||
      extractTag(content, 'dc:date');

    if (title && link) {
      items.push({ title, link, description, fullContent, pubDate });
    }
  }

  return items;
}

async function fetchFeed(source: FeedSource, signal?: AbortSignal): Promise<FeedItem[]> {
  try {
    const res = await fetch(source.url, {
      signal,
      headers: { 'User-Agent': 'EricTomchik-Blog/1.0' },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const rawItems = parseItems(xml);

    return rawItems.slice(0, 5).map((item) => ({
      title: item.title,
      link: item.link,
      slug: articleSlug(item.link),
      description: item.description,
      fullContent: item.fullContent,
      pubDate: item.pubDate,
      source: source.name,
      category: source.category,
    }));
  } catch {
    return [];
  }
}

export async function fetchAllFeeds(
  sources: FeedSource[] = FEED_SOURCES
): Promise<FeedItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const results = await Promise.allSettled(
      sources.map((source) => fetchFeed(source, controller.signal))
    );

    const items: FeedItem[] = results
      .filter((r): r is PromiseFulfilledResult<FeedItem[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    // Sort by date (newest first), with fallback for unparseable dates
    items.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime() || 0;
      const dateB = new Date(b.pubDate).getTime() || 0;
      return dateB - dateA;
    });

    return items;
  } finally {
    clearTimeout(timeout);
  }
}
