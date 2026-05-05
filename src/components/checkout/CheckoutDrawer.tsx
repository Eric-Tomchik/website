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

  // Fetch client secret when drawer opens
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
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeCheckout}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-surface-950 border-l border-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
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
            <div className="flex items-center justify-center h-full p-8">
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
            /* Checkout layout: book info + payment */
            <div className="grid md:grid-cols-5 h-full">
              {/* Left: Order summary */}
              <div className="md:col-span-2 p-6 border-b md:border-b-0 md:border-r border-surface-800 bg-surface-900/50">
                <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">
                  Order Summary
                </h3>

                {book && (
                  <div className="space-y-4">
                    {/* Book cover */}
                    <div className="relative aspect-[3/4] max-w-[200px] mx-auto rounded-lg overflow-hidden border border-surface-700 shadow-lg">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-surface-800">
                          <BookOpen className="w-10 h-10 text-surface-600" />
                        </div>
                      )}
                    </div>

                    {/* Book info */}
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-bold text-white">{book.title}</h4>
                      <p className="text-sm text-surface-400 line-clamp-2">{book.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-surface-500 capitalize px-2 py-1 rounded bg-surface-800">
                          {format === 'physical' ? 'Hardcover' : 'Digital'} Edition
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="border-t border-surface-800 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-surface-400">Subtotal</span>
                        <span className="text-white font-medium">{formatPrice(book.price_cents)}</span>
                      </div>
                      {format === 'physical' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-surface-400">Shipping</span>
                          <span className="text-surface-400 text-xs">calculated at checkout</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold border-t border-surface-800 pt-2">
                        <span className="text-white">Total</span>
                        <span className="text-brand-400">{formatPrice(book.price_cents)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Payment Options */}
              <div className="md:col-span-3 p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">
                  Payment Details
                </h3>

                {error ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <p className="text-red-400">{error}</p>
                      <button onClick={closeCheckout} className="btn-secondary text-sm">
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-0">
                    {/* PayPal Button */}
                    {book && (
                      <div className="pb-4">
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
                    <div className="flex items-center gap-3 py-3">
                      <div className="flex-1 border-t border-surface-700" />
                      <span className="text-xs text-surface-500 uppercase tracking-wider">or pay with card</span>
                      <div className="flex-1 border-t border-surface-700" />
                    </div>

                    {/* Stripe Embedded Checkout */}
                    {!clientSecret ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
                          <p className="text-surface-400 text-sm">Loading payment form...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 stripe-embed-container">
                        <EmbeddedCheckoutProvider
                          stripe={stripePromise}
                          options={{ clientSecret, onComplete: handleComplete }}
                        >
                          <EmbeddedCheckout className="h-full" />
                        </EmbeddedCheckoutProvider>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
