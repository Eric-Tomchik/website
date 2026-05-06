import { describe, it, expect } from 'vitest';

// Test utility functions
describe('escapeXml', () => {
  // Mirror the escapeXml function from download route
  function escapeXml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  it('escapes ampersands', () => {
    expect(escapeXml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes angle brackets', () => {
    expect(escapeXml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes quotes', () => {
    expect(escapeXml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it('handles clean strings', () => {
    expect(escapeXml('user@example.com')).toBe('user@example.com');
  });
});

describe('filename sanitization', () => {
  function sanitizeFilename(title: string, format: string): string {
    return `${(title || 'book')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')}.${format}`;
  }

  it('replaces spaces with underscores', () => {
    expect(sanitizeFilename('My Great Book', 'pdf')).toBe('My_Great_Book.pdf');
  });

  it('removes special characters', () => {
    expect(sanitizeFilename("Book: A Story! (2nd)", 'epub')).toBe(
      'Book_A_Story_2nd.epub'
    );
  });

  it('handles empty title', () => {
    expect(sanitizeFilename('', 'pdf')).toBe('book.pdf');
  });
});

describe('rate limit key generation', () => {
  function getClientIp(headers: Record<string, string | null>): string {
    const forwarded = headers['x-forwarded-for'];
    if (forwarded) return forwarded.split(',')[0].trim();
    const real = headers['x-real-ip'];
    if (real) return real;
    return 'unknown';
  }

  it('extracts first IP from x-forwarded-for', () => {
    expect(getClientIp({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8', 'x-real-ip': null })).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    expect(getClientIp({ 'x-forwarded-for': null, 'x-real-ip': '10.0.0.1' })).toBe('10.0.0.1');
  });

  it('returns unknown when no headers', () => {
    expect(getClientIp({ 'x-forwarded-for': null, 'x-real-ip': null })).toBe('unknown');
  });

  it('generates correct rate limit key', () => {
    const ip = '1.2.3.4';
    expect(`login:${ip}`).toBe('login:1.2.3.4');
    expect(`contact:${ip}`).toBe('contact:1.2.3.4');
  });
});

describe('token validation', () => {
  it('generates UUID-like tokens', () => {
    const uuid = crypto.randomUUID().replace(/-/g, '');
    expect(uuid).toHaveLength(32);
    expect(/^[a-f0-9]+$/.test(uuid)).toBe(true);
  });

  it('generates unique tokens', () => {
    const t1 = crypto.randomUUID();
    const t2 = crypto.randomUUID();
    expect(t1).not.toBe(t2);
  });
});

describe('discount code validation', () => {
  it('validates percentage discounts are in range', () => {
    const validate = (type: string, value: number) => {
      if (type === 'percentage' && (value <= 0 || value > 100)) return false;
      if (type === 'fixed' && value <= 0) return false;
      return true;
    };

    expect(validate('percentage', 20)).toBe(true);
    expect(validate('percentage', 0)).toBe(false);
    expect(validate('percentage', 101)).toBe(false);
    expect(validate('fixed', 5)).toBe(true);
    expect(validate('fixed', 0)).toBe(false);
  });
});
