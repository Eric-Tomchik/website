'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Download, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="card group">
      {/* Cover image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={book.cover_image_url || '/images/placeholder-book.png'}
          alt={book.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {book.is_featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-600 text-xs font-semibold text-white">
            Featured
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {(book.format === 'digital' || book.format === 'both') && (
            <div className="px-2 py-1 rounded-full bg-surface-900/80 backdrop-blur text-xs text-surface-300 flex items-center gap-1">
              <Download className="w-3 h-3" /> Digital
            </div>
          )}
          {(book.format === 'physical' || book.format === 'both') && (
            <div className="px-2 py-1 rounded-full bg-surface-900/80 backdrop-blur text-xs text-surface-300 flex items-center gap-1">
              <Truck className="w-3 h-3" /> Physical
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-2">
          {book.title}
        </h3>
        <p className="text-sm text-surface-400 line-clamp-2">{book.description}</p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-brand-400">
            {formatPrice(book.price_cents)}
          </span>
          <Link
            href={`/books/${book.slug}`}
            className="btn-primary text-sm py-2 px-4"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
