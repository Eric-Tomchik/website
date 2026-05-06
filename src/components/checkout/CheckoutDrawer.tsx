'use client';

import { useEffect, useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { X, BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { useCheckout } from './CheckoutContext';
import { PayPalButton } from './PayPalButton';
import { formatPrice } from '@/lib/utils';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function CheckoutDrawer() {
  const { state, closeCheckout } = useCheckout();
  const { isOpen, book, format } = state;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Fetch client secret when dialog opens
  useEffect(() => {
    if (!isOpen || !book) {
      setClientSecret(null);
      setError(null);
      setCompleted(false);
      return;
    }

    let cancelled = false;

    async function createSession() {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{ book_id: book!._id, format, quantity: 1 }],
            embedded: true,
          }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || 'Failed to start checkout');
        }
      } catch {
        if (!cancelled) setError('Network error. Please try again.');
      }
    }

    createSession();
    return () => { cancelled = true; };
  }, [isOpen, book, format]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCheckout();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeCheckout]);

  const handleComplete = useCallback(() => {
    setCompleted(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeCheckout}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-surface-950 border border-surface-800 rounded-2xl shadow-2xl animate-scale-in flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">
            {completed ? 'Order Complete!' : 'Complete Your Purchase'}
          </h2>
          <button
            onClick={closeCheckout}
            className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {completed ? (
            /* Success state */
            <div className="flex items-center justify-center p-10">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Thank you for your purchase!</h3>
                <p className="text-surface-400 max-w-md">
                  Your order has been confirmed. You&apos;ll receive an email confirmation shortly.
                  {format === 'physical' && ' Your book will be shipped within 1-2 business days.'}
                </p>
                <button
                  onClick={closeCheckout}
                  className="btn-primary mt-4"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            /* Checkout layout: book summary + payment centered */
            <div className="p-6 space-y-6">
              {/* Order summary — compact horizontal */}
              {book && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-900/50 border border-surface-800">
                  {/* Book cover thumbnail */}
                  <div className="w-16 h-20 rounded-lg overflow-hidden border border-surface-700 flex-shrink-0">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-surface-800">
                        <BookOpen className="w-6 h-6 text-surface-600" />
                      </div>
                    )}
                  </div>

                  {/* Book info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-white truncate">{book.title}</h4>
                    <p className="text-sm text-surface-400">
                      {format === 'physical' ? 'Hardcover' : 'Digital'} Edition
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-xl font-bold text-brand-400">
                      {formatPrice(book.price_cents)}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment section */}
              {error ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-red-400">{error}</p>
                  <button onClick={closeCheckout} className="btn-secondary text-sm">
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* PayPal Button */}
                  {book && (
                    <div>
                      <PayPalButton
                        amountCents={book.price_cents}
                        bookTitle={book.title}
                        bookId={book._id}
                        format={format}
                        onSuccess={handleComplete}
                        onError={(msg) => setError(msg)}
                      />
                    </div>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-surface-700" />
                    <span className="text-xs text-surface-500 uppercase tracking-wider">or pay with card</span>
                    <div className="flex-1 border-t border-surface-700" />
                  </div>

                  {/* Stripe Embedded Checkout */}
                  {!clientSecret ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
                        <p className="text-surface-400 text-sm">Loading payment form...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="stripe-embed-container">
                      <EmbeddedCheckoutProvider
                        stripe={stripePromise}
                        options={{ clientSecret, onComplete: handleComplete }}
                      >
                        <EmbeddedCheckout />
                      </EmbeddedCheckoutProvider>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
