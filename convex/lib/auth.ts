import { bytesToHex, constantTimeEqual, hmacSha256 } from "./hmac";

const ADMIN_CAPABILITY_PREFIX = "v1";

/**
 * Browser-facing admin access uses a short-lived capability signed with
 * CONVEX_ADMIN_SESSION_SECRET. The reusable CONVEX_AUTH_SECRET remains
 * server-only for trusted API routes, webhooks, and jobs.
 */
function isAdminCapability(value: string, secret: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== ADMIN_CAPABILITY_PREFIX) return false;
  const [, expiresRaw, nonce, signature] = parts;
  const expiresAt = Number(expiresRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;
  // Reject unexpectedly long-lived capabilities even if a signer is misconfigured.
  if (expiresAt - Date.now() > 8 * 24 * 60 * 60 * 1000) return false;
  if (!/^[a-f0-9]{32}$/i.test(nonce) || !/^[a-f0-9]{64}$/i.test(signature)) return false;

  const expected = bytesToHex(hmacSha256(secret, `${ADMIN_CAPABILITY_PREFIX}.${expiresRaw}.${nonce}`));
  return constantTimeEqual(signature.toLowerCase(), expected);
}

export function isAdmin(adminKey: string | undefined): boolean {
  if (!adminKey) return false;

  // Trusted server-to-server callers may continue using the master secret.
  const serverSecret = process.env.CONVEX_AUTH_SECRET;
  if (serverSecret && constantTimeEqual(adminKey, serverSecret)) return true;

  // Browser clients receive only a scoped, expiring capability.
  const sessionSecret = process.env.CONVEX_ADMIN_SESSION_SECRET;
  if (!sessionSecret) return false;
  return isAdminCapability(adminKey, sessionSecret);
}

export function assertAdmin(adminKey: string | undefined): void {
  if (!process.env.CONVEX_AUTH_SECRET && !process.env.CONVEX_ADMIN_SESSION_SECRET) {
    throw new Error("Server misconfigured: Convex admin authentication is not configured");
  }
  if (!isAdmin(adminKey)) throw new Error("Unauthorized: invalid admin credential");
}
