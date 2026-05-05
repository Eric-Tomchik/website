'use client';

import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Loader2 } from 'lucide-react';

interface PayPalButtonProps {
  amountCents: number;
  bookTitle: string;
  bookId: string;
  format: 'physical' | 'digital';
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PayPalButton({
  amountCents,
  bookTitle,
  bookId,
  format,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const [processing, setProcessing] = useState(false);

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      {processing && (
        <div className="flex items-center justify-center py-3">
          <Loader2 className="w-5 h-5 text-brand-400 animate-spin mr-2" />
          <span className="text-sm text-surface-400">Processing payment...</span>
        </div>
      )}
      <PayPalButtons
        style={{
          layout: 'vertical',
          shape: 'rect',
          label: 'paypal',
          height: 45,
          tagline: false,
        }}
        disabled={processing}
        createOrder={(_data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                description: `${bookTitle} (${format === 'physical' ? 'Hardcover' : 'Digital'})`,
                amount: {
                  currency_code: 'USD',
                  value: (amountCents / 100).toFixed(2),
                },
              },
            ],
            application_context: {
              shipping_preference:
                format === 'physical' ? 'GET_FROM_FILE' : 'NO_SHIPPING',
            },
          } as any);
        }}
        onApprove={async (_data, actions) => {
          setProcessing(true);
          try {
            const details = await actions.order!.capture();
            const payer = details.payer;
            const capture =
              details.purchase_units?.[0]?.payments?.captures?.[0];
            const shipping = details.purchase_units?.[0]?.shipping;

            // Record the order in our backend
            const res = await fetch('/api/paypal/record-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paypal_order_id: details.id,
                paypal_capture_id: capture?.id,
                payer_email: payer?.email_address || '',
                payer_name: [payer?.name?.given_name, payer?.name?.surname]
                  .filter(Boolean)
                  .join(' '),
                book_id: bookId,
                book_title: bookTitle,
                format,
                quantity: 1,
                total_cents: amountCents,
                shipping_address: shipping?.address,
              }),
            });

            if (!res.ok) {
              throw new Error('Failed to record order');
            }

            onSuccess();
          } catch (err) {
            console.error('PayPal capture error:', err);
            onError(
              'Payment was processed but we had trouble recording your order. Please contact support with your PayPal confirmation.'
            );
          } finally {
            setProcessing(false);
          }
        }}
        onCancel={() => {
          // User closed PayPal popup — do nothing
        }}
        onError={(err) => {
          console.error('PayPal error:', err);
          onError('PayPal payment failed. Please try again or use card payment.');
          setProcessing(false);
        }}
      />
    </PayPalScriptProvider>
  );
}
