'use client';

import { BookOpen, ShoppingCart, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

interface Book {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price_cents: number;
  book_format: 'physical' | 'digital' | 'both';
  cover_image_url?: string;
  amazon_url?: string;
  is_featured: boolean;
}

export function BookCard({ book }: { book: Book }) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async (format: 'physical' | 'digital') => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ book_id: book._id, format, quantity: 1 }],
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="card group flex flex-col">
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
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-sm text-surface-400 mb-4 line-clamp-2 flex-1">{book.description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-brand-400">
            {formatPrice(book.price_cents)}
          </span>
          <span className="text-xs text-surface-500 capitalize px-2 py-1 rounded bg-surface-800">
            {book.book_format === 'both' ? 'Digital + Physical' : book.book_format}
          </span>
        </div>

        <div className="flex gap-2">
          {(book.book_format === 'digital' || book.book_format === 'both') && (
            <button
              onClick={() => handleBuy('digital')}
              disabled={loading}
              className="btn-primary flex-1 text-sm py-2 disabled:opacity-50"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Digital
            </button>
          )}
          {(book.book_format === 'physical' || book.book_format === 'both') && (
            <button
              onClick={() => handleBuy('physical')}
              disabled={loading}
              className="btn-primary flex-1 text-sm py-2 disabled:opacity-50"
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
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
