import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';
import { is2FAEnabled, verifyTOTP } from '@/lib/totp';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

function signToken(payload: Record<string, unknown>, secret: string): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 attempts per minute per IP (distributed via Convex)
    const ip = getClientIp(req);
    const convex = getConvexClient();
    const rateCheck = await convex.mutation(api.rateLimit.check, {
      key: `login:${ip}`,
      maxAttempts: 5,
      windowMs: 60_000,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const { password, totp_code } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD env var is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Timing-safe comparison to prevent timing attacks
    const passwordMatch =
      password.length === adminPassword.length &&
      crypto.timingSafeEqual(
        Buffer.from(password),
        Buffer.from(adminPassword)
      );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid password' },
        {
          status: 401,
          headers: { 'X-RateLimit-Remaining': String(rateCheck.remaining) },
        }
      );
    }

    // Password is correct — check if 2FA is required
    if (is2FAEnabled()) {
      if (!totp_code) {
        // Password OK, but need TOTP code — tell the client to show 2FA input
        return NextResponse.json(
          { requires_2fa: true },
          { status: 200 }
        );
      }

      // Verify the TOTP code
      const secret = process.env.ADMIN_TOTP_SECRET!;
      if (!verifyTOTP(secret, totp_code)) {
        return NextResponse.json(
          { error: 'Invalid verification code', requires_2fa: true },
          {
            status: 401,
            headers: { 'X-RateLimit-Remaining': String(rateCheck.remaining) },
          }
        );
      }
    }

    // All checks passed — issue session token
    const token = signToken(
      { admin: true, ts: Date.now(), jti: crypto.randomUUID() },
      adminPassword
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Set a non-httpOnly cookie with the Convex auth secret so the admin
    // client SDK can pass it to Convex functions for server-side auth.
    const convexSecret = process.env.CONVEX_AUTH_SECRET;
    if (convexSecret) {
      response.cookies.set('admin_ck', convexSecret, {
        httpOnly: false,       // Readable by client JS
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
