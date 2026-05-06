import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';

export async function POST(req: Request) {
  try {
    const { code, book_id, format, order_total_cents } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Please enter a code.' });
    }

    const convex = getConvexClient();
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
