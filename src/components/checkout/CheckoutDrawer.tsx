'use client';

import { useEffect, useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { X, BookOpen, CheckCircle, Loader2, Tag, Check } from 'lucide-react';
import { useCheckout } from './CheckoutContext';
import { PayPalButton } from './PayPalButton';
import { formatPrice } from '@/lib/utils';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface DiscountInfo {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  description?: string;
}

function calculateDiscount(price: number, discount: DiscountInfo): number {
  if (discount.discount_type === 'percentage') {
    return Math.round(price * (discount.discount_value / 100));
  }
  return Math.min(discount.discount_value, price);
}

export function CheckoutDrawer() {
  const { state, closeCheckout } = useCheckout();
  const { isOpen, book, format } = state;
  const basePrice = book
    ? format === 'digital' && book.digital_price_cents
      ? book.digital_price_cents
      : book.price_cents
    : 0;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Discount state
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(null);

  const discountAmount = appliedDiscount ? calculateDiscount(basePrice, appliedDiscount) : 0;
  const effectivePrice = basePrice - discountAmount;

  // Reset discount when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPromoInput('');
      setPromoError(null);
      setAppliedDiscount(null);
    }
  }, [isOpen]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError(null);

    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoInput.trim(),
          book_id: book?._id,
          format,
          order_total_cents: basePrice,
        }),
      });
      const data = await res.json();

      if (data.valid) {
        setAppliedDiscount({
          code: promoInput.trim().toUpperCase(),
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          description: data.description,
        });
        setPromoError(null);
      } else {
        setPromoError(data.error || 'Invalid code');
      }
    } catch {
      setPromoError('Failed to validate code');
    }
    setPromoLoading(false);
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(null);
    setPromoInput('');
    setPromoError(null);
    // Reset checkout session
    setClientSecret(null);
  };

  // Fetch client secret when dialog opens or discount changes
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
            discount_code: appliedDiscount?.code || undefined,
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
  }, [isOpen, book, format, appliedDiscount]);

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
            /* Checkout layout */
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
                    {appliedDiscount ? (
                      <div>
                        <span className="text-sm text-surface-500 line-through mr-2">
                          {formatPrice(basePrice)}
                        </span>
                        <span className="text-xl font-bold text-green-400">
                          {formatPrice(effectivePrice)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-brand-400">
                        {formatPrice(basePrice)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Promo Code Input */}
              <div>
                {appliedDiscount ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-mono font-bold text-green-400">
                        {appliedDiscount.code}
                      </span>
                      <span className="text-xs text-surface-400">
                        — {appliedDiscount.discount_type === 'percentage'
                          ? `${appliedDiscount.discount_value}% off`
                          : `$${(appliedDiscount.discount_value / 100).toFixed(2)} off`}
                      </span>
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-xs text-surface-400 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromo(); } }}
                      placeholder="Promo code"
                      className="flex-1 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500 uppercase tracking-wider font-mono"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-4 py-2 rounded-lg bg-surface-800 border border-surface-700 text-sm text-surface-300 hover:text-white hover:border-brand-500 transition-colors disabled:opacity-50"
                    >
                      {promoLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-xs text-red-400 mt-1.5">{promoError}</p>
                )}
              </div>

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
                        amountCents={effectivePrice}
                        bookTitle={book.title}
                        bookId={book._id}
                        format={format}
                        onSuccess={handleComplete}
                        onError={(msg) => setError(msg)}
                        discountCode={appliedDiscount?.code}
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
