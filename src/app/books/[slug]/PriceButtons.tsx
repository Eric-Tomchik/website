'use client';

import { ShoppingCart } from 'lucide-react';
import { useCheckout } from '@/components/checkout/CheckoutContext';
import { formatPrice, hasHardback, hasPaperback, hasDigital } from '@/lib/utils';
import type { CheckoutFormat } from '@/components/checkout/CheckoutContext';

interface PriceButtonsProps {
  bookId: string;
  bookTitle: string;
  bookDescription: string;
  bookFormat: string;
  priceCents: number;
  paperbackPriceCents?: number;
  digitalPriceCents?: number;
  coverImageUrl?: string;
  amazonUrl?: string;
}

export function PriceButtons({
  bookId,
  bookTitle,
  bookDescription,
  bookFormat,
  priceCents,
  paperbackPriceCents,
  digitalPriceCents,
  coverImageUrl,
  amazonUrl,
}: PriceButtonsProps) {
  const { openCheckout } = useCheckout();

  const handleBuy = (format: CheckoutFormat) => {
    openCheckout(
      {
        _id: bookId,
        title: bookTitle,
        description: bookDescription,
        price_cents: priceCents,
        paperback_price_cents: paperbackPriceCents,
        digital_price_cents: digitalPriceCents,
        cover_image_url: coverImageUrl,
      },
      format,
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {hasHardback(bookFormat) && (
        <button
          onClick={() => handleBuy('hardback')}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-surface-800/80 border border-surface-700 hover:border-brand-500/50
                     hover:bg-brand-600/10 transition-all duration-200 cursor-pointer"
        >
          <span className="text-2xl sm:text-3xl font-bold text-brand-400 group-hover:text-brand-300 transition-colors">
            {formatPrice(priceCents)}
          </span>
          <span className="text-xs font-semibold text-surface-400 px-2 py-1 rounded-md bg-surface-700/50 flex items-center gap-1.5">
            <ShoppingCart className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            Hardback
          </span>
        </button>
      )}
      {hasPaperback(bookFormat) && paperbackPriceCents && (
        <button
          onClick={() => handleBuy('paperback')}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-surface-800/80 border border-surface-700 hover:border-brand-500/50
                     hover:bg-brand-600/10 transition-all duration-200 cursor-pointer"
        >
          <span className="text-2xl sm:text-3xl font-bold text-brand-400 group-hover:text-brand-300 transition-colors">
            {formatPrice(paperbackPriceCents)}
          </span>
          <span className="text-xs font-semibold text-surface-400 px-2 py-1 rounded-md bg-surface-700/50 flex items-center gap-1.5">
            <ShoppingCart className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            Paperback
          </span>
        </button>
      )}
      {hasDigital(bookFormat) && (
        <button
          onClick={() => handleBuy('digital')}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-surface-800/80 border border-surface-700 hover:border-brand-500/50
                     hover:bg-brand-600/10 transition-all duration-200 cursor-pointer"
        >
          <span className="text-2xl sm:text-3xl font-bold text-brand-400 group-hover:text-brand-300 transition-colors">
            {formatPrice(digitalPriceCents || priceCents)}
          </span>
          <span className="text-xs font-semibold text-surface-400 px-2 py-1 rounded-md bg-surface-700/50 flex items-center gap-1.5">
            <ShoppingCart className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            Digital
          </span>
        </button>
      )}
    </div>
  );
}
