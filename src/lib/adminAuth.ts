import { verifyAdminSessionToken } from './adminSession';

/**
 * Backwards-compatible public helper used by server components and API routes.
 * Session signing is intentionally independent of ADMIN_PASSWORD.
 */
export function verifyAdminToken(token: string): boolean {
  return verifyAdminSessionToken(token);
}
