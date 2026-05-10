import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/debug — Check if GA4 credentials are accessible at runtime.
 * Protected by admin session cookie. Returns no secrets, just status.
 * DELETE THIS FILE after debugging.
 */
export async function GET(req: NextRequest) {
  // Only accessible from admin (session check)
  const session = req.cookies.get('admin_session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasSACreds = !!process.env.GOOGLE_SA_CREDENTIALS;
  const hasConvexAuth = !!process.env.CONVEX_AUTH_SECRET;
  const hasGA4Property = !!process.env.GA4_PROPERTY_ID;
  const hasConvexUrl = !!process.env.NEXT_PUBLIC_CONVEX_URL;

  let saCredsValid = false;
  let saEmail = '';
  let saKeyLength = 0;

  if (hasSACreds) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_SA_CREDENTIALS!);
      saCredsValid = !!(parsed.client_email && parsed.private_key);
      saEmail = parsed.client_email ? parsed.client_email.substring(0, 10) + '...' : 'missing';
      saKeyLength = parsed.private_key?.length ?? 0;
    } catch (e: any) {
      saEmail = `parse_error: ${e.message}`;
    }
  }

  return NextResponse.json({
    env: {
      GOOGLE_SA_CREDENTIALS: hasSACreds ? `present (valid: ${saCredsValid}, email: ${saEmail}, key_len: ${saKeyLength})` : 'MISSING',
      CONVEX_AUTH_SECRET: hasConvexAuth ? 'present' : 'MISSING',
      GA4_PROPERTY_ID: hasGA4Property ? process.env.GA4_PROPERTY_ID : 'MISSING',
      NEXT_PUBLIC_CONVEX_URL: hasConvexUrl ? 'present' : 'MISSING',
    },
    build_marker: '9d673b9',
  });
}
