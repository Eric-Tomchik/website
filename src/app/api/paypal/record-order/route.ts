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
            <h1 style="color: #1a1a2e; margin-bottom: 8px;">Thank you for your purchase!</h1>
            <p style="color: #555; font-size: 16px;">Hi ${name || 'there'},</p>
            <p style="color: #555; font-size: 16px;">
              Your digital copy of <strong>"${bookTitle}"</strong> is ready for download.
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${downloadUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Download Your Book
              </a>
            </div>
            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                📥 Available in PDF and EPUB formats<br/>
                ⏰ Link expires in 72 hours<br/>
                🔄 Up to 5 downloads allowed
              </p>
            </div>
            <p style="color: #999; font-size: 13px;">
              If the button doesn't work, copy and paste this link:<br/>
              <a href="${downloadUrl}" style="color: #6366f1;">${downloadUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              ArcLight Press · erictomchik.com
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
    const body = await req.json();
    const data = paypalOrderSchema.parse(body);

    const convex = getConvexClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erictomchik.com';

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

    // Generate download token for digital purchases
    if (data.format === 'digital') {
      try {
        const { token } = await convex.mutation(
          api.downloadTokens.create,
          {
            book_id: data.book_id,
            customer_email: data.payer_email,
            order_id: `paypal_${data.paypal_order_id}`,
          }
        );

        const downloadUrl = `${siteUrl}/download/${token}`;

        await sendDownloadEmail(
          data.payer_email,
          data.payer_name,
          data.book_title,
          downloadUrl
        );

        return NextResponse.json({ success: true, download_url: downloadUrl });
      } catch (err) {
        console.error('Failed to create download token:', err);
      }
    }

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
