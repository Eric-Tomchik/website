import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../convex/_generated/api';
import { PenLine, ArrowRight, Clock, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on business credit, web development, cybersecurity, AI, and technology — by Eric Tomchik.',
  openGraph: {
    title: 'Blog — Eric Tomchik',
    description:
      'Insights on business credit, web development, cybersecurity, AI, and technology.',
    url: 'https://erictomchik.com/blog',
  },
};

export const revalidate = 60;

const categoryLabels: Record<string, string> = {
  'business-credit': 'Business Credit',
  'web-development': 'Web Development',
  technology: 'Technology',
  cybersecurity: 'Cybersecurity',
  ai: 'AI',
  general: 'General',
};

const categoryColors: Record<string, string> = {
  'business-credit': 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
  'web-development': 'bg-brand-600/20 text-brand-400 border-brand-600/30',
  technology: 'bg-violet-600/20 text-violet-400 border-violet-600/30',
  cybersecurity: 'bg-red-600/20 text-red-400 border-red-600/30',
  ai: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  general: 'bg-surface-600/20 text-surface-400 border-surface-600/30',
};

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof fetchQuery<typeof api.blogPosts.listPublished>>> = [];
  try {
    posts = await fetchQuery(api.blogPosts.listPublished, {});
  } catch {
    // Graceful fallback if Convex is unavailable
  }

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

        {/* Posts grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
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
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColors[post.category] || categoryColors.general}`}
                    >
                      {categoryLabels[post.category] || post.category}
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
                  {post.published_at && (
                    <div className="mt-4 pt-4 border-t border-surface-800/50 flex items-center justify-between">
                      <span className="text-xs text-surface-500">
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-brand-400 text-xs font-medium flex items-center gap-1">
                        Read more <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center mx-auto mb-6">
              <PenLine className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Coming Soon</h2>
            <p className="text-surface-400 max-w-md mx-auto mb-6">
              I&apos;m working on in-depth articles about business credit, web
              development, and technology. Subscribe below to get notified when the
              first posts go live.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <span
                  key={key}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border ${categoryColors[key]}`}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
