'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ShoppingCart, ExternalLink } from 'lucide-react';
import { formatPrice, hasHardback, hasPaperback, hasDigital } from '@/lib/utils';
import { useCheckout } from '@/components/checkout/CheckoutContext';

interface Book {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price_cents: number;
  paperback_price_cents?: number;
  digital_price_cents?: number;
  book_format: string;
  cover_image_url?: string;
  amazon_url?: string;
  barnes_noble_url?: string;
  is_featured: boolean;
}

export function BookCard({ book }: { book: Book }) {
  const { openCheckout } = useCheckout();

  const handleBuy = (e: React.MouseEvent, format: 'paperback' | 'hardback' | 'digital') => {
    e.preventDefault();
    e.stopPropagation();
    openCheckout(
      {
        _id: book._id,
        title: book.title,
        description: book.description,
        price_cents: book.price_cents,
        paperback_price_cents: book.paperback_price_cents,
        digital_price_cents: book.digital_price_cents,
        cover_image_url: book.cover_image_url,
      },
      format,
    );
  };

  const showHardback = hasHardback(book.book_format);
  const showPaperback = hasPaperback(book.book_format);
  const showDigital = hasDigital(book.book_format);

  return (
    <Link href={`/books/${book.slug}`} className="card group flex flex-col cursor-pointer
           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950">
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-surface-900 overflow-hidden flex items-center justify-center p-2 sm:p-4">
        {book.cover_image_url ? (
          <Image
            src={book.cover_image_url}
            alt={`Cover of ${book.title} by Eric Tomchik`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-lg p-2 sm:p-4"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="w-12 h-12 text-surface-600" />
          </div>
        )}
        {book.is_featured && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-brand-600 text-xs font-semibold text-white">
            Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <h3 className="text-sm sm:text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-brand-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs sm:text-sm text-surface-400 mb-3 sm:mb-4 line-clamp-2 flex-1 hidden sm:block">{book.description}</p>

        {/* Price rows — price left, buy button flush right, all same width */}
        <div className="flex flex-col gap-1.5">
          {showDigital && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-lg font-bold text-brand-400">
                {formatPrice(book.digital_price_cents ?? book.price_cents)}
              </span>
              <button
                onClick={(e) => handleBuy(e, 'digital')}
                className="btn-primary text-xs py-1.5 w-[5.5rem] sm:w-28 text-center shrink-0"
              >
                <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline shrink-0" />
                Digital
              </button>
            </div>
          )}
          {showPaperback && book.paperback_price_cents ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-lg font-bold text-brand-400">
                {formatPrice(book.paperback_price_cents)}
              </span>
              <button
                onClick={(e) => handleBuy(e, 'paperback')}
                className="btn-primary text-xs py-1.5 w-[5.5rem] sm:w-28 text-center shrink-0"
              >
                <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline shrink-0" />
                Paperback
              </button>
            </div>
          ) : null}
          {showHardback && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-lg font-bold text-brand-400">
                {formatPrice(book.price_cents)}
              </span>
              <button
                onClick={(e) => handleBuy(e, 'hardback')}
                className="btn-primary text-xs py-1.5 w-[5.5rem] sm:w-28 text-center shrink-0"
              >
                <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline shrink-0" />
                Hardback
              </button>
            </div>
          )}
          {/* Fallback: digital-only without digital_price_cents */}
          {showDigital && !showHardback && !showPaperback && !book.digital_price_cents && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-lg font-bold text-brand-400">
                {formatPrice(book.price_cents)}
              </span>
            </div>
          )}
          {(book.amazon_url || book.barnes_noble_url) && (
            <div className="flex flex-col sm:flex-row gap-1.5 mt-0.5">
              {book.amazon_url && (
                <a
                  href={book.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 flex items-center justify-center flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 shrink-0" />
                  Amazon
                </a>
              )}
              {book.barnes_noble_url && (
                <a
                  href={book.barnes_noble_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 flex items-center justify-center flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 shrink-0" />
                  B&N
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
