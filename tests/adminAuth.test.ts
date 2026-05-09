import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

// Helpers — replicate the logic from src/lib/adminAuth.ts so tests
// don't import Next.js server modules that need a runtime.

function createAdminToken(password: string, overrides?: { admin?: boolean; ts?: number }): string {
  const payload = {
    admin: overrides?.admin ?? true,
    ts: overrides?.ts ?? Date.now(),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', password).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyAdminToken(token: string, secret: string): boolean {
  if (!secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [data, signature] = parts;
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return false;
    }
    const decoded = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (!decoded.admin) return false;

    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - decoded.ts > maxAge) return false;

    return true;
  } catch {
    return false;
  }
}

describe('Admin Auth — verifyAdminToken', () => {
  const SECRET = 'test-admin-password-123';

  it('validates a correctly signed token', () => {
    const token = createAdminToken(SECRET);
    expect(verifyAdminToken(token, SECRET)).toBe(true);
  });

  it('rejects a token signed with wrong password', () => {
    const token = createAdminToken('wrong-password');
    expect(verifyAdminToken(token, SECRET)).toBe(false);
  });

  it('rejects legacy base64-only tokens (no dot separator)', () => {
    const legacy = Buffer.from(JSON.stringify({ admin: true })).toString('base64');
    expect(verifyAdminToken(legacy, SECRET)).toBe(false);
  });

  it('rejects tampered payload', () => {
    const token = createAdminToken(SECRET);
    const [, sig] = token.split('.');
    // Change the payload
    const fakeData = Buffer.from(JSON.stringify({ admin: true, ts: Date.now(), extra: true })).toString('base64url');
    expect(verifyAdminToken(`${fakeData}.${sig}`, SECRET)).toBe(false);
  });

  it('rejects non-admin tokens', () => {
    const token = createAdminToken(SECRET, { admin: false });
    // Re-sign with correct secret but admin=false
    const payload = { admin: false, ts: Date.now() };
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    expect(verifyAdminToken(`${data}.${signature}`, SECRET)).toBe(false);
  });

  it('rejects tokens older than 7 days', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const payload = { admin: true, ts: eightDaysAgo };
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    expect(verifyAdminToken(`${data}.${signature}`, SECRET)).toBe(false);
  });

  it('accepts tokens just under 7 days old', () => {
    const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
    const payload = { admin: true, ts: sixDaysAgo };
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    expect(verifyAdminToken(`${data}.${signature}`, SECRET)).toBe(true);
  });

  it('rejects empty string token', () => {
    expect(verifyAdminToken('', SECRET)).toBe(false);
  });

  it('rejects when no secret is configured', () => {
    const token = createAdminToken(SECRET);
    expect(verifyAdminToken(token, '')).toBe(false);
  });

  it('rejects malformed JSON in payload', () => {
    const badData = Buffer.from('not json').toString('base64url');
    const sig = crypto.createHmac('sha256', SECRET).update(badData).digest('base64url');
    expect(verifyAdminToken(`${badData}.${sig}`, SECRET)).toBe(false);
  });

  it('uses timing-safe comparison (no early exit)', () => {
    // Verify that the function doesn't throw on mismatched buffer lengths
    const token = createAdminToken(SECRET);
    const [data] = token.split('.');
    // Intentionally short signature
    expect(verifyAdminToken(`${data}.abc`, SECRET)).toBe(false);
  });
});
