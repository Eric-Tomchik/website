'use client';

import { formatPrice, hasHardback, hasPaperback, hasDigital } from '@/lib/utils';

interface PriceButtonsProps {
  bookFormat: string;
  priceCents: number;
  paperbackPriceCents?: number;
  digitalPriceCents?: number;
}

export function PriceButtons({
  bookFormat,
  priceCents,
  paperbackPriceCents,
  digitalPriceCents,
}: PriceButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {hasDigital(bookFormat) && (
        <div className="inline-flex items-center px-5 py-2.5 rounded-lg bg-surface-800 border border-surface-700">
          <span className="text-sm text-surface-400 mr-2">Digital</span>
          <span className="text-lg font-bold text-brand-400">
            {formatPrice(digitalPriceCents || priceCents)}
          </span>
        </div>
      )}
      {hasPaperback(bookFormat) && paperbackPriceCents && (
        <div className="inline-flex items-center px-5 py-2.5 rounded-lg bg-surface-800 border border-surface-700">
          <span className="text-sm text-surface-400 mr-2">Paperback</span>
          <span className="text-lg font-bold text-brand-400">
            {formatPrice(paperbackPriceCents)}
          </span>
        </div>
      )}
      {hasHardback(bookFormat) && (
        <div className="inline-flex items-center px-5 py-2.5 rounded-lg bg-surface-800 border border-surface-700">
          <span className="text-sm text-surface-400 mr-2">Hardback</span>
          <span className="text-lg font-bold text-brand-400">
            {formatPrice(priceCents)}
          </span>
        </div>
      )}
    </div>
  );
}
