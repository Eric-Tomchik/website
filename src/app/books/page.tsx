import { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase/server';
import { BookCard } from '@/components/ui/BookCard';
import { BookOpen, Filter } from 'lucide-react';
import type { Book } from '@/types';

export const metadata: Metadata = {
  title: 'Books',
  description: 'Browse and purchase books by Eric Tomchik. Available in digital and physical formats.',
};

// For now, sample data — replace with Supabase query when DB is set up
const sampleBooks: Book[] = [
  {
    id: '1',
    title: 'Your Book Title Here',
    slug: 'your-book-title',
    description: 'A compelling description of your book that draws readers in and makes them want to learn more.',
    price_cents: 1499,
    format: 'both',
    cover_image_url: '/images/placeholder-book.png',
    amazon_url: 'https://amazon.com',
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default async function BooksPage({
  searchParams,
}: {
  searchParams: { format?: string };
}) {
  // When Supabase is connected, uncomment:
  // const supabase = createServerSupabase();
  // let query = supabase.from('books').select('*').eq('is_active', true).order('created_at', { ascending: false });
  // if (searchParams.format) query = query.eq('format', searchParams.format);
  // const { data: books } = await query;

  const books = sampleBooks; // placeholder

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
              !searchParams.format
                ? 'bg-brand-600 text-white'
                : 'glass text-surface-300 hover:text-white'
            }`}
          >
            All Books
          </a>
          <a
            href="/books?format=digital"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchParams.format === 'digital'
                ? 'bg-brand-600 text-white'
                : 'glass text-surface-300 hover:text-white'
            }`}
          >
            Digital
          </a>
          <a
            href="/books?format=physical"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchParams.format === 'physical'
                ? 'bg-brand-600 text-white'
                : 'glass text-surface-300 hover:text-white'
            }`}
          >
            Physical
          </a>
        </div>

        {/* Book grid */}
        {books.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
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
