import { Metadata } from 'next';
import Link from 'next/link';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../../convex/_generated/api';
import { BookOpen, ArrowLeft, ShoppingCart, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { BookDetailActions } from './BookDetailActions';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await fetchQuery(api.books.getBySlug, { slug });
  if (!book) {
    return { title: 'Book Not Found' };
  }
  return {
    title: `${book.title} — ArcLight Press`,
    description: book.description,
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = await fetchQuery(api.books.getBySlug, { slug });

  if (!book) {
    return (
      <div className="py-16">
        <div className="section-container text-center">
          <BookOpen className="w-16 h-16 text-surface-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Book Not Found</h1>
          <p className="text-surface-400 mb-8">
            The book you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/books" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="section-container">
        {/* Back link */}
        <Link
          href="/books"
          className="inline-flex items-center text-surface-400 hover:text-brand-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to All Books
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Cover Image */}
          <div className="flex justify-center lg:sticky lg:top-24">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl blur-lg opacity-30" />
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-surface-800 bg-surface-800">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-16 h-16 text-surface-600" />
                  </div>
                )}
                {book.is_featured && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-brand-600 text-sm font-semibold text-white">
                    Featured
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                {book.title}
              </h1>
              <p className="text-lg text-surface-300">by Eric Tomchik</p>
            </div>

            {/* Price & Format */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-brand-400">
                {formatPrice(book.price_cents)}
              </span>
              <span className="text-sm text-surface-400 capitalize px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700">
                {book.book_format === 'both'
                  ? 'Digital + Physical'
                  : book.book_format}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">About This Book</h2>
              <div className="text-surface-300 leading-relaxed space-y-4">
                {(book.long_description || book.description)
                  .split('\n')
                  .filter((p: string) => p.trim())
                  .map((paragraph: string, i: number) => (
                    <p key={i}>{paragraph}</p>
                  ))}
              </div>
            </div>

            {/* Book metadata */}
            {(book.page_count || book.isbn || book.published_date) && (
              <div className="card p-6 space-y-3">
                <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">
                  Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {book.page_count && (
                    <div>
                      <div className="text-xs text-surface-500">Pages</div>
                      <div className="text-white font-medium">
                        {book.page_count}
                      </div>
                    </div>
                  )}
                  {book.isbn && (
                    <div>
                      <div className="text-xs text-surface-500">ISBN</div>
                      <div className="text-white font-medium">{book.isbn}</div>
                    </div>
                  )}
                  {book.published_date && (
                    <div>
                      <div className="text-xs text-surface-500">Published</div>
                      <div className="text-white font-medium">
                        {book.published_date}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-surface-500">Format</div>
                    <div className="text-white font-medium capitalize">
                      {book.book_format === 'both'
                        ? 'Digital & Physical'
                        : book.book_format}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Actions */}
            <BookDetailActions book={book} />
          </div>
        </div>
      </div>
    </div>
  );
}
