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
    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const convex = getConvexClient();

    // Rate limit: 5 unsubscribe attempts per minute per IP
    const ip = getClientIp(req);
    try {
      const rateCheck = await convex.mutation(api.rateLimit.check, {
        key: `unsubscribe:${ip}`,
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
    } catch {
      // Non-critical — proceed even if rate limiting fails
    }

    // Unsubscribe the user
    await convex.mutation(api.newsletter.unsubscribe, { email });

    // Log to audit trail
    try {
      await convex.mutation(api.auditLog.create, {
        action: 'newsletter_unsubscribe',
        actor: 'user',
        entity_type: 'newsletter_subscriber',
        details: `Unsubscribed: ${email}`,
      });
    } catch {
      // Non-critical
    }

    // Always return success (don't reveal whether email was in the list)
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Newsletter unsubscribe error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
