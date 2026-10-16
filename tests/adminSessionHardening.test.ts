import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createAdminSessionToken, createConvexAdminCapability, verifyAdminSessionToken } from '../src/lib/adminSession';
import { bytesToHex, hmacSha256 } from '../convex/lib/hmac';

const original = { ...process.env };

describe('admin session hardening', () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = 'session-secret-that-is-independent';
    process.env.CONVEX_ADMIN_SESSION_SECRET = 'convex-capability-secret-independent';
    process.env.ADMIN_PASSWORD = 'password-must-not-sign-sessions';
  });
  afterEach(() => { process.env = { ...original }; });

  it('creates and verifies an admin session with the dedicated secret', () => {
    const token = createAdminSessionToken(1_800_000_000_000);
    expect(verifyAdminSessionToken(token, 1_800_000_000_001)).toBe(true);
  });

  it('invalidates a session when the signing secret changes', () => {
    const token = createAdminSessionToken();
    process.env.ADMIN_SESSION_SECRET = 'different-secret';
    expect(verifyAdminSessionToken(token)).toBe(false);
  });

  it('creates a scoped Convex capability instead of returning the master key', () => {
    process.env.CONVEX_AUTH_SECRET = 'MASTER-KEY-MUST-STAY-SERVER-SIDE';
    const token = createConvexAdminCapability(1_800_000_000_000);
    expect(token).not.toContain(process.env.CONVEX_AUTH_SECRET);
    const [version, expires, nonce, signature] = token.split('.');
    expect(version).toBe('v1');
    expect(Number(expires)).toBe(1_800_000_000_000 + 60 * 60 * 1000);
    expect(signature).toBe(bytesToHex(hmacSha256(process.env.CONVEX_ADMIN_SESSION_SECRET!, `${version}.${expires}.${nonce}`)));
  });
});
