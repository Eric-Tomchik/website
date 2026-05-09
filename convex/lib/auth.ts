/**
 * Convex authentication helpers.
 *
 * Admin-only functions call `assertAdmin(args.adminKey)`.
 * Shared functions (admin + portal) call `assertAdminOrPortal(args.adminKey)`.
 */

/** Constant-time string comparison to prevent timing attacks */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validate that the caller has admin access.
 * Throws if the key is missing or doesn't match.
 */
export function assertAdmin(adminKey: string | undefined): void {
  const secret = process.env.CONVEX_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "Server misconfigured: CONVEX_AUTH_SECRET environment variable is not set"
    );
  }
  if (!adminKey || !constantTimeEqual(adminKey, secret)) {
    throw new Error("Unauthorized: invalid admin key");
  }
}

/**
 * Check if the caller is an authenticated admin.
 * Returns true/false without throwing.
 */
export function isAdmin(adminKey: string | undefined): boolean {
  const secret = process.env.CONVEX_AUTH_SECRET;
  if (!secret || !adminKey) return false;
  return constantTimeEqual(adminKey, secret);
}

/**
 * For shared functions (admin + portal): require either a valid admin key
 * OR a clientId (portal users scope data to their own client record).
 * Throws if neither is provided.
 */
export function assertAdminOrPortal(
  adminKey: string | undefined,
  clientId: string | undefined
): { isAdmin: boolean } {
  if (adminKey && isAdmin(adminKey)) {
    return { isAdmin: true };
  }
  if (clientId) {
    // Portal access — caller must have provided their clientId
    // (portal session validation happens at the API route level)
    return { isAdmin: false };
  }
  throw new Error("Unauthorized: admin key or client ID required");
}
