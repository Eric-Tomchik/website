import { NextRequest, NextResponse } from 'next/server';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

/**
 * GET /api/analytics?type=realtime|historical&days=30
 *
 * Reads cached analytics data from Convex (populated by Viktor cron).
 * Protected: requires valid admin session cookie.
 */
export async function GET(req: NextRequest) {
  // Verify admin session
  const session = req.cookies.get('admin_session')?.value;
  if (!session) {
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

    return NextResponse.json(
      { ...result.value.data, _cachedAt: result.value.fetched_at },
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
