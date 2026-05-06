'use client';

import Link from 'next/link';
import { BookOpen, ShoppingCart, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCheckout } from '@/components/checkout/CheckoutContext';

interface Book {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price_cents: number;
  digital_price_cents?: number;
  book_format: 'physical' | 'digital' | 'both';
  cover_image_url?: string;
  amazon_url?: string;
  is_featured: boolean;
}

export function BookCard({ book }: { book: Book }) {
  const { openCheckout } = useCheckout();

  const handleBuy = (e: React.MouseEvent, format: 'physical' | 'digital') => {
    e.preventDefault();
    e.stopPropagation();
    openCheckout(
      {
        _id: book._id,
        title: book.title,
        description: book.description,
        price_cents: book.price_cents,
        digital_price_cents: book.digital_price_cents,
        cover_image_url: book.cover_image_url,
      },
      format
    );
  };

  return (
    <Link href={`/books/${book.slug}`} className="card group flex flex-col cursor-pointer">
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-surface-800 overflow-hidden">
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-brand-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-surface-400 mb-4 line-clamp-2 flex-1">{book.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {book.book_format === 'both' && book.digital_price_cents ? (
              <>
                <span className="text-lg font-bold text-brand-400">
                  {formatPrice(book.digital_price_cents)}
                </span>
                <span className="text-surface-600">·</span>
                <span className="text-lg font-bold text-brand-400">
                  {formatPrice(book.price_cents)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-brand-400">
                {formatPrice(book.book_format === 'digital' && book.digital_price_cents ? book.digital_price_cents : book.price_cents)}
              </span>
            )}
          </div>
          <span className="text-xs text-surface-500 capitalize px-2 py-1 rounded bg-surface-800">
            {book.book_format === 'both' ? 'Digital + Physical' : book.book_format}
          </span>
        </div>

        <div className="flex gap-2">
          {(book.book_format === 'digital' || book.book_format === 'both') && (
            <button
              onClick={(e) => handleBuy(e, 'digital')}
              className="btn-primary flex-1 text-sm py-2"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Digital
            </button>
          )}
          {(book.book_format === 'physical' || book.book_format === 'both') && (
            <button
              onClick={(e) => handleBuy(e, 'physical')}
              className="btn-primary flex-1 text-sm py-2"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Physical
            </button>
          )}
          {book.amazon_url && (
            <a
              href={book.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm py-2 px-3"
              title="View on Amazon"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
