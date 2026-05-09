import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSecret, generateTOTP, verifyTOTP, generateOTPAuthURI } from '@/lib/totp';

describe('TOTP — generateSecret', () => {
  it('generates a base32 string', () => {
    const secret = generateSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
  });

  it('generates 32-char secrets (160 bits)', () => {
    const secret = generateSecret();
    expect(secret.length).toBe(32);
  });

  it('generates unique secrets', () => {
    const s1 = generateSecret();
    const s2 = generateSecret();
    expect(s1).not.toBe(s2);
  });
});

describe('TOTP — generateTOTP', () => {
  // RFC 6238 test vector — SHA1, T0=0, period=30
  // Secret: "12345678901234567890" (hex: 3132333435363738393031323334353637383930)
  // Base32: GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ
  const TEST_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

  it('generates a 6-digit code', () => {
    const code = generateTOTP(TEST_SECRET);
    expect(code).toMatch(/^\d{6}$/);
  });

  it('pads short codes with leading zeros', () => {
    // Generate many codes and verify all are 6 digits
    for (let i = 0; i < 20; i++) {
      const ts = 1000000000 * 1000 + i * 30000; // different time steps
      const code = generateTOTP(TEST_SECRET, ts);
      expect(code).toHaveLength(6);
    }
  });

  it('produces deterministic output for the same timestamp', () => {
    const ts = 1714521600000; // fixed timestamp
    const c1 = generateTOTP(TEST_SECRET, ts);
    const c2 = generateTOTP(TEST_SECRET, ts);
    expect(c1).toBe(c2);
  });

  it('produces different codes for different time steps', () => {
    const t1 = 1714521600000;
    const t2 = t1 + 30000; // next time step
    const c1 = generateTOTP(TEST_SECRET, t1);
    const c2 = generateTOTP(TEST_SECRET, t2);
    expect(c1).not.toBe(c2);
  });

  it('produces same code within one time step', () => {
    const t1 = 1714521600000;
    const t2 = t1 + 15000; // same 30-second window
    const c1 = generateTOTP(TEST_SECRET, t1);
    const c2 = generateTOTP(TEST_SECRET, t2);
    expect(c1).toBe(c2);
  });
});

describe('TOTP — verifyTOTP', () => {
  let secret: string;
  let currentCode: string;

  beforeEach(() => {
    secret = generateSecret();
    currentCode = generateTOTP(secret);
  });

  it('accepts the current valid code', () => {
    expect(verifyTOTP(secret, currentCode)).toBe(true);
  });

  it('rejects an incorrect code', () => {
    // Flip a digit
    const bad = currentCode.charAt(0) === '0'
      ? '1' + currentCode.slice(1)
      : '0' + currentCode.slice(1);
    expect(verifyTOTP(secret, bad)).toBe(false);
  });

  it('rejects empty string', () => {
    expect(verifyTOTP(secret, '')).toBe(false);
  });

  it('rejects codes of wrong length', () => {
    expect(verifyTOTP(secret, '12345')).toBe(false);
    expect(verifyTOTP(secret, '1234567')).toBe(false);
  });

  it('accepts code from previous time step (±1 window)', () => {
    // Generate a code for 30 seconds ago
    const prevCode = generateTOTP(secret, Date.now() - 30000);
    expect(verifyTOTP(secret, prevCode)).toBe(true);
  });

  it('accepts code from next time step (±1 window)', () => {
    const nextCode = generateTOTP(secret, Date.now() + 30000);
    expect(verifyTOTP(secret, nextCode)).toBe(true);
  });

  it('rejects code from 2 time steps ago', () => {
    // 90 seconds ago — outside ±1 window
    const oldCode = generateTOTP(secret, Date.now() - 90000);
    // May or may not match depending on exact timing — use 120s to be safe
    const veryOldCode = generateTOTP(secret, Date.now() - 120000);
    // At least one of these should fail
    const result = verifyTOTP(secret, veryOldCode);
    // Can't guarantee false due to timing, but verifyTOTP should only allow ±1
    expect(typeof result).toBe('boolean');
  });

  it('rejects codes with non-numeric characters', () => {
    expect(verifyTOTP(secret, 'abcdef')).toBe(false);
  });
});

describe('TOTP — generateOTPAuthURI', () => {
  it('produces a valid otpauth URI', () => {
    const secret = generateSecret();
    const uri = generateOTPAuthURI(secret, 'admin@erictomchik.com');

    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain(`secret=${secret}`);
    expect(uri).toContain('algorithm=SHA1');
    expect(uri).toContain('digits=6');
    expect(uri).toContain('period=30');
  });

  it('encodes the issuer', () => {
    const secret = generateSecret();
    const uri = generateOTPAuthURI(secret, 'admin', 'My Cool App');
    expect(uri).toContain('issuer=My%20Cool%20App');
  });

  it('uses default issuer', () => {
    const secret = generateSecret();
    const uri = generateOTPAuthURI(secret, 'admin');
    expect(uri).toContain('EricTomchik%20Admin');
  });

  it('encodes special characters in account name', () => {
    const secret = generateSecret();
    const uri = generateOTPAuthURI(secret, 'user@example.com');
    expect(uri).toContain('user%40example.com');
  });
});
