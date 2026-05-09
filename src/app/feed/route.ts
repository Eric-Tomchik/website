import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../convex/_generated/api';

export const revalidate = 3600; // Revalidate every hour

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const categoryLabels: Record<string, string> = {
  'business-credit': 'Business Credit',
  'web-development': 'Web Development',
  technology: 'Technology',
  cybersecurity: 'Cybersecurity',
  ai: 'AI',
  general: 'General',
};

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erictomchik.com';

  let posts: Awaited<ReturnType<typeof fetchQuery<typeof api.blogPosts.listPublished>>> = [];
  try {
    posts = await fetchQuery(api.blogPosts.listPublished, {});
  } catch {
    // Return empty feed if Convex is unavailable
  }

  const lastBuildDate = posts.length > 0 && posts[0].published_at
    ? new Date(posts[0].published_at).toUTCString()
    : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const pubDate = post.published_at
        ? new Date(post.published_at).toUTCString()
        : new Date().toUTCString();
      const category = categoryLabels[post.category] || post.category;

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${escapeXml(post.slug)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(category)}</category>
      <pubDate>${pubDate}</pubDate>
      <author>eric@erictomchik.com (Eric Tomchik)</author>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Eric Tomchik — Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Insights on business credit, web development, cybersecurity, AI, and technology — by Eric Tomchik.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/feed" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/et-monogram.webp</url>
      <title>Eric Tomchik — Blog</title>
      <link>${siteUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
