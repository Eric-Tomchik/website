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

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  service_interest: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Rate limit: 3 submissions per minute per IP (distributed via Convex)
    const ip = getClientIp(req);
    const convex = getConvexClient();
    const rateCheck = await convex.mutation(api.rateLimit.check, {
      key: `contact:${ip}`,
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
    const data = contactSchema.parse(body);

    // Save to Convex (backup + admin dashboard) — reuse convex client from rate limit check
    await convex.mutation(api.contacts.create, {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      service_interest: data.service_interest || undefined,
    });

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    let emailStatus = 'skipped';
    let emailError = '';

    if (!resendKey) {
      emailStatus = 'no_api_key';
      console.error('RESEND_API_KEY is not set');
    } else {
      try {
        const serviceLabel = data.service_interest
          ? {
              starter: 'Starter Site',
              'business-pro': 'Business Pro',
              'custom-app': 'Custom Application',
              other: 'Other / General Inquiry',
            }[data.service_interest] || data.service_interest
          : 'Not specified';

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0f172a; border-radius: 12px; padding: 32px; border: 1px solid #1e293b;">
              <h2 style="color: #60a5fa; margin: 0 0 24px 0; font-size: 22px;">New Contact Form Submission</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; width: 120px; vertical-align: top;">Name</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px; font-weight: 500;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; vertical-align: top;">Email</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px;">
                    <a href="mailto:${data.email}" style="color: #60a5fa; text-decoration: none;">${data.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; vertical-align: top;">Service</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px;">${serviceLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; color: #94a3b8; font-size: 14px; vertical-align: top;">Subject</td>
                  <td style="padding: 10px 12px; color: #f1f5f9; font-size: 14px; font-weight: 500;">${data.subject}</td>
                </tr>
              </table>

              <div style="margin-top: 20px; padding: 16px; background: #1e293b; border-radius: 8px;">
                <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Message</div>
                <div style="color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</div>
              </div>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b;">
                <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 10px 24px; 
                          border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
                  Reply to ${data.name}
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
            from: `Contact Form <noreply@erictomchik.com>`,
            to: ['info@erictomchik.com'],
            reply_to: data.email,
            subject: `New Contact: ${data.subject}`,
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
          console.log('Resend email sent:', resendData.id);
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
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
