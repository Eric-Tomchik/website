import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  (await cookies()).delete('admin_session');
  return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'https://erictomchik.com'));
}
