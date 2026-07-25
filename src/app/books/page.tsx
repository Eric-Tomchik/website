import { Metadata } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../convex/_generated/api';
import { BookCard } from '@/components/ui/BookCard';
import { BookComparisonTable } from '@/components/ui/BookComparisonTable';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { BookOpen } from 'lucide-react';

// Revalidate every 60s — pages are cached and served instantly from edge
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ArcLight Press — Books',
  description: 'Browse and purchase books from ArcLight Press by Eric Tomchik. Business credit, cybersecurity, AI, POS systems, and more.',
  openGraph: {
    title: 'ArcLight Press — Books by Eric Tomchik',
    description: 'Browse and purchase books on business credit, cybersecurity, AI, POS systems, and more.',
    url: 'https://erictomchik.com/books',
    images: [{ url: '/og-image.webp', width: 1200, height: 630, alt: 'ArcLight Press Books' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArcLight Press — Books by Eric Tomchik',
    description: 'Browse and purchase books on business credit, cybersecurity, AI, POS systems, and more.',
    images: ['/og-image.webp'],
  },
  alternates: {
    canonical: 'https://erictomchik.com/books',
  },
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

  // ItemList structured data for the book catalog
  const booksJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ArcLight Press — Books by Eric Tomchik',
    url: 'https://erictomchik.com/books',
    numberOfItems: books.length,
    itemListElement: books.map((book, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Book',
        name: book.title,
        url: `https://erictomchik.com/books/${book.slug}`,
        author: { '@type': 'Person', name: 'Eric Tomchik' },
        ...(book.description ? { description: book.description } : {}),
        ...(book.cover_image_url
          ? { image: book.cover_image_url.startsWith('/') ? `https://erictomchik.com${book.cover_image_url}` : book.cover_image_url }
          : {}),
        offers: {
          '@type': 'Offer',
          price: (book.price_cents / 100).toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `https://erictomchik.com/books/${book.slug}`,
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(booksJsonLd) }}
      />
    <div className="py-16">
      <div className="section-container">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex justify-center">
            <img
              src="/arclight-press-logo.webp"
              alt="ArcLight Press"
              className="h-32 sm:h-40 w-auto"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold">
              <span className="gradient-text">ArcLight Press</span>
            </h1>
            <p className="text-surface-400 max-w-xl mx-auto">
              Books by Eric Tomchik. Available on Amazon and Barnes &amp; Noble.
            </p>
          </div>
        </div>

        {/* Book grid */}
        {books && books.length > 0 ? (
          <ScrollReveal animation="fade-up">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
          </ScrollReveal>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400">No books found. Check back soon!</p>
          </div>
        )}

        {/* Book Comparison Table */}
        <div className="mt-20">
          <BookComparisonTable />
        </div>
      </div>
    </div>
    </>
  );
}
