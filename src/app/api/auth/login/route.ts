import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';
import { is2FAEnabled, verifyTOTP } from '@/lib/totp';
import { createAdminSessionToken, createConvexAdminCapability } from '@/lib/adminSession';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

export async function POST(req: NextRequest) {
  try {
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
        { status: 429, headers: {
          'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        } }
      );
    }

    const body = await req.json();
    const password = typeof body?.password === 'string' ? body.password : '';
    const totpCode = typeof body?.totp_code === 'string' ? body.totp_code : '';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || !process.env.ADMIN_SESSION_SECRET || !process.env.CONVEX_ADMIN_SESSION_SECRET) {
      console.error('Admin authentication secrets are not fully configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const passwordMatch =
      password.length === adminPassword.length &&
      crypto.timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword));

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401, headers: { 'X-RateLimit-Remaining': String(rateCheck.remaining) } }
      );
    }

    if (is2FAEnabled()) {
      if (!totpCode) return NextResponse.json({ requires_2fa: true }, { status: 200 });
      const secret = process.env.ADMIN_TOTP_SECRET!;
      if (!verifyTOTP(secret, totpCode)) {
        return NextResponse.json(
          { error: 'Invalid verification code', requires_2fa: true },
          { status: 401, headers: { 'X-RateLimit-Remaining': String(rateCheck.remaining) } }
        );
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', createAdminSessionToken(), {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Browser-readable by necessity for Convex WebSocket calls, but this is now
    // a one-hour scoped capability — never CONVEX_AUTH_SECRET itself.
    response.cookies.set('admin_ck', createConvexAdminCapability(), {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60,
      path: '/admin',
    });

    return response;
  } catch (err) {
    console.error('Admin login failed:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
