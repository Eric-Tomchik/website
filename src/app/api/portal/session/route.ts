import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('portal_session')?.value || null;
  return NextResponse.json({ token });
}

export async function POST(req: Request) {
  const { token } = await req.json();
  const cookieStore = await cookies();

  if (token) {
    cookieStore.set('portal_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
  } else {
    cookieStore.delete('portal_session');
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('portal_session');
  return NextResponse.json({ success: true });
}
