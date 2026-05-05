import { Metadata } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../convex/_generated/api';
import { BookCard } from '@/components/ui/BookCard';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Books',
  description: 'Browse and purchase books by Eric Tomchik. Available in digital and physical formats.',
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: { book_format?: string };
}) {
  const books = await fetchQuery(api.books.list, {
    activeOnly: true,
    format: searchParams.book_format || undefined,
  });

  return (
    <div className="py-16">
      <div className="section-container">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400">
            <BookOpen className="w-4 h-4" />
            Bookshop
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            My <span className="gradient-text">Books</span>
          </h1>
          <p className="text-surface-400 max-w-xl mx-auto">
            Available in digital download and signed physical copies shipped directly from the author.
          </p>
        </div>

        {/* Format filter */}
        <div className="flex justify-center gap-3 mb-12">
          <a
            href="/books"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !searchParams.book_format
                ? 'bg-brand-600 text-white'
                : 'glass text-surface-300 hover:text-white'
            }`}
          >
            All Books
          </a>
          <a
            href="/books?book_format=digital"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchParams.book_format === 'digital'
                ? 'bg-brand-600 text-white'
                : 'glass text-surface-300 hover:text-white'
            }`}
          >
            Digital
          </a>
          <a
            href="/books?book_format=physical"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchParams.book_format === 'physical'
                ? 'bg-brand-600 text-white'
                : 'glass text-surface-300 hover:text-white'
            }`}
          >
            Physical
          </a>
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
