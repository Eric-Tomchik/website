'use client';

import Link from 'next/link';
import { Home, BookOpen, CreditCard, Mail, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function NotFound() {
  // Log the exact 404 URL to GA4 so we can see what paths are being hit
  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_not_found', {
        page_path: path,
        page_location: window.location.href,
        page_referrer: document.referrer || '(none)',
      });
    }
    // Also log to console for debugging
    console.warn(`[404] Page not found: ${path} (referrer: ${document.referrer || 'none'})`);
  }, []);

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center py-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/20 via-transparent to-transparent" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/5 rounded-full blur-3xl" />

      <div className="section-container relative text-center max-w-lg mx-auto">
        {/* Big 404 */}
        <div className="mb-6">
          <span className="text-8xl sm:text-9xl font-bold gradient-text select-none">404</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-surface-400 text-base mb-8 max-w-md mx-auto">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Quick nav cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link
            href="/"
            className="card p-4 flex flex-col items-center gap-2 group"
          >
            <Home className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-surface-200 group-hover:text-white transition-colors">
              Home
            </span>
          </Link>
          <Link
            href="/books"
            className="card p-4 flex flex-col items-center gap-2 group"
          >
            <BookOpen className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-surface-200 group-hover:text-white transition-colors">
              Books
            </span>
          </Link>
          <Link
            href="/become-a-merchant"
            className="card p-4 flex flex-col items-center gap-2 group"
          >
            <CreditCard className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-surface-200 group-hover:text-white transition-colors">
              Card Fees
            </span>
          </Link>
          <Link
            href="/contact"
            className="card p-4 flex flex-col items-center gap-2 group"
          >
            <Mail className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-surface-200 group-hover:text-white transition-colors">
              Contact
            </span>
          </Link>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </section>
  );
}
