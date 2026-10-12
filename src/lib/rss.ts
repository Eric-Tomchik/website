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

  // AI & Technology
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'ai' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'ai' },
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', category: 'ai' },

  // Business & Entrepreneurship
  { name: 'SBA.gov Blog', url: 'https://www.sba.gov/blog/feed', category: 'business' },
  { name: 'Small Business Trends', url: 'https://smallbiztrends.com/feed', category: 'business' },
  { name: 'Entrepreneur', url: 'https://www.entrepreneur.com/latest.rss', category: 'business' },

  // Linux & IT Certifications
  { name: 'OMG! Ubuntu', url: 'https://www.omgubuntu.co.uk/feed', category: 'linux' },
  { name: 'It\'s FOSS', url: 'https://itsfoss.com/feed/', category: 'linux' },
  { name: 'CompTIA Blog', url: 'https://www.comptia.org/blog/rss', category: 'linux' },
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

/* ─── Caching ────────────────────────────────────────────────────────────
 * The site renders dynamically (per-request CSP nonce) and OpenNext has no
 * incremental cache configured, so `export const revalidate` does nothing and
 * every /blog or /news view used to download and parse ~12 external RSS feeds
 * (~600 KB of XML) before the page could render. Cache the parsed result:
 *   1. per-isolate memory (fastest, survives between requests on a warm worker)
 *   2. Cloudflare's edge cache via the Cache API (shared across isolates)
 * Fresh for FRESH_MS; after that we serve the stale copy immediately and
 * refresh in the background (stale-while-revalidate) when possible.
 */
const FRESH_MS = 30 * 60 * 1000; // 30 minutes
const MAX_STALE_S = 24 * 60 * 60; // keep stale copies up to a day
const FETCH_TIMEOUT_MS = 5000;

interface CachedFeeds {
  at: number;
  items: FeedItem[];
}

const memCache = new Map<string, CachedFeeds>();
const inflight = new Map<string, Promise<FeedItem[]>>();

function cacheKey(sources: FeedSource[]): string {
  return `https://erictomchik.com/__cache/rss/${articleSlug(sources.map((s) => s.url).join('|'))}`;
}

function edgeCache(): Cache | null {
  try {
    const c = (globalThis as unknown as { caches?: { default?: Cache } }).caches;
    return c?.default ?? null;
  } catch {
    return null;
  }
}

async function readEdge(key: string): Promise<CachedFeeds | null> {
  const cache = edgeCache();
  if (!cache) return null;
  try {
    const res = await cache.match(key);
    if (!res) return null;
    return (await res.json()) as CachedFeeds;
  } catch {
    return null;
  }
}

async function writeEdge(key: string, value: CachedFeeds): Promise<void> {
  const cache = edgeCache();
  if (!cache) return;
  try {
    await cache.put(
      key,
      new Response(JSON.stringify(value), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${MAX_STALE_S}`,
        },
      }),
    );
  } catch {
    // Cache is a best-effort optimisation.
  }
}

/** Run a background task past the end of the response when on Workers. */
async function runInBackground(task: Promise<unknown>): Promise<boolean> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { ctx } = await getCloudflareContext({ async: true });
    ctx.waitUntil(task);
    return true;
  } catch {
    return false;
  }
}

async function fetchAllFeedsUncached(sources: FeedSource[]): Promise<FeedItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

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

/** Fetch fresh feeds and store them in both cache layers (deduped per isolate). */
function refresh(key: string, sources: FeedSource[]): Promise<FeedItem[]> {
  const existing = inflight.get(key);
  if (existing) return existing;

  const p = (async () => {
    const items = await fetchAllFeedsUncached(sources);
    // Don't overwrite a good cache with an empty result from a network blip.
    if (items.length > 0) {
      const value = { at: Date.now(), items };
      memCache.set(key, value);
      await writeEdge(key, value);
    }
    return items;
  })().finally(() => inflight.delete(key));

  inflight.set(key, p);
  return p;
}

export async function fetchAllFeeds(
  sources: FeedSource[] = FEED_SOURCES
): Promise<FeedItem[]> {
  const key = cacheKey(sources);

  let cached = memCache.get(key) ?? null;
  if (!cached) {
    cached = await readEdge(key);
    if (cached) memCache.set(key, cached);
  }

  if (cached && cached.items.length > 0) {
    if (Date.now() - cached.at > FRESH_MS) {
      // Stale: serve it now, refresh in the background if the runtime allows.
      const task = refresh(key, sources).catch(() => []);
      const backgrounded = await runInBackground(task);
      if (!backgrounded) {
        const fresh = await task;
        return fresh.length > 0 ? fresh : cached.items;
      }
    }
    return cached.items;
  }

  return refresh(key, sources);
}
