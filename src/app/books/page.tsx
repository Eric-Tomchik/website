import { Metadata } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../convex/_generated/api';
import { BookCard } from '@/components/ui/BookCard';
import { BookOpen } from 'lucide-react';

// Revalidate every 60s — pages are cached and served instantly from edge
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ArcLight Press — Books',
  description: 'Browse and purchase books from ArcLight Press by Eric Tomchik. Available in hardcover.',
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ book_format?: string }>;
}) {
  const { book_format } = await searchParams;
  const books = await fetchQuery(api.books.list, {
    activeOnly: true,
    format: book_format || undefined,
  });

  return (
    <div className="py-16">
      <div className="section-container">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex justify-center">
            <img
              src="/arclight-press-logo.png"
              alt="ArcLight Press"
              className="h-32 sm:h-40 w-auto"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold">
              <span className="gradient-text">ArcLight Press</span>
            </h1>
            <p className="text-surface-400 max-w-xl mx-auto">
              Premium hardcover editions by Eric Tomchik. Shipped directly from the author.
            </p>
          </div>
        </div>

        {/* Book grid */}
        {books && books.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400">No books found. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
