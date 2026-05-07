'use client';

import { ShoppingCart, ExternalLink } from 'lucide-react';
import { useCheckout } from '@/components/checkout/CheckoutContext';
import { formatPrice, hasHardback, hasPaperback, hasDigital } from '@/lib/utils';
import type { CheckoutFormat } from '@/components/checkout/CheckoutContext';

interface Book {
  _id: string;
  title: string;
  description: string;
  price_cents: number;
  paperback_price_cents?: number;
  digital_price_cents?: number;
  book_format: string;
  cover_image_url?: string;
  amazon_url?: string;
}

export function BookDetailActions({ book }: { book: Book }) {
  const { openCheckout } = useCheckout();

  const handleBuy = (format: CheckoutFormat) => {
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
      format
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {hasDigital(book.book_format) && (
          <button
            onClick={() => handleBuy('digital')}
            className="btn-primary text-base py-3 px-8"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy Digital — {formatPrice(book.digital_price_cents || book.price_cents)}
          </button>
        )}
        {hasPaperback(book.book_format) && book.paperback_price_cents && (
          <button
            onClick={() => handleBuy('paperback')}
            className="btn-primary text-base py-3 px-8"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy Paperback — {formatPrice(book.paperback_price_cents)}
          </button>
        )}
        {hasHardback(book.book_format) && (
          <button
            onClick={() => handleBuy('hardback')}
            className="btn-primary text-base py-3 px-8"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy Hardback — {formatPrice(book.price_cents)}
          </button>
        )}
        {book.amazon_url && (
          <a
            href={book.amazon_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-base py-3 px-8"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Amazon
          </a>
        )}
      </div>
    </div>
  );
}
