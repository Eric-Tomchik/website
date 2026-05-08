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
    <div className="flex flex-wrap gap-3">
      {hasHardback(bookFormat) && (
        <button
          onClick={() => handleBuy('hardback')}
          className="btn-primary text-base py-3 px-6"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy Hardback — {formatPrice(priceCents)}
        </button>
      )}
      {hasPaperback(bookFormat) && paperbackPriceCents && (
        <button
          onClick={() => handleBuy('paperback')}
          className="btn-primary text-base py-3 px-6"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy Paperback — {formatPrice(paperbackPriceCents)}
        </button>
      )}
      {hasDigital(bookFormat) && (
        <button
          onClick={() => handleBuy('digital')}
          className="btn-primary text-base py-3 px-6"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy Digital — {formatPrice(digitalPriceCents || priceCents)}
        </button>
      )}
    </div>
  );
}
