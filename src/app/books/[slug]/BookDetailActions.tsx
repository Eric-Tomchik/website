'use client';

import { ShoppingCart, ExternalLink } from 'lucide-react';
import { useCheckout } from '@/components/checkout/CheckoutContext';

interface Book {
  _id: string;
  title: string;
  description: string;
  price_cents: number;
  book_format: 'physical' | 'digital' | 'both';
  cover_image_url?: string;
  amazon_url?: string;
}

export function BookDetailActions({ book }: { book: Book }) {
  const { openCheckout } = useCheckout();

  const handleBuy = (format: 'physical' | 'digital') => {
    openCheckout(
      {
        _id: book._id,
        title: book.title,
        description: book.description,
        price_cents: book.price_cents,
        cover_image_url: book.cover_image_url,
      },
      format
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {(book.book_format === 'digital' || book.book_format === 'both') && (
          <button
            onClick={() => handleBuy('digital')}
            className="btn-primary text-base py-3 px-8"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy Digital
          </button>
        )}
        {(book.book_format === 'physical' || book.book_format === 'both') && (
          <button
            onClick={() => handleBuy('physical')}
            className="btn-primary text-base py-3 px-8"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy Physical
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
