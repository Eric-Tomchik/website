import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../../convex/_generated/api';
import { ArrowLeft, Clock, Calendar, PenLine } from 'lucide-react';
import { marked, Renderer } from 'marked';
import { sanitizeHtml } from '@/lib/sanitize';
import { TableOfContents } from '@/components/ui/TableOfContents';
import { BlogNewsletterCTA } from '@/components/ui/BlogNewsletterCTA';

// Configure marked: external links in new tab + heading IDs for TOC
const renderer = new Renderer();
renderer.link = ({ href, text }: { href: string; text: string }) => {
  const isExternal = href.startsWith('http');
  const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${href}"${attrs}>${text}</a>`;
};
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const id = text
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};
marked.use({ renderer });

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

const categoryLabels: Record<string, string> = {
  'business-credit': 'Business Credit',
  'web-development': 'Web Development',
  technology: 'Technology',
  cybersecurity: 'Cybersecurity',
  ai: 'AI',
  general: 'General',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchQuery(api.blogPosts.getBySlug, { slug });
  if (!post) {
    return { title: 'Post Not Found' };
  }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://erictomchik.com/blog/${slug}`,
      ...(post.cover_image_url ? { images: [post.cover_image_url] } : {}),
      authors: ['Eric Tomchik'],
      ...(post.published_at
        ? { publishedTime: new Date(post.published_at).toISOString() }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      ...(post.cover_image_url ? { images: [post.cover_image_url] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchQuery(api.blogPosts.getBySlug, { slug });

  if (!post || !post.is_published) {
    return (
      <div className="py-16">
        <div className="section-container text-center">
          <PenLine className="w-16 h-16 text-surface-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-surface-400 mb-8">
            The article you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/blog" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Article structured data
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Person', name: 'Eric Tomchik' },
    publisher: { '@type': 'Organization', name: 'Eric Tomchik' },
    url: `https://erictomchik.com/blog/${post.slug}`,
    ...(post.cover_image_url ? { image: post.cover_image_url } : {}),
    ...(post.published_at
      ? { datePublished: new Date(post.published_at).toISOString() }
      : {}),
    articleSection: categoryLabels[post.category] || post.category,
  };

  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="section-container">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-surface-400 hover:text-brand-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        {/* Header */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-brand-600/20 text-brand-400 border-brand-600/30">
              {categoryLabels[post.category] || post.category}
            </span>
            {post.reading_time_minutes && (
              <span className="flex items-center gap-1 text-xs text-surface-500">
                <Clock className="w-3 h-3" />
                {post.reading_time_minutes} min read
              </span>
            )}
            {post.published_at && (
              <span className="flex items-center gap-1 text-xs text-surface-500">
                <Calendar className="w-3 h-3" />
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-surface-300 mb-2">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3 text-sm text-surface-400 mb-8">
            <span>By Eric Tomchik</span>
          </div>
        </div>

        {/* Cover image */}
        {post.cover_image_url && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden border border-surface-800">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          {/* Table of Contents */}
          <TableOfContents content={post.content} />

          <div
            className="blog-content"
            dangerouslySetInnerHTML={{
              __html: (() => {
                // Strip leading h1 since we already render post.title above
                let content = post.content;
                const h1Match = content.match(/^# .+\n+/);
                if (h1Match) content = content.slice(h1Match[0].length);
                return sanitizeHtml(marked.parse(content, { async: false }) as string);
              })(),
            }}
          />

          {/* Newsletter CTA */}
          <BlogNewsletterCTA />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-surface-800/50">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-surface-800 text-surface-400 border border-surface-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
