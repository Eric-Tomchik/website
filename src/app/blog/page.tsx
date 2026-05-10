import { Metadata } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../convex/_generated/api';
import { PenLine } from 'lucide-react';
import { BlogTabs } from '@/components/ui/BlogTabs';
import { fetchAllFeeds, FEED_SOURCES } from '@/lib/rss';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on business credit, web development, cybersecurity, AI, and technology — plus curated industry news. By Eric Tomchik.',
  openGraph: {
    title: 'Blog — Eric Tomchik',
    description:
      'Insights on business credit, web development, cybersecurity, AI, and technology.',
    url: 'https://erictomchik.com/blog',
  },
  alternates: {
    canonical: 'https://erictomchik.com/blog',
  },
};

export const revalidate = 3600;

export default async function BlogPage() {
  const [posts, newsItems] = await Promise.all([
    fetchQuery(api.blogPosts.listPublished, {}).catch(() => []),
    fetchAllFeeds(FEED_SOURCES).catch(() => []),
  ]);

  return (
    <div className="py-16">
      <div className="section-container">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400 mb-6">
            <PenLine className="w-4 h-4" />
            Blog
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Insights & <span className="gradient-text">Articles</span>
          </h1>
          <p className="text-surface-400 max-w-2xl mx-auto">
            Practical guides and deep dives on business credit, web development,
            cybersecurity, AI, and the technology that powers modern businesses.
          </p>
        </div>

        {/* Tabbed content with filtering + search */}
        <BlogTabs posts={posts} newsItems={newsItems} />
      </div>
    </div>
  );
}
