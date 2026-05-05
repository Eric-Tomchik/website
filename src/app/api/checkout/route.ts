import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';
import { z } from 'zod';

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      book_id: z.string(),
      format: z.enum(['physical', 'digital']),
      quantity: z.number().int().min(1).max(10),
    })
  ).min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = checkoutSchema.parse(body);

    const convex = getConvexClient();
    const allBooks = await convex.query(api.books.list, { activeOnly: true });
    const books = allBooks.filter((b) =>
      items.some((i) => i.book_id === b._id)
    );

    if (!books.length) {
      return NextResponse.json({ error: 'No matching books found' }, { status: 400 });
    }

    const hasPhysical = items.some((i) => i.format === 'physical');

    const lineItems = items.map((item) => {
      const book = books.find((b) => b._id === item.book_id);
      if (!book) throw new Error(`Book not found: ${item.book_id}`);

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${book.title} (${item.format === 'digital' ? 'Digital' : 'Physical'})`,
            description: book.description,
            images: book.cover_image_url ? [book.cover_image_url] : [],
          },
          unit_amount: book.price_cents,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      ...(hasPhysical && {
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: { amount: 499, currency: 'usd' },
              display_name: 'Standard Shipping',
              delivery_estimate: {
                minimum: { unit: 'business_day', value: 5 },
                maximum: { unit: 'business_day', value: 10 },
              },
            },
          },
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: { amount: 1299, currency: 'usd' },
              display_name: 'Priority Shipping',
              delivery_estimate: {
                minimum: { unit: 'business_day', value: 2 },
                maximum: { unit: 'business_day', value: 4 },
              },
            },
          },
        ],
      }),
      metadata: {
        order_items: JSON.stringify(
          items.map((i) => ({
            book_id: i.book_id,
            book_title: books.find((b) => b._id === i.book_id)?.title || '',
            format: i.format,
            quantity: i.quantity,
          }))
        ),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/books/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/books`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: err.errors }, { status: 400 });
    }
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
