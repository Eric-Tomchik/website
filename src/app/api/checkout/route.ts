import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';
import { z } from 'zod';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      book_id: z.string(),
      format: z.enum(['paperback', 'hardback', 'digital']),
      quantity: z.number().int().min(1).max(10),
    })
  ).min(1),
  embedded: z.boolean().optional(),
  discount_code: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const convex = getConvexClient();

    // Rate limit: 10 checkout session creations per minute per IP
    const ip = getClientIp(req);
    const rateCheck = await convex.mutation(api.rateLimit.check, {
      key: `checkout:${ip}`,
      maxAttempts: 10,
      windowMs: 60_000,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many checkout attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await req.json();
    const { items, embedded, discount_code } = checkoutSchema.parse(body);

    const allBooks = await convex.query(api.books.list, { activeOnly: true });
    const books = allBooks.filter((b) =>
      items.some((i) => i.book_id === b._id)
    );

    if (!books.length) {
      return NextResponse.json({ error: 'No matching books found' }, { status: 400 });
    }

    const hasPhysical = items.some((i) => i.format === 'paperback' || i.format === 'hardback');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erictomchik.com';

    // Calculate total for discount validation
    const orderTotal = items.reduce((sum, item) => {
      const book = books.find((b) => b._id === item.book_id);
      if (!book) return sum;
      const unitAmount =
        item.format === 'digital' && book.digital_price_cents
          ? book.digital_price_cents
          : item.format === 'paperback' && book.paperback_price_cents
            ? book.paperback_price_cents
            : book.price_cents;
      return sum + unitAmount * item.quantity;
    }, 0);

    // Validate AND atomically reserve discount code in one transaction
    // This prevents race conditions where two concurrent checkouts both pass validation
    let discountInfo: {
      valid: boolean;
      discount_type?: string;
      discount_value?: number;
      error?: string;
    } | null = null;

    if (discount_code) {
      const firstItem = items[0];
      discountInfo = await convex.mutation(api.discountCodes.validateAndApply, {
        code: discount_code,
        book_id: firstItem?.book_id,
        format: firstItem?.format,
        order_total_cents: orderTotal,
      });

      if (!discountInfo?.valid) {
        return NextResponse.json(
          { error: discountInfo?.error || 'Invalid or expired discount code' },
          { status: 400 }
        );
      }
    }

    const lineItems = items.map((item) => {
      const book = books.find((b) => b._id === item.book_id);
      if (!book) throw new Error(`Book not found: ${item.book_id}`);

      // Ensure cover image URLs are absolute for Stripe
      let imageUrl = book.cover_image_url;
      if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = `${siteUrl}${imageUrl}`;
      }

      // Use the correct price for each format
      const unitAmount =
        item.format === 'digital' && book.digital_price_cents
          ? book.digital_price_cents
          : item.format === 'paperback' && book.paperback_price_cents
            ? book.paperback_price_cents
            : book.price_cents;

      const formatName =
        item.format === 'digital' ? 'Digital'
        : item.format === 'paperback' ? 'Paperback'
        : 'Hardback';

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${book.title} (${formatName})`,
            description: book.description,
            ...(imageUrl ? { images: [imageUrl] } : {}),
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const sessionConfig: Record<string, unknown> = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      metadata: {
        order_items: JSON.stringify(
          items.map((i) => ({
            book_id: i.book_id,
            book_title: books.find((b) => b._id === i.book_id)?.title || '',
            format: i.format,
            quantity: i.quantity,
          }))
        ),
        ...(discount_code ? { discount_code } : {}),
      },
    };

    // Apply discount via Stripe coupon
    if (discountInfo?.valid && discountInfo.discount_type && discountInfo.discount_value) {
      const stripe = getStripe();
      const couponParams: Record<string, unknown> = {
        duration: 'once' as const,
        name: discount_code!.toUpperCase(),
      };

      if (discountInfo.discount_type === 'percentage') {
        couponParams.percent_off = discountInfo.discount_value;
      } else {
        couponParams.amount_off = discountInfo.discount_value;
        couponParams.currency = 'usd';
      }

      const coupon = await stripe.coupons.create(couponParams as any);
      sessionConfig.discounts = [{ coupon: coupon.id }];
    }

    if (hasPhysical) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US'],
      };
      sessionConfig.shipping_options = [
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
      ];
    }

    if (embedded) {
      // Embedded checkout mode — returns client_secret
      sessionConfig.ui_mode = 'embedded';
      sessionConfig.return_url = `${siteUrl}/books/success?session_id={CHECKOUT_SESSION_ID}`;
    } else {
      // Hosted checkout mode — returns URL
      sessionConfig.success_url = `${siteUrl}/books/success?session_id={CHECKOUT_SESSION_ID}`;
      sessionConfig.cancel_url = `${siteUrl}/books`;
    }

    let session;
    try {
      session = await getStripe().checkout.sessions.create(sessionConfig as any);
    } catch (stripeErr) {
      // Release the reserved discount usage if Stripe session creation fails
      if (discount_code && discountInfo?.valid) {
        await convex.mutation(api.discountCodes.release, { code: discount_code });
      }
      throw stripeErr;
    }

    if (embedded) {
      return NextResponse.json({ clientSecret: session.client_secret });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: err.errors }, { status: 400 });
    }
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
