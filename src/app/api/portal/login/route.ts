import { NextRequest, NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const convex = getConvexClient();
    const rateCheck = await convex.mutation(api.rateLimit.check, {
      key: `portal-login:${getClientIp(req)}`,
      maxAttempts: 5,
      windowMs: 60_000,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) },
      });
    }

    const result = await convex.mutation(api.clients.login, { email, password });
    const response = NextResponse.json({ token: result.token, client: result.client });
    response.cookies.set('portal_session', result.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (err: any) {
    const message = err?.message || '';
    if (message === 'Invalid email or password') return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
