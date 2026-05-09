import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const convex = getConvexClient();

    // Rate limit: 3 subscriptions per minute per IP
    const ip = getClientIp(req);
    const rateCheck = await convex.mutation(api.rateLimit.check, {
      key: `newsletter:${ip}`,
      maxAttempts: 3,
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

    // Save subscriber to Convex
    const result = await convex.mutation(api.newsletter.subscribe, { email });

    // Send welcome email if this is a new subscriber (not already subscribed)
    if (!result.alreadySubscribed) {
      // Check if welcome email automation is enabled via site_settings
      let welcomeEnabled = true;
      try {
        const setting = await convex.query(api.siteSettings.get, { key: 'automation_welcome_email' });
        // siteSettings.get returns JSON-parsed value, so check against boolean false
        if (setting === false || setting === 'false') {
          welcomeEnabled = false;
        }
      } catch {
        // If site_settings not available, default to enabled
      }

      if (welcomeEnabled) {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          try {
            const welcomeHtml = buildWelcomeEmail(email);

            const resendRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${resendKey}`,
              },
              body: JSON.stringify({
                from: 'Eric Tomchik <noreply@erictomchik.com>',
                to: [email],
                subject: 'Welcome to the community! 🎉',
                html: welcomeHtml,
              }),
            });

            const resendData = await resendRes.json();
            if (!resendRes.ok) {
              console.error('Welcome email error:', resendRes.status, resendData);
            } else {
              console.log('Welcome email sent to:', email, 'id:', resendData.id);

              // Log to audit trail
              try {
                await convex.mutation(api.auditLog.create, {
                  adminKey: process.env.CONVEX_AUTH_SECRET!,
                  action: 'welcome_email_sent',
                  actor: 'system',
                  entity_type: 'newsletter_subscriber',
                  details: `Welcome email sent to ${email}`,
                });
              } catch {
                // Non-critical
              }
            }
          } catch (err) {
            console.error('Welcome email exception:', err);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      alreadySubscribed: result.alreadySubscribed,
    });
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildWelcomeEmail(subscriberEmail: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #0a0e1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #60a5fa; font-size: 28px; margin: 0; font-weight: 700;">
        Welcome to the Community! 🎉
      </h1>
    </div>

    <!-- Main Card -->
    <div style="background: #111827; border-radius: 16px; padding: 40px 32px; border: 1px solid #1f2937;">

      <p style="color: #e2e8f0; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
        Hey there! 👋
      </p>

      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
        I'm Eric Tomchik — author, web developer, and founder of ArcLight Press. Thank you for subscribing! I'm excited to have you here.
      </p>

      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
        Here's what you can expect:
      </p>

      <ul style="color: #cbd5e1; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 24px 0;">
        <li><strong style="color: #f1f5f9;">New book announcements</strong> — Be the first to know about upcoming releases</li>
        <li><strong style="color: #f1f5f9;">Business & credit insights</strong> — Tips on building business credit, leveraging AI, and protecting your digital life</li>
        <li><strong style="color: #f1f5f9;">Exclusive content</strong> — Resources, guides, and tools you won't find anywhere else</li>
        <li><strong style="color: #f1f5f9;">Behind the scenes</strong> — What I'm working on, lessons learned, and honest takes on tech & business</li>
      </ul>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://erictomchik.com/books" 
           style="display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 14px 32px; 
                  border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 600; margin: 0 8px 8px 0;">
          📚 Browse My Books
        </a>
        <a href="https://erictomchik.com/blog" 
           style="display: inline-block; background: #1f2937; color: #60a5fa; padding: 14px 32px; 
                  border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 600; border: 1px solid #374151; margin: 0 0 8px 0;">
          📝 Read the Blog
        </a>
      </div>

      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
        In the meantime, check out my latest book — <a href="https://erictomchik.com/books" style="color: #60a5fa; text-decoration: none; font-weight: 500;">Credit Without a Credit Score</a> — the exhaustive guide to building business credit with just an EIN.
      </p>

      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0;">
        Thanks again for joining. Feel free to reply to this email anytime — I read every message.
      </p>

      <p style="color: #f1f5f9; font-size: 15px; margin: 24px 0 0 0; font-weight: 500;">
        — Eric
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1f2937;">
      <div style="margin-bottom: 16px;">
        <a href="https://www.facebook.com/profile.php?id=61589407526718" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">Facebook</a>
        <a href="https://www.linkedin.com/in/eric-tomchik-jr/" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">LinkedIn</a>
        <a href="https://www.instagram.com/cyb3ron3/" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">Instagram</a>
        <a href="https://x.com/EricTomchikJr" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">X</a>
      </div>
      <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
        © ${new Date().getFullYear()} Eric Tomchik · ArcLight Press
      </p>
      <p style="color: #64748b; font-size: 11px; margin: 0;">
        You're receiving this because you subscribed at erictomchik.com.<br/>
        <a href="https://erictomchik.com/unsubscribe?email=${encodeURIComponent(subscriberEmail)}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
