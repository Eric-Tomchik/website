import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const convex = getConvexClient();

    const [posts, books, projects] = await Promise.all([
      convex.query(api.blogPosts.listPublished, {}).catch(() => []),
      convex.query(api.books.list, { activeOnly: true }).catch(() => []),
      convex.query(api.portfolio.list, { activeOnly: true }).catch(() => []),
    ]);

    type SearchItem = { title: string; description: string; href: string; type: 'blog' | 'book' | 'portfolio' };
    const items: SearchItem[] = [];

    // Blog posts
    for (const post of posts) {
      items.push({
        title: post.title,
        description: post.excerpt || '',
        href: `/blog/${post.slug}`,
        type: 'blog',
      });
    }

    // Books
    for (const book of books) {
      items.push({
        title: book.title,
        description: book.description || '',
        href: `/books/${book.slug}`,
        type: 'book',
      });
    }

    // Portfolio
    for (const project of projects) {
      items.push({
        title: project.title,
        description: project.description || '',
        href: project.live_url || '/portfolio',
        type: 'portfolio',
      });
    }

    return NextResponse.json({ items }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (err) {
    console.error('Search index error:', err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
