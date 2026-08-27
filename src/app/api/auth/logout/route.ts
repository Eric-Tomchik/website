import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'https://erictomchik.com'));
  response.cookies.set('admin_session', '', { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 0, path: '/' });
  response.cookies.set('admin_ck', '', { httpOnly: false, secure: true, sameSite: 'strict', maxAge: 0, path: '/admin' });
  return response;
}
