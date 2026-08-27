import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuth';
import { createConvexAdminCapability } from '@/lib/adminSession';

export async function POST(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  if (!session || !verifyAdminToken(session)) {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    response.cookies.delete('admin_session');
    response.cookies.delete('admin_ck');
    return response;
  }

  try {
    const response = NextResponse.json({ capability: createConvexAdminCapability() });
    response.cookies.set('admin_ck', response.clone ? '' : '', { maxAge: 0 });
    // Keep a cookie for backwards compatibility with already-rendered admin tabs.
    response.cookies.set('admin_ck', createConvexAdminCapability(), {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60,
      path: '/admin',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
}
