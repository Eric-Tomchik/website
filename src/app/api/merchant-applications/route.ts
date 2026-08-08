import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { z } from 'zod';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

const applicationSchema = z.object({
  business_name: z.string().min(1).max(150),
  owner_name: z.string().min(1).max(100),
  email: z.string().email(),
  // Optional since the landing-page form asks for phone only as an optional extra.
  phone: z.string().max(30).optional(),
  industry: z.string().max(150).optional(),
  monthly_volume: z.string().max(50).optional(),
  notes: z.string().max(3000).optional(),
  // Set by /api/merchant-statement after a successful upload.
  statement_storage_id: z.string().max(200).optional(),
  statement_filename: z.string().max(200).optional(),
  statement_size_bytes: z.number().int().nonnegative().optional(),
  company: z.string().optional(), // honeypot field
});

export async function POST(req: Request) {
  try {
    // Rate limit: 3 submissions per minute per IP (distributed via Convex)
    const ip = getClientIp(req);
    const convex = getConvexClient();
    const rateCheck = await convex.mutation(api.rateLimit.check, {
      key: `merchant-application:${ip}`,
      maxAttempts: 3,
      windowMs: 60_000,
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
    const data = applicationSchema.parse(body);

    // Honeypot check — if the hidden "company" field has a value, it's a bot.
    if (data.company) {
      return NextResponse.json({ success: true, emailStatus: 'sent' });
    }

    // Save to Convex — powers the "Merchant Applications" admin CRM tab
    await convex.mutation(api.merchantApplications.create, {
      business_name: data.business_name,
      owner_name: data.owner_name,
      email: data.email,
      phone: data.phone || 'Not provided',
      industry: data.industry || undefined,
      monthly_volume: data.monthly_volume || undefined,
      notes: data.notes || undefined,
      statement_storage_id: data.statement_storage_id
        ? (data.statement_storage_id as Id<'_storage'>)
        : undefined,
      statement_filename: data.statement_filename || undefined,
      statement_size_bytes: data.statement_size_bytes,
    });

    // Send email notification via Resend
    const resendKey = process.env.RESEND_API_KEY;
    let emailStatus = 'skipped';
    let emailError = '';

    if (!resendKey) {
      emailStatus = 'no_api_key';
      console.error('RESEND_API_KEY is not set');
    } else {
      try {
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0f172a; border-radius: 12px; padding: 32px; border: 1px solid #1e293b;">
              <h2 style="color: #60a5fa; margin: 0 0 24px 0; font-size: 22px;">New Processing Analysis Request</h2>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; width: 140px; vertical-align: top;">Business</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px; font-weight: 500;">${data.business_name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; vertical-align: top;">Owner / Contact</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px;">${data.owner_name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; vertical-align: top;">Email</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px;">
                    <a href="mailto:${data.email}" style="color: #60a5fa; text-decoration: none;">${data.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; vertical-align: top;">Phone</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px;">
                    ${data.phone ? `<a href="tel:${data.phone}" style="color: #60a5fa; text-decoration: none;">${data.phone}</a>` : 'Not provided'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; vertical-align: top;">Industry</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px;">${data.industry || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; vertical-align: top;">Est. Monthly Volume</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px;">${data.monthly_volume || 'Not specified'}</td>
                </tr>
              </table>

              ${
                data.notes
                  ? `<div style="margin-top: 20px; padding: 16px; background: #1e293b; border-radius: 8px;">
                <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Notes</div>
                <div style="color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.notes}</div>
              </div>`
                  : ''
              }

              ${
                data.statement_storage_id
                  ? `<div style="margin-top: 20px; padding: 16px; background: #052e1b; border: 1px solid #15803d; border-radius: 8px;">
                <div style="color: #4ade80; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Processing statement attached</div>
                <div style="color: #e2e8f0; font-size: 14px;">${data.statement_filename || 'statement'}</div>
                <div style="color: #94a3b8; font-size: 12px; margin-top: 6px;">Open it from the admin portal &mdash; it is not attached to this email.</div>
              </div>`
                  : `<div style="margin-top: 20px; padding: 16px; background: #1e293b; border-radius: 8px;">
                <div style="color: #94a3b8; font-size: 13px;">No statement uploaded &mdash; ask for it on the first call.</div>
              </div>`
              }

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b;">
                <a href="https://erictomchik.com/admin/merchant-applications"
                   style="display: inline-block; background: #2563eb; color: white; padding: 10px 24px;
                          border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
                  View in Admin Portal
                </a>
              </div>
            </div>
          </div>
        `;

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: `Merchant Applications <noreply@erictomchik.com>`,
            to: ['info@erictomchik.com'],
            reply_to: data.email,
            subject: `New Processing Analysis Request${data.statement_storage_id ? ' (statement attached)' : ''}: ${data.business_name}`,
            html: emailHtml,
          }),
        });
        const resendData = await resendRes.json();
        if (!resendRes.ok) {
          emailStatus = 'error';
          emailError = `${resendRes.status}: ${JSON.stringify(resendData)}`;
          console.error('Resend API error:', emailError);
        } else {
          emailStatus = 'sent';
        }
      } catch (emailErr) {
        emailStatus = 'exception';
        emailError = String(emailErr);
        console.error('Resend email error:', emailErr);
      }
    }

    return NextResponse.json({ success: true, emailStatus, emailError: emailError || undefined });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid form data', details: err.errors }, { status: 400 });
    }
    console.error('Merchant application error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
