import crypto from 'crypto';

const ADMIN_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CONVEX_CAPABILITY_MAX_AGE_MS = 60 * 60 * 1000;

function sessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || null;
}

function convexCapabilitySecret(): string | null {
  return process.env.CONVEX_ADMIN_SESSION_SECRET || null;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function createAdminSessionToken(now = Date.now()): string {
  const secret = sessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  const data = Buffer.from(JSON.stringify({
    admin: true,
    iat: now,
    exp: now + ADMIN_SESSION_MAX_AGE_MS,
    jti: crypto.randomUUID(),
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyAdminSessionToken(token: string, now = Date.now()): boolean {
  const secret = sessionSecret();
  if (!secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [data, signature] = parts;
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  if (!safeEqual(signature, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as {
      admin?: boolean; iat?: number; exp?: number; jti?: string;
    };
    if (payload.admin !== true || !payload.jti) return false;
    if (!Number.isSafeInteger(payload.iat) || !Number.isSafeInteger(payload.exp)) return false;
    if (payload.iat! > now + 60_000 || payload.exp! <= now) return false;
    if (payload.exp! - payload.iat! > ADMIN_SESSION_MAX_AGE_MS) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Create the only credential exposed to admin browser JavaScript. It is scoped
 * to Convex admin calls, expires after one hour, and cannot reveal or derive
 * CONVEX_AUTH_SECRET.
 */
export function createConvexAdminCapability(now = Date.now()): string {
  const secret = convexCapabilitySecret();
  if (!secret) throw new Error('CONVEX_ADMIN_SESSION_SECRET is not configured');
  const expiresAt = now + CONVEX_CAPABILITY_MAX_AGE_MS;
  const nonce = crypto.randomBytes(16).toString('hex');
  const unsigned = `v1.${expiresAt}.${nonce}`;
  const signature = crypto.createHmac('sha256', secret).update(unsigned).digest('hex');
  return `${unsigned}.${signature}`;
}
