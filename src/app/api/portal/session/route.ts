import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Read directly from request cookies (works on Cloudflare Workers)
  const token = req.cookies.get('portal_session')?.value || null;
  return NextResponse.json({ token });
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
