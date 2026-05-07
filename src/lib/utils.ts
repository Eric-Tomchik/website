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
