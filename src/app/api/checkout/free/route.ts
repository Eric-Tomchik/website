import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';
import { z } from 'zod';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

const freeCheckoutSchema = z.object({
  book_id: z.string(),
  book_title: z.string(),
  format: z.enum(['paperback', 'hardback', 'digital']),
  discount_code: z.string(),
  customer_email: z.string().email(),
  customer_name: z.string().min(1),
});

async function sendDownloadEmail(
  email: string,
  name: string,
  bookTitle: string,
  downloadUrl: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ArcLight Press <noreply@erictomchik.com>',
        to: email,
        subject: `Your digital copy of "${bookTitle}" is ready!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #1a1a2e; margin-bottom: 8px;">Thank you!</h1>
            <p style="color: #555; font-size: 16px;">Hi ${name || 'there'},</p>
            <p style="color: #555; font-size: 16px;">
              Your free digital copy of <strong>"${bookTitle}"</strong> is ready for download.
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${downloadUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Download Your Book
              </a>
            </div>
            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                &#128229; Available in PDF and EPUB formats<br/>
                &#9200; Link expires in 72 hours<br/>
                &#128260; Up to 5 downloads allowed
              </p>
            </div>
            <p style="color: #999; font-size: 13px;">
              If the button doesn't work, copy and paste this link:<br/>
              <a href="${downloadUrl}" style="color: #6366f1;">${downloadUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              ArcLight Press &middot; erictomchik.com
            </p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error('Failed to send download email:', err);
  }
}

export async function POST(req: Request) {
  try {
    // Rate limit: 5 attempts per minute per IP (distributed via Convex)
    const ip = getClientIp(req);
    const convex = getConvexClient();
    const rateCheck = await convex.mutation(api.rateLimit.check, {
      key: `free_checkout:${ip}`,
      maxAttempts: 5,
      windowMs: 60_000,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await req.json();
    const data = freeCheckoutSchema.parse(body);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erictomchik.com';

    // IP-based one-per-network guard for promo codes.
    // Uses the rate limiter with 1 attempt in a 10-year window — effectively permanent.
    // Prevents the same IP/network from redeeming the same promo code more than once.
    const promoIpCheck = await convex.mutation(api.rateLimit.check, {
      key: `promo_ip:${data.discount_code.toUpperCase()}:${ip}`,
      maxAttempts: 1,
      windowMs: 10 * 365 * 24 * 60 * 60 * 1000, // ~10 years
    });
    if (!promoIpCheck.allowed) {
      return NextResponse.json(
        { error: 'This promotional code has already been redeemed from your network. Limit one per household.' },
        { status: 403 }
      );
    }

    // Atomically validate AND apply the discount code
    const discountResult = await convex.mutation(api.discountCodes.validateAndApply, {
      code: data.discount_code,
      book_id: data.book_id,
      format: data.format,
      order_total_cents: 0,
    });

    if (!discountResult?.valid) {
      // Release the IP lock since the discount code itself was invalid
      await convex.mutation(api.rateLimit.release, {
        key: `promo_ip:${data.discount_code.toUpperCase()}:${ip}`,
      });
      return NextResponse.json(
        { error: discountResult?.error || 'Invalid or expired discount code' },
        { status: 400 }
      );
    }

    // Verify the discount makes it truly free (100% off)
    if (discountResult.discount_type !== 'percentage' || discountResult.discount_value !== 100) {
      await convex.mutation(api.discountCodes.release, { code: data.discount_code });
      // Release the IP lock since this wasn't actually a free-download promo
      await convex.mutation(api.rateLimit.release, {
        key: `promo_ip:${data.discount_code.toUpperCase()}:${ip}`,
      });
      return NextResponse.json(
        { error: 'This discount does not make the item free. Please use the standard checkout.' },
        { status: 400 }
      );
    }

    // Create the order at $0
    await convex.mutation(api.orders.create, {
      adminKey: process.env.CONVEX_AUTH_SECRET!,
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      stripe_session_id: `free_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      items: [
        {
          book_id: data.book_id,
          book_title: data.book_title,
          format: data.format,
          quantity: 1,
          price_cents: 0,
        },
      ],
      total_cents: 0,
      status: 'fulfilled' as const,
      discount_code: data.discount_code.toUpperCase(),
    });

    // Generate download token for digital purchases
    let downloadUrl: string | undefined;
    if (data.format === 'digital') {
      try {
        const { token } = await convex.mutation(api.downloadTokens.create, {
          adminKey: process.env.CONVEX_AUTH_SECRET!,
          book_id: data.book_id,
          customer_email: data.customer_email,
          order_id: `free_promo_${data.discount_code}`,
        });

        downloadUrl = `${siteUrl}/download/${token}`;

        await sendDownloadEmail(
          data.customer_email,
          data.customer_name,
          data.book_title,
          downloadUrl
        );
      } catch (err) {
        console.error('Failed to create download token:', err);
      }
    }

    return NextResponse.json({
      success: true,
      download_url: downloadUrl,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.', details: err.errors },
        { status: 400 }
      );
    }
    console.error('Free checkout error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
