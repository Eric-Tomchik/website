import { NextRequest, NextResponse } from 'next/server';
import { getRealtimeData, getHistoricalData } from '@/lib/google-analytics';

export const runtime = 'edge';

/**
 * GET /api/analytics?type=realtime|historical&days=30
 *
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
  const days = parseInt(searchParams.get('days') ?? '30', 10);

  try {
    if (type === 'realtime') {
      const data = await getRealtimeData();
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'private, max-age=30' },
      });
    }

    const data = await getHistoricalData(days);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    });
  } catch (err: any) {
    console.error('Analytics API error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Failed to fetch analytics' },
      { status: 500 },
    );
  }
}
