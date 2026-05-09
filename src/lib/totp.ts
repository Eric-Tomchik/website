/**
 * TOTP (Time-based One-Time Password) implementation — RFC 6238
 * No external dependencies. Uses Node.js crypto (available on Cloudflare Workers with compat).
 */
import crypto from 'crypto';

const TOTP_PERIOD = 30; // seconds
const TOTP_DIGITS = 6;

// Base32 alphabet (RFC 4648)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** Decode a base32-encoded string to a Buffer */
function base32Decode(encoded: string): Buffer {
  const cleaned = encoded.replace(/[\s=-]+/g, '').toUpperCase();
  let bits = '';
  for (const char of cleaned) {
    const val = BASE32_CHARS.indexOf(char);
    if (val === -1) throw new Error(`Invalid base32 character: ${char}`);
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/** Generate a random base32 secret (20 bytes = 160 bits) */
export function generateSecret(): string {
  const bytes = crypto.randomBytes(20);
  let result = '';
  let bits = '';
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0');
  }
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    result += BASE32_CHARS[parseInt(bits.slice(i, i + 5), 2)];
  }
  return result;
}

/** Generate HOTP code for a given counter (RFC 4226) */
function hotp(secret: Buffer, counter: bigint): string {
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(counter);

  const hmac = crypto.createHmac('sha1', secret).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % 10 ** TOTP_DIGITS).toString().padStart(TOTP_DIGITS, '0');
}

/** Generate a TOTP code for the current time (or a specific timestamp) */
export function generateTOTP(base32Secret: string, timestampMs?: number): string {
  const secret = base32Decode(base32Secret);
  const time = timestampMs ?? Date.now();
  const counter = BigInt(Math.floor(time / 1000 / TOTP_PERIOD));
  return hotp(secret, counter);
}

/**
 * Verify a TOTP code with a ±1 window (allows for clock drift).
 * Returns true if the code matches any of the 3 time steps.
 */
export function verifyTOTP(base32Secret: string, code: string): boolean {
  if (!code || code.length !== TOTP_DIGITS) return false;

  const secret = base32Decode(base32Secret);
  const now = Math.floor(Date.now() / 1000 / TOTP_PERIOD);

  for (let i = -1; i <= 1; i++) {
    const counter = BigInt(now + i);
    if (hotp(secret, counter) === code) return true;
  }
  return false;
}

/**
 * Generate an otpauth:// URI for QR code scanning.
 * Works with Google Authenticator, Authy, 1Password, etc.
 */
export function generateOTPAuthURI(
  base32Secret: string,
  accountName: string,
  issuer = 'EricTomchik Admin'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${base32Secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}

/** Check if 2FA is enabled (ADMIN_TOTP_SECRET env var is set) */
export function is2FAEnabled(): boolean {
  return !!process.env.ADMIN_TOTP_SECRET;
}
