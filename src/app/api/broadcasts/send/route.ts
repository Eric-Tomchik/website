import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const broadcastId = body.broadcastId as Id<'email_broadcasts'>;

    if (!broadcastId) {
      return NextResponse.json({ error: 'broadcastId is required' }, { status: 400 });
    }

    const convex = getConvexClient();

    // Get the broadcast
    const broadcast = await convex.query(api.emailBroadcasts.get, { adminKey: process.env.CONVEX_AUTH_SECRET!, id: broadcastId });
    if (!broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }
    if (broadcast.status !== 'draft') {
      return NextResponse.json({ error: 'Broadcast has already been sent' }, { status: 400 });
    }

    // Get active subscribers
    const subscribers = await convex.query(api.newsletter.listActive, { adminKey: process.env.CONVEX_AUTH_SECRET! });
    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No active subscribers' }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      await convex.mutation(api.emailBroadcasts.markFailed, {
        adminKey: process.env.CONVEX_AUTH_SECRET!,
        id: broadcastId,
        error_message: 'RESEND_API_KEY not configured',
      });
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // Mark as sending
    await convex.mutation(api.emailBroadcasts.markSending, {
      adminKey: process.env.CONVEX_AUTH_SECRET!,
      id: broadcastId,
      recipient_count: subscribers.length,
    });

    // Build full HTML email wrapper
    const htmlEmail = wrapBroadcastHtml(broadcast.subject, broadcast.content, broadcast.preview_text);

    // Send to each subscriber
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Use Resend batch API if available, otherwise send individually
    // Resend supports up to 100 emails per batch
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const sendPromises = batch.map(async (subscriber) => {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: 'Eric Tomchik <noreply@erictomchik.com>',
              to: [subscriber.email],
              subject: broadcast.subject,
              html: htmlEmail,
            }),
          });

          if (res.ok) {
            sentCount++;
          } else {
            failedCount++;
            const errData = await res.json();
            errors.push(`${subscriber.email}: ${res.status} ${JSON.stringify(errData)}`);
          }
        } catch (err) {
          failedCount++;
          errors.push(`${subscriber.email}: ${String(err)}`);
        }
      });

      await Promise.all(sendPromises);
    }

    // Update broadcast status
    await convex.mutation(api.emailBroadcasts.markSent, {
      adminKey: process.env.CONVEX_AUTH_SECRET!,
      id: broadcastId,
      sent_count: sentCount,
      failed_count: failedCount,
    });

    // Audit log
    try {
      await convex.mutation(api.auditLog.create, {
        adminKey: process.env.CONVEX_AUTH_SECRET!,
        action: 'broadcast_sent',
        actor: 'admin',
        entity_type: 'email_broadcast',
        entity_id: broadcastId,
        details: `Broadcast "${broadcast.subject}" sent to ${sentCount}/${subscribers.length} subscribers`,
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      success: true,
      sent_count: sentCount,
      failed_count: failedCount,
      total_recipients: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('Broadcast send error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function wrapBroadcastHtml(subject: string, content: string, previewText?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${previewText ? `<meta name="description" content="${previewText.replace(/"/g, '&quot;')}">` : ''}
  <!--[if !mso]><!--><style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style><!--<![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0a0e1a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}

  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://erictomchik.com" style="color: #60a5fa; text-decoration: none; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">
        Eric Tomchik
      </a>
    </div>

    <!-- Main Card -->
    <div style="background: #111827; border-radius: 16px; padding: 40px 32px; border: 1px solid #1f2937;">
      <h1 style="color: #f1f5f9; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.3;">
        ${subject}
      </h1>

      <div style="color: #cbd5e1; font-size: 15px; line-height: 1.8;">
        ${content}
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1f2937;">
      <div style="margin-bottom: 16px;">
        <a href="https://erictomchik.com/books" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 13px;">Books</a>
        <a href="https://erictomchik.com/blog" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 13px;">Blog</a>
        <a href="https://erictomchik.com/services" style="color: #60a5fa; text-decoration: none; margin: 0 10px; font-size: 13px;">Services</a>
      </div>
      <div style="margin-bottom: 16px;">
        <a href="https://www.facebook.com/profile.php?id=61589407526718" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">Facebook</a>
        <a href="https://www.linkedin.com/in/eric-tomchik-jr/" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">LinkedIn</a>
        <a href="https://www.instagram.com/cyb3ron3/" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">Instagram</a>
        <a href="https://x.com/EricTomchikJr" style="color: #94a3b8; text-decoration: none; margin: 0 8px; font-size: 13px;">X</a>
      </div>
      <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
        &copy; ${new Date().getFullYear()} Eric Tomchik &middot; ArcLight Press
      </p>
      <p style="color: #64748b; font-size: 11px; margin: 0;">
        You're receiving this because you subscribed at erictomchik.com.<br/>
        <a href="https://erictomchik.com" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
