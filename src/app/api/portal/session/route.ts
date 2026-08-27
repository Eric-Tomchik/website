import { NextRequest, NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_session')?.value || null;
  if (!token) return NextResponse.json({ token: null });

  try {
    const client = await getConvexClient().query(api.clients.validateSession, { token });
    if (!client) {
      const response = NextResponse.json({ token: null }, { status: 401 });
      response.cookies.delete('portal_session');
      return response;
    }
    return NextResponse.json({ token, client });
  } catch {
    // Authentication infrastructure failure must never be treated as success.
    return NextResponse.json({ token: null, error: 'Session validation unavailable' }, { status: 503 });
  }
}

// Session cookies are created only by the credential-verified login endpoint.
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('portal_session')?.value;
  if (token) {
    try { await getConvexClient().mutation(api.clients.logout, { token }); } catch {}
  }
  const response = NextResponse.json({ success: true });
  response.cookies.delete('portal_session');
  return response;
}
