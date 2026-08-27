import { bytesToHex, constantTimeEqual, hmacSha256 } from "./hmac";

const ADMIN_CAPABILITY_PREFIX = "v1";

function isAdminCapability(value: string, secret: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== ADMIN_CAPABILITY_PREFIX) return false;
  const [, expiresRaw, nonce, signature] = parts;
  const expiresAt = Number(expiresRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;
  if (expiresAt - Date.now() > 8 * 24 * 60 * 60 * 1000) return false;
  if (!/^[a-f0-9]{32}$/i.test(nonce) || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = bytesToHex(hmacSha256(secret, `${ADMIN_CAPABILITY_PREFIX}.${expiresRaw}.${nonce}`));
  return constantTimeEqual(signature.toLowerCase(), expected);
}

export function isAdmin(adminKey: string | undefined): boolean {
  if (!adminKey) return false;
  const serverSecret = process.env.CONVEX_AUTH_SECRET;
  if (serverSecret && constantTimeEqual(adminKey, serverSecret)) return true;
  const sessionSecret = process.env.CONVEX_ADMIN_SESSION_SECRET;
  return !!sessionSecret && isAdminCapability(adminKey, sessionSecret);
}

export function assertAdmin(adminKey: string | undefined): void {
  if (!process.env.CONVEX_AUTH_SECRET && !process.env.CONVEX_ADMIN_SESSION_SECRET) {
    throw new Error("Server misconfigured: Convex admin authentication is not configured");
  }
  if (!isAdmin(adminKey)) throw new Error("Unauthorized: invalid admin credential");
}

/** Resolve an opaque portal token to the active client it belongs to. */
export async function requirePortalClient(ctx: any, token: string | undefined): Promise<any> {
  if (!token) throw new Error("Unauthorized: portal session required");
  const session = await ctx.db.query("client_sessions").withIndex("by_token", (q: any) => q.eq("token", token)).first();
  if (!session || session.expires_at <= Date.now()) throw new Error("Unauthorized: invalid or expired portal session");
  const client = await ctx.db.get(session.client_id);
  if (!client || !client.is_active) throw new Error("Unauthorized: inactive portal account");
  return client;
}

export async function requireAdminOrPortal(ctx: any, adminKey?: string, portalToken?: string): Promise<{ isAdmin: boolean; clientId?: any }> {
  if (adminKey && isAdmin(adminKey)) return { isAdmin: true };
  const client = await requirePortalClient(ctx, portalToken);
  return { isAdmin: false, clientId: client._id };
}
