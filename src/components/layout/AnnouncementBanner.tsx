'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, BookOpen } from 'lucide-react';

const BANNER_KEY = 'announcement-banner-dismissed-credit-book';

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not previously dismissed
    if (!localStorage.getItem(BANNER_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(BANNER_KEY, 'true');
  };

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 text-white">
      <div className="section-container">
        <div className="flex items-center justify-center gap-3 py-2.5 pr-8 text-sm font-medium">
          <BookOpen className="w-4 h-4 flex-shrink-0 hidden sm:block" />
          <span className="text-brand-100">NEW BOOK</span>
          <span className="hidden sm:inline text-white/60">—</span>
          <Link
            href="/books/credit-without-a-credit-score"
            className="underline underline-offset-2 decoration-brand-300 hover:decoration-white transition-colors"
          >
            Credit Without a Credit Score
          </Link>
          <span className="hidden md:inline text-brand-200">
            — The step-by-step guide to building business credit with just an EIN
          </span>
          <Link
            href="/books/credit-without-a-credit-score"
            className="ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-xs font-semibold"
          >
            Get it now →
          </Link>
        </div>
      </div>
      <button
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
