'use client';

import { ExternalLink } from 'lucide-react';
import { withAmazonTag } from '@/lib/utils';

interface Book {
  _id: string;
  title: string;
  amazon_url?: string;
  barnes_noble_url?: string;
}

export function BookDetailActions({ book }: { book: Book }) {
  const hasExternalLinks = book.amazon_url || book.barnes_noble_url;

  if (!hasExternalLinks) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">
        Available On
      </h3>
      <div className="flex flex-wrap gap-3">
        {book.amazon_url && (
          <a
            href={withAmazonTag(book.amazon_url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'amazon_click', {
                  book_title: book.title,
                  outbound_url: book.amazon_url,
                });
              }
            }}
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base font-medium
                       bg-[#FF9900] hover:bg-[#FFa31a] text-black
                       transition-all duration-200 shadow-lg shadow-[#FF9900]/20
                       hover:shadow-[#FF9900]/30 active:scale-[0.98]"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.045 18.02c.072-.116.187-.124.348-.064 2.62 1.413 5.528 2.12 8.724 2.12 2.46 0 4.876-.504 7.248-1.512.18-.08.36-.156.54-.228.244-.1.428-.05.552.15.124.2.064.376-.18.528-2.384 1.52-5.088 2.28-8.112 2.28-3.42 0-6.444-.872-9.072-2.616-.108-.068-.132-.16-.048-.276zM22.14 16.074c-.192-.236-.508-.28-.872-.132-1.152.468-2.28.702-3.384.702-.572 0-1.14-.064-1.704-.192-.564-.128-.96-.356-1.188-.684-.128-.176-.1-.32.084-.432.564-.364 1.416-.556 2.556-.576 1.176-.012 2.228.164 3.156.528.14.056.256.056.348 0 .092-.056.12-.14.084-.252l-.24-.576c-.06-.14-.176-.196-.348-.168-1.092.164-2.16.176-3.204.036-1.044-.14-1.844-.448-2.4-.924-.18-.156-.216-.328-.108-.516.108-.188.3-.22.576-.096.852.38 1.716.644 2.592.792.876.148 1.692.148 2.448 0 .196-.04.332.008.408.144.076.136.036.268-.12.396-.468.38-.576.804-.324 1.272.3.564 1.044.772 1.728.624l.312-.068c.1-.02.176.02.228.12.052.1.02.188-.096.264-.72.46-1.572.636-2.556.528z"/>
              <path d="M14.4 2.82c0-.66.24-1.23.72-1.71s1.05-.72 1.71-.72c.66 0 1.23.24 1.71.72s.72 1.05.72 1.71-.24 1.23-.72 1.71-1.05.72-1.71.72c-.66 0-1.23-.24-1.71-.72S14.4 3.48 14.4 2.82z"/>
            </svg>
            Buy on Amazon
          </a>
        )}
        {book.barnes_noble_url && (
          <a
            href={book.barnes_noble_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'bn_click', {
                  book_title: book.title,
                  outbound_url: book.barnes_noble_url,
                });
              }
            }}
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base font-medium
                       bg-[#2D5F2E] hover:bg-[#3a7a3b] text-white
                       transition-all duration-200 shadow-lg shadow-[#2D5F2E]/20
                       hover:shadow-[#2D5F2E]/30 active:scale-[0.98]"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Buy on Barnes &amp; Noble
          </a>
        )}
      </div>
    </div>
  );
}
