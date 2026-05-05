import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';
import { z } from 'zod';

const paypalOrderSchema = z.object({
  paypal_order_id: z.string(),
  paypal_capture_id: z.string().optional(),
  payer_email: z.string(),
  payer_name: z.string(),
  book_id: z.string(),
  book_title: z.string(),
  format: z.enum(['physical', 'digital']),
  quantity: z.number().int().min(1).default(1),
  total_cents: z.number(),
  shipping_address: z
    .object({
      address_line_1: z.string().optional(),
      address_line_2: z.string().optional(),
      admin_area_2: z.string().optional(),
      admin_area_1: z.string().optional(),
      postal_code: z.string().optional(),
      country_code: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = paypalOrderSchema.parse(body);

    const convex = getConvexClient();

    // Map PayPal shipping address to our format
    const shippingAddress = data.shipping_address
      ? {
          line1: data.shipping_address.address_line_1 || undefined,
          line2: data.shipping_address.address_line_2 || undefined,
          city: data.shipping_address.admin_area_2 || undefined,
          state: data.shipping_address.admin_area_1 || undefined,
          postal_code: data.shipping_address.postal_code || undefined,
          country: data.shipping_address.country_code || undefined,
        }
      : undefined;

    await convex.mutation(api.orders.create, {
      customer_email: data.payer_email,
      customer_name: data.payer_name,
      stripe_session_id: `paypal_${data.paypal_order_id}`,
      stripe_payment_intent_id: data.paypal_capture_id
        ? `paypal_${data.paypal_capture_id}`
        : undefined,
      items: [
        {
          book_id: data.book_id,
          book_title: data.book_title,
          format: data.format,
          quantity: data.quantity,
        },
      ],
      total_cents: data.total_cents,
      status: 'paid' as const,
      shipping_address: shippingAddress,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: err.errors },
        { status: 400 }
      );
    }
    console.error('PayPal record order error:', err);
    const message =
      err instanceof Error ? err.message : 'Failed to record order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
