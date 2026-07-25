import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../../convex/_generated/api';
import { BookOpen, ArrowLeft, ExternalLink } from 'lucide-react';
import { escapeHtml } from '@/lib/sanitize';
import { PriceButtons } from './PriceButtons';
import { formatPrice, hasHardback, hasPaperback, hasDigital } from '@/lib/utils';
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

  // Structured data for SEO (Book + Product schema)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: 'Eric Tomchik' },
    description: book.long_description || book.description,
    ...(book.isbn ? { isbn: book.isbn } : {}),
    ...(book.page_count ? { numberOfPages: book.page_count } : {}),
    ...(book.published_date ? { datePublished: book.published_date } : {}),
    ...(book.cover_image_url ? { image: book.cover_image_url } : {}),
    publisher: { '@type': 'Organization', name: 'ArcLight Press' },
    url: `https://erictomchik.com/books/${book.slug}`,
    offers: [
      ...(hasHardback(book.book_format)
        ? [{
            '@type': 'Offer',
            price: (book.price_cents / 100).toFixed(2),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            description: 'Hardback Edition',
          }]
        : []),
      ...(hasPaperback(book.book_format) && book.paperback_price_cents
        ? [{
            '@type': 'Offer',
            price: (book.paperback_price_cents / 100).toFixed(2),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            description: 'Paperback Edition',
          }]
        : []),
      ...(hasDigital(book.book_format)
        ? [{
            '@type': 'Offer',
            price: ((book.digital_price_cents || book.price_cents) / 100).toFixed(2),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            description: 'Digital Edition',
          }]
        : []),
    ],
  };

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

            {/* Format & Price Info */}
            <PriceButtons
              bookFormat={book.book_format}
              priceCents={book.price_cents}
              paperbackPriceCents={book.paperback_price_cents}
              digitalPriceCents={book.digital_price_cents}
            />

            {/* Retailer Purchase Links */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
