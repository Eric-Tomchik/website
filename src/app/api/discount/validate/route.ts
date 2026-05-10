import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

export async function POST(req: Request) {
  try {
    const convex = getConvexClient();

    // Rate limit: 10 attempts per minute per IP to prevent brute-forcing promo codes
    const ip = getClientIp(req);
    const rateCheck = await convex.mutation(api.rateLimit.check, {
      key: `discount_validate:${ip}`,
      maxAttempts: 10,
      windowMs: 60_000,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { valid: false, error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const { code, book_id, format, order_total_cents } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Please enter a code.' });
    }

    const result = await convex.query(api.discountCodes.validate, {
      code,
      book_id,
      format,
      order_total_cents,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Discount validation error:', err);
    return NextResponse.json({ valid: false, error: 'Failed to validate code.' });
  }
}
