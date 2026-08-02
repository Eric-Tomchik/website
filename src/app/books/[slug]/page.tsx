import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../../convex/_generated/api';
import { BookOpen, ArrowLeft, ExternalLink } from 'lucide-react';
import { escapeHtml } from '@/lib/sanitize';
import { hasHardback, hasPaperback, hasDigital, withAmazonTag } from '@/lib/utils';
import { BookDetailActions } from './BookDetailActions';
import { BookPreviewButton } from '@/components/ui/BookPreview';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

// Revalidate every 60s — pages are cached and served instantly from edge
export const revalidate = 60;

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
    openGraph: {
      title: book.title,
      description: book.description,
      type: 'book',
      ...(book.cover_image_url ? { images: [book.cover_image_url] } : {}),
      url: `https://erictomchik.com/books/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: book.title,
      description: book.description,
      ...(book.cover_image_url ? { images: [book.cover_image_url] } : {}),
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const [book, allBooks] = await Promise.all([
    fetchQuery(api.books.getBySlug, { slug }),
    fetchQuery(api.books.list, { activeOnly: true }),
  ]);

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

  // Build the primary price for schema offers
  const priceCents = hasPaperback(book.book_format) && book.paperback_price_cents
    ? book.paperback_price_cents
    : book.price_cents;
  const priceStr = (priceCents / 100).toFixed(2);

  // Book format label for schema
  const bookFormatSchema = hasHardback(book.book_format)
    ? 'https://schema.org/Hardcover'
    : hasPaperback(book.book_format)
      ? 'https://schema.org/Paperback'
      : hasDigital(book.book_format)
        ? 'https://schema.org/EBook'
        : undefined;

  // Structured data for SEO (Book schema with Offers for rich snippets)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: 'Eric Tomchik' },
    description: book.long_description || book.description,
    inLanguage: 'en',
    ...(book.isbn ? { isbn: book.isbn } : {}),
    ...(book.page_count ? { numberOfPages: book.page_count } : {}),
    ...(book.published_date ? { datePublished: book.published_date } : {}),
    ...(book.cover_image_url ? { image: book.cover_image_url } : {}),
    ...(bookFormatSchema ? { bookFormat: bookFormatSchema } : {}),
    publisher: { '@type': 'Organization', name: 'ArcLight Press' },
    url: `https://erictomchik.com/books/${book.slug}`,
    ...(book.amazon_url || book.barnes_noble_url ? {
      offers: {
        '@type': 'Offer',
        price: priceStr,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        ...(book.amazon_url ? { url: book.amazon_url } : book.barnes_noble_url ? { url: book.barnes_noble_url } : {}),
        seller: {
          '@type': 'Organization',
          name: book.amazon_url ? 'Amazon' : 'Barnes & Noble',
        },
      },
    } : {}),
    ...(book.amazon_url ? {
      sameAs: [book.amazon_url, ...(book.barnes_noble_url ? [book.barnes_noble_url] : [])],
    } : book.barnes_noble_url ? { sameAs: [book.barnes_noble_url] } : {}),
  };

  // "You May Also Like" — other books, excluding current, shuffled, max 4
  const otherBooks = allBooks
    .filter((b) => b._id !== book._id && b.cover_image_url)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  // Recommended products (admin-managed external affiliate products)
  const recommendedProducts = (book as Record<string, unknown>).recommended_products as
    | { title: string; url: string; image_url?: string; price?: string }[]
    | undefined;

  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
                  <Image
                    src={book.cover_image_url}
                    alt={`Cover of ${book.title} by Eric Tomchik`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 448px"
                    className="object-cover"
                    priority
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

            {/* Purchase — retailer links only */}
            <BookDetailActions book={book} />

            {/* Look Inside Preview */}
            {book.preview_pdf_url && (
              <div className="py-2">
                <BookPreviewButton
                  previewUrl={book.preview_pdf_url}
                  bookTitle={book.title}
                />
              </div>
            )}

            {/* Online Companion */}
            {book.companion_url && (
              <div className="card p-6 border-brand-500/30 bg-brand-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-500/10">
                    <ExternalLink className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Online Companion</h3>
                    <p className="text-sm text-surface-400">Free resources for book owners</p>
                  </div>
                </div>
                <p className="text-sm text-surface-300 mb-4">
                  Access interactive flashcards, practice quizzes, quick reference cards, lab setup guides, and more.
                </p>
                <a
                  href={book.companion_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-medium
                             bg-brand-600 hover:bg-brand-500 text-white
                             transition-all duration-200 shadow-lg shadow-brand-600/20
                             hover:shadow-brand-500/30 active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Companion Site
                </a>
              </div>
            )}

            {/* Description */}
            <ScrollReveal animation="fade-up">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">About This Book</h2>
              <div
                className="text-surface-300 leading-relaxed space-y-4 prose-book"
                dangerouslySetInnerHTML={{
                  __html: (book.long_description || book.description)
                    .split('\n')
                    .filter((p: string) => p.trim())
                    .map((paragraph: string) => `<p>${escapeHtml(paragraph)}</p>`)
                    .join(''),
                }}
              />
            </div>

            </ScrollReveal>

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
                    <div className="text-white font-medium">
                      {[
                        hasHardback(book.book_format) && 'Hardback',
                        hasPaperback(book.book_format) && 'Paperback',
                        hasDigital(book.book_format) && 'Digital',
                      ].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Products (affiliate) */}
            {recommendedProducts && recommendedProducts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Readers Also Recommend</h2>
                <p className="text-xs text-surface-500">
                  Affiliate links &mdash; as an Amazon Associate, Eric Tomchik earns from
                  qualifying purchases.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendedProducts.map((product, i) => (
                    <a
                      key={i}
                      href={withAmazonTag(product.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card p-4 flex items-center gap-4 group hover:border-[#FF9900]/40 transition-colors"
                    >
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-16 h-16 object-contain rounded flex-shrink-0 bg-white p-1"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-[#FF9900] transition-colors line-clamp-2">
                          {product.title}
                        </p>
                        {product.price && (
                          <p className="text-xs text-surface-400 mt-1">{product.price}</p>
                        )}
                        <p className="text-xs text-[#FF9900] mt-1 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          View on Amazon
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* You May Also Like */}
        {otherBooks.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {otherBooks.map((other) => (
                <Link
                  key={other._id}
                  href={`/books/${other.slug}`}
                  className="card group flex flex-col cursor-pointer
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  <div className="relative aspect-[3/4] bg-surface-900 overflow-hidden flex items-center justify-center p-2 sm:p-4">
                    {other.cover_image_url ? (
                      <Image
                        src={other.cover_image_url}
                        alt={`Cover of ${other.title}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-lg p-2 sm:p-4"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="w-12 h-12 text-surface-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-5">
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 group-hover:text-brand-400 transition-colors">
                      {other.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
