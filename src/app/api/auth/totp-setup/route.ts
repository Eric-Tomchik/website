import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/adminAuth';
import { generateSecret, generateOTPAuthURI, is2FAEnabled } from '@/lib/totp';

/**
 * GET /api/auth/totp-setup
 * Returns a new TOTP secret and otpauth URI for setting up an authenticator app.
 * Only accessible to authenticated admins.
 */
export async function GET() {
  // Verify admin session
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!session?.value || !verifyAdminToken(session.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (is2FAEnabled()) {
    return NextResponse.json({
      enabled: true,
      message: '2FA is already configured. To change it, update the ADMIN_TOTP_SECRET environment variable.',
    });
  }

  // Generate a new secret
  const secret = generateSecret();
  const uri = generateOTPAuthURI(secret, 'admin@erictomchik.com');

  return NextResponse.json({
    enabled: false,
    secret,
    otpauth_uri: uri,
    instructions: [
      '1. Open your authenticator app (Google Authenticator, Authy, 1Password, etc.)',
      '2. Scan the QR code or manually enter the secret below',
      '3. Add ADMIN_TOTP_SECRET to your Cloudflare environment variables with the secret value',
      '4. Redeploy — 2FA will be active on next login',
    ],
  });
}
