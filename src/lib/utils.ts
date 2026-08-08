import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

// ── Book format helpers ──────────────────────────────────────────────
// Centralised logic so every page treats legacy ("physical"/"both") and
// new values identically.

export type BookFormat =
  | 'physical' | 'both'                          // legacy
  | 'paperback' | 'hardback' | 'digital'         // single-format
  | 'paperback_digital' | 'hardback_digital'     // two-format combos
  | 'paperback_hardback' | 'all';                // multi-format

export function hasHardback(fmt: string): boolean {
  return ['physical', 'both', 'hardback', 'hardback_digital', 'paperback_hardback', 'all'].includes(fmt);
}

export function hasPaperback(fmt: string): boolean {
  return ['paperback', 'paperback_digital', 'paperback_hardback', 'all'].includes(fmt);
}

export function hasDigital(fmt: string): boolean {
  return ['digital', 'both', 'paperback_digital', 'hardback_digital', 'all'].includes(fmt);
}

/** Convert three booleans → canonical BookFormat value */
export function toBookFormat(pb: boolean, hb: boolean, dg: boolean): BookFormat {
  if (pb && hb && dg) return 'all';
  if (pb && hb) return 'paperback_hardback';
  if (pb && dg) return 'paperback_digital';
  if (hb && dg) return 'hardback_digital';
  if (pb) return 'paperback';
  if (hb) return 'hardback';
  return 'digital'; // fallback
}

// ── Amazon affiliate helper ──────────────────────────────────────────
const AMAZON_ASSOCIATE_TAG = 'erictomchik-20';

/**
 * Append the Amazon Associates tag to an Amazon URL.
 * If the URL already contains a `tag` parameter it is replaced.
 */
export function withAmazonTag(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
    return u.toString();
  } catch {
    // If URL parsing fails, just append as query string
    return url + (url.includes('?') ? '&' : '?') + `tag=${AMAZON_ASSOCIATE_TAG}`;
  }
}

/** Human-readable label for a purchase format */
export function formatLabel(fmt: string): string {
  switch (fmt) {
    case 'paperback': return 'Paperback';
    case 'hardback':
    case 'physical': return 'Hardback';
    case 'digital': return 'Digital';
    default: return fmt.charAt(0).toUpperCase() + fmt.slice(1);
  }
}

/**
 * Build a tagged Amazon link for a recommended read.
 * With an ASIN we link straight to the product page; otherwise we use a
 * title+author search so the link never rots when editions change.
 */
export function amazonBookLink(title: string, author: string, asin?: string): string {
  if (asin) {
    return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}`;
  }
  const q = encodeURIComponent(`${title} ${author}`);
  return `https://www.amazon.com/s?k=${q}&i=stripbooks&tag=${AMAZON_ASSOCIATE_TAG}`;
}
