import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

// ── Helpers: replicate Stripe webhook signature verification logic ────────────

function generateStripeSignature(payload: string, secret: string, timestamp?: number): string {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;
  const sig = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${ts},v1=${sig}`;
}

function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
  tolerance = 300
): { valid: boolean; error?: string } {
  const parts = sigHeader.split(',');
  let timestamp = 0;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, val] = part.split('=');
    if (key === 't') timestamp = parseInt(val, 10);
    if (key === 'v1') signatures.push(val);
  }

  if (!timestamp || signatures.length === 0) {
    return { valid: false, error: 'Missing timestamp or signature' };
  }

  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) {
    return { valid: false, error: 'Timestamp outside tolerance' };
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  const matches = signatures.some((sig) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      return false;
    }
  });

  return matches ? { valid: true } : { valid: false, error: 'Signature mismatch' };
}

// ── Helpers: order & email extraction ────────────────────────────────────────

function extractOrderItems(metadata: { order_items?: string }): Array<{
  book_id: string;
  book_title: string;
  format: string;
  quantity: number;
}> {
  try {
    return JSON.parse(metadata.order_items || '[]');
  } catch {
    return [];
  }
}

function extractShippingAddress(session: {
  shipping_details?: {
    address?: {
      line1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}) {
  const addr = session.shipping_details?.address;
  if (!addr) return undefined;
  return {
    line1: addr.line1 || undefined,
    city: addr.city || undefined,
    state: addr.state || undefined,
    postal_code: addr.postal_code || undefined,
    country: addr.country || undefined,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Stripe Webhook — Signature Verification', () => {
  const WEBHOOK_SECRET = 'whsec_test_secret_123';

  it('validates a correctly signed payload', () => {
    const payload = JSON.stringify({ type: 'checkout.session.completed' });
    const sig = generateStripeSignature(payload, WEBHOOK_SECRET);
    const result = verifyStripeSignature(payload, sig, WEBHOOK_SECRET);
    expect(result.valid).toBe(true);
  });

  it('rejects a payload signed with wrong secret', () => {
    const payload = JSON.stringify({ type: 'checkout.session.completed' });
    const sig = generateStripeSignature(payload, 'wrong_secret');
    const result = verifyStripeSignature(payload, sig, WEBHOOK_SECRET);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Signature mismatch');
  });

  it('rejects a tampered payload', () => {
    const payload = JSON.stringify({ type: 'checkout.session.completed' });
    const sig = generateStripeSignature(payload, WEBHOOK_SECRET);
    const tampered = JSON.stringify({ type: 'charge.refunded' });
    const result = verifyStripeSignature(tampered, sig, WEBHOOK_SECRET);
    expect(result.valid).toBe(false);
  });

  it('rejects expired timestamps (>5 min)', () => {
    const payload = JSON.stringify({ type: 'checkout.session.completed' });
    const oldTs = Math.floor(Date.now() / 1000) - 400; // 6+ minutes ago
    const sig = generateStripeSignature(payload, WEBHOOK_SECRET, oldTs);
    const result = verifyStripeSignature(payload, sig, WEBHOOK_SECRET);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Timestamp outside tolerance');
  });

  it('accepts timestamps within tolerance', () => {
    const payload = JSON.stringify({ type: 'checkout.session.completed' });
    const recentTs = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
    const sig = generateStripeSignature(payload, WEBHOOK_SECRET, recentTs);
    const result = verifyStripeSignature(payload, sig, WEBHOOK_SECRET);
    expect(result.valid).toBe(true);
  });

  it('rejects malformed signature header', () => {
    const payload = JSON.stringify({ type: 'test' });
    const result = verifyStripeSignature(payload, 'garbage', WEBHOOK_SECRET);
    expect(result.valid).toBe(false);
  });

  it('rejects missing v1 signature', () => {
    const payload = JSON.stringify({ type: 'test' });
    const result = verifyStripeSignature(payload, 't=12345', WEBHOOK_SECRET);
    expect(result.valid).toBe(false);
  });
});

describe('Stripe Webhook — Order Item Extraction', () => {
  it('parses valid order items from metadata', () => {
    const metadata = {
      order_items: JSON.stringify([
        { book_id: 'abc123', book_title: 'Cybersecurity Guide', format: 'digital', quantity: 1 },
        { book_id: 'def456', book_title: 'AI Guide', format: 'paperback', quantity: 2 },
      ]),
    };
    const items = extractOrderItems(metadata);
    expect(items).toHaveLength(2);
    expect(items[0].book_title).toBe('Cybersecurity Guide');
    expect(items[1].quantity).toBe(2);
  });

  it('returns empty array for missing metadata', () => {
    expect(extractOrderItems({})).toEqual([]);
  });

  it('returns empty array for invalid JSON', () => {
    expect(extractOrderItems({ order_items: 'not json' })).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(extractOrderItems({ order_items: '' })).toEqual([]);
  });
});

describe('Stripe Webhook — Shipping Address', () => {
  it('extracts shipping address when present', () => {
    const session = {
      shipping_details: {
        address: {
          line1: '123 Main St',
          city: 'Bay St Louis',
          state: 'MS',
          postal_code: '39520',
          country: 'US',
        },
      },
    };
    const addr = extractShippingAddress(session);
    expect(addr).toEqual({
      line1: '123 Main St',
      city: 'Bay St Louis',
      state: 'MS',
      postal_code: '39520',
      country: 'US',
    });
  });

  it('returns undefined when no shipping details', () => {
    expect(extractShippingAddress({})).toBeUndefined();
  });

  it('handles partial address', () => {
    const session = {
      shipping_details: {
        address: {
          line1: '123 Main St',
          city: '',
          state: 'MS',
        },
      },
    };
    const addr = extractShippingAddress(session);
    expect(addr?.line1).toBe('123 Main St');
    expect(addr?.city).toBeUndefined(); // empty string → undefined
    expect(addr?.state).toBe('MS');
    expect(addr?.country).toBeUndefined();
  });
});

describe('Stripe Webhook — Digital vs Physical Filtering', () => {
  it('filters digital items for download token generation', () => {
    const items = [
      { book_id: 'a', format: 'digital', quantity: 1 },
      { book_id: 'b', format: 'paperback', quantity: 1 },
      { book_id: 'c', format: 'digital', quantity: 1 },
      { book_id: 'd', format: 'hardback', quantity: 2 },
    ];
    const digital = items.filter((i) => i.format === 'digital');
    expect(digital).toHaveLength(2);
    expect(digital.map((i) => i.book_id)).toEqual(['a', 'c']);
  });

  it('handles no digital items', () => {
    const items = [
      { book_id: 'a', format: 'paperback', quantity: 1 },
    ];
    const digital = items.filter((i) => i.format === 'digital');
    expect(digital).toHaveLength(0);
  });

  it('handles all digital items', () => {
    const items = [
      { book_id: 'a', format: 'digital', quantity: 1 },
      { book_id: 'b', format: 'digital', quantity: 1 },
    ];
    const digital = items.filter((i) => i.format === 'digital');
    expect(digital).toHaveLength(2);
  });
});
