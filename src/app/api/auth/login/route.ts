import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

function signToken(payload: Record<string, unknown>, secret: string): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export async function POST(req: Request) {
  try {
    // Rate limit: 5 attempts per minute per IP
    const ip = getClientIp(req);
    const { allowed, remaining, resetAt } = checkRateLimit(
      `login:${ip}`,
      5,
      60_000
    );

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD env var is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        {
          status: 401,
          headers: { 'X-RateLimit-Remaining': String(remaining) },
        }
      );
    }

    const token = signToken(
      { admin: true, ts: Date.now(), jti: crypto.randomUUID() },
      adminPassword
    );

    (await cookies()).set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
