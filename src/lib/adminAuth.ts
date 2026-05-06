import crypto from 'crypto';

export function verifyAdminToken(
  token: string
): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 2) {
    // Legacy base64-only token — reject (forces re-login)
    return false;
  }

  const [data, signature] = parts;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return false;
    }
    const decoded = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (!decoded.admin) return false;

    // Reject tokens older than 7 days
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - decoded.ts > maxAge) return false;

    return true;
  } catch {
    return false;
  }
}
