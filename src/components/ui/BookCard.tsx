'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ExternalLink } from 'lucide-react';
import { withAmazonTag } from '@/lib/utils';

interface Book {
  _id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url?: string;
  amazon_url?: string;
  barnes_noble_url?: string;
  is_featured: boolean;
}

export function BookCard({ book }: { book: Book }) {
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

        {/* Retailer availability */}
        {(book.amazon_url || book.barnes_noble_url) && (
          <div className="flex flex-col sm:flex-row gap-1.5 mt-auto">
            {book.amazon_url && (
              <a
                href={withAmazonTag(book.amazon_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium
                           bg-[#FF9900] hover:bg-[#FFa31a] text-black
                           transition-all duration-200 flex-1"
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
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium
                           bg-[#2D5F2E] hover:bg-[#3a7a3b] text-white
                           transition-all duration-200 flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 shrink-0" />
                B&N
              </a>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
