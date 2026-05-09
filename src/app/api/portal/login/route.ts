import { NextRequest, NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const convex = getConvexClient();

    // Rate limit: 5 attempts per minute per IP
    const ip = getClientIp(req);
    const rateCheck = await convex.mutation(api.rateLimit.check, {
      key: `portal-login:${ip}`,
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
          },
        }
      );
    }

    // Authenticate via Convex
    const result = await convex.mutation(api.clients.login, {
      email,
      password,
    });

    return NextResponse.json({ token: result.token });
  } catch (err: any) {
    const message = err?.message || 'Login failed';

    // Don't leak internal details — only pass known auth errors
    if (message === 'Invalid email or password') {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
