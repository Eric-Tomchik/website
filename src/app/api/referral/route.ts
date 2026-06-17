import { NextResponse } from 'next/server';
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

const referralSchema = z.object({
  business_name: z.string().min(1, 'Business name is required').max(200),
  owner_name: z.string().min(1, 'Owner/decision maker name is required').max(100),
  business_phone: z.string().min(7, 'Valid phone number is required').max(20),
  referrer_name: z.string().min(1, 'Your name is required').max(100),
  referrer_phone: z.string().min(7, 'Valid phone number is required').max(20),
  referrer_email: z.string().email('Valid email is required'),
  notes: z.string().max(1000).optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const convex = getConvexClient();

    // Rate limit: 5 referral submissions per hour per IP
    const rateCheck = await convex.mutation(api.rateLimit.check, {
      key: `referral:${ip}`,
      maxAttempts: 5,
      windowMs: 3_600_000,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await req.json();
    const data = referralSchema.parse(body);

    // Honeypot check
    if (data.website) {
      return NextResponse.json({ success: true });
    }

    // Save to Convex
    await convex.mutation(api.referrals.create, {
      business_name: data.business_name,
      owner_name: data.owner_name,
      business_phone: data.business_phone,
      referrer_name: data.referrer_name,
      referrer_phone: data.referrer_phone,
      referrer_email: data.referrer_email,
      notes: data.notes || undefined,
    });

    // Send notification email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0f172a; border-radius: 12px; padding: 32px; border: 1px solid #1e293b;">
              <h2 style="color: #10b981; margin: 0 0 24px 0; font-size: 22px;">🎉 New Clover Referral Submission</h2>
              
              <div style="margin-bottom: 16px; padding: 12px; background: #1e293b; border-radius: 8px;">
                <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Referred Business</div>
                <div style="color: #f1f5f9; font-size: 16px; font-weight: 600;">${data.business_name}</div>
              </div>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; width: 140px; vertical-align: top;">Owner/Decision Maker</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px; font-weight: 500;">${data.owner_name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; vertical-align: top;">Business Phone</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px;">
                    <a href="tel:${data.business_phone}" style="color: #60a5fa; text-decoration: none;">${data.business_phone}</a>
                  </td>
                </tr>
              </table>

              <div style="margin: 16px 0; border-top: 1px solid #334155;"></div>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; width: 140px; vertical-align: top;">Referred By</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px; font-weight: 500;">${data.referrer_name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; vertical-align: top;">Referrer Phone</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px;">
                    <a href="tel:${data.referrer_phone}" style="color: #60a5fa; text-decoration: none;">${data.referrer_phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; vertical-align: top;">Referrer Email</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px;">
                    <a href="mailto:${data.referrer_email}" style="color: #60a5fa; text-decoration: none;">${data.referrer_email}</a>
                  </td>
                </tr>
              </table>

              ${data.notes ? `
              <div style="margin-top: 16px; padding: 16px; background: #1e293b; border-radius: 8px;">
                <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Additional Notes</div>
                <div style="color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.notes}</div>
              </div>` : ''}

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b;">
                <a href="tel:${data.business_phone}" 
                   style="display: inline-block; background: #059669; color: white; padding: 10px 24px; 
                          border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
                  Call ${data.owner_name}
                </a>
              </div>
            </div>
          </div>
        `;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: 'Clover Referrals <noreply@erictomchik.com>',
            to: ['eric@charityswipes.com'],
            reply_to: data.referrer_email,
            subject: `New Clover Referral: ${data.business_name} (from ${data.referrer_name})`,
            html: emailHtml,
          }),
        });
      } catch (emailErr) {
        console.error('Resend email error for referral:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid form data', details: err.errors }, { status: 400 });
    }
    console.error('Referral form error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
