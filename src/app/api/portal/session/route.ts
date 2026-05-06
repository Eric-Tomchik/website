import { NextRequest, NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';

export async function GET(req: NextRequest) {
  // Read directly from request cookies (works on Cloudflare Workers)
  const token = req.cookies.get('portal_session')?.value || null;

  if (!token) {
    return NextResponse.json({ token: null });
  }

  // Server-side validation: verify the token against Convex
  try {
    const convex = getConvexClient();
    const client = await convex.query(api.clients.validateSession, { token });

    if (!client) {
      // Token is invalid or expired — clear the cookie
      const response = NextResponse.json({ token: null });
      response.cookies.delete('portal_session');
      return response;
    }

    return NextResponse.json({ token });
  } catch {
    // If Convex is unreachable, return the token and let client-side handle it
    return NextResponse.json({ token });
  }
}

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const response = NextResponse.json({ success: true });

  if (token) {
    response.cookies.set('portal_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
  } else {
    response.cookies.delete('portal_session');
  }

  return response;
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('portal_session');
  return response;
}
