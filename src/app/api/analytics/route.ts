import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

/**
 * GET /api/analytics?type=realtime|historical&days=30
 *
 * Reads cached analytics data from Convex (populated by Viktor cron).
 * Protected: requires valid admin session cookie with HMAC verification.
 */
export async function GET(req: NextRequest) {
  // Verify admin session — check both presence AND HMAC signature
  const session = req.cookies.get('admin_session')?.value;
  if (!session || !verifyAdminToken(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'historical';
  const days = searchParams.get('days') ?? '30';

  try {
    // Query Convex for cached analytics data
    const period = type === 'realtime' ? 'realtime' : days;
    const convexRes = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'analytics:get',
        args: { type, period },
      }),
    });

    if (!convexRes.ok) {
      throw new Error(`Convex query failed: ${convexRes.status}`);
    }

    const result = await convexRes.json();

    if (!result.value) {
      return NextResponse.json(
        { error: 'No analytics data yet. Data syncs automatically every few minutes.' },
        { status: 404 },
      );
    }

    // data is stored as a JSON string in Convex — parse it
    const data =
      typeof result.value.data === 'string'
        ? JSON.parse(result.value.data)
        : result.value.data;

    return NextResponse.json(
      { ...data, _cachedAt: result.value.fetched_at },
      {
        headers: {
          'Cache-Control': type === 'realtime' ? 'private, max-age=30' : 'private, max-age=60',
        },
      },
    );
  } catch (err: any) {
    console.error('Analytics API error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Failed to fetch analytics' },
      { status: 500 },
    );
  }
}
