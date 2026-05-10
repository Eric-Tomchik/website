"use client";

import { useCallback, useMemo } from "react";
import {
  useQuery as useConvexQuery,
  useMutation as useConvexMutation,
} from "convex/react";
import type { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";

/**
 * Read the admin auth key from the `admin_ck` cookie.
 *
 * ── SECURITY: Why admin_ck is intentionally non-httpOnly ──────────────────
 *
 * The `admin_ck` cookie stores CONVEX_AUTH_SECRET and is set with
 * `httpOnly: false` so that client-side JavaScript can read it. This is
 * required because the Convex React SDK (useQuery / useMutation) runs
 * entirely in the browser and needs the auth key to authenticate every
 * real-time query and mutation over its WebSocket connection.
 *
 * Making this cookie httpOnly would require:
 *  1. A server-side proxy route (e.g. /api/convex) that reads the key from
 *     the httpOnly cookie and forwards queries/mutations to Convex.
 *  2. Replacing useAdminQuery/useAdminMutation to call the proxy via fetch
 *     instead of the Convex client SDK.
 *  3. Giving up Convex's real-time WebSocket subscriptions on admin pages
 *     (everything becomes request/response through the proxy).
 *
 * Mitigations in place:
 *  • Strict Content-Security-Policy with per-request nonces (no 'unsafe-inline',
 *    no 'unsafe-eval') — blocks injected scripts from executing.
 *  • Third-party scripts (GA, Meta Pixel) loaded with crossOrigin="anonymous"
 *    and restricted to specific domains in script-src.
 *  • The cookie is Secure + SameSite=Lax, limiting network exposure.
 *  • Admin routes are behind TOTP 2FA + rate limiting.
 *  • The admin_session cookie (which gates route access) IS httpOnly.
 *
 * If real-time admin updates are ever dropped, refactor to httpOnly + proxy.
 * ──────────────────────────────────────────────────────────────────────────
 */
function getAdminKey(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)admin_ck=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

/**
 * Drop-in replacement for Convex `useQuery` that auto-injects `adminKey`.
 * Skips the query until the admin key is available.
 *
 * Usage: `const data = useAdminQuery(api.clients.list, {});`
 */
export function useAdminQuery<
  T extends FunctionReference<"query", "public", any, any>,
>(
  queryRef: T,
  args: Omit<FunctionArgs<T>, "adminKey"> | "skip"
): FunctionReturnType<T> | undefined {
  const adminKey = getAdminKey();
  const argsWithKey = useMemo(
    () => {
      if (args === "skip") return "skip" as const;
      return adminKey ? { ...args, adminKey } : "skip" as const;
    },
    // Serialize args to avoid infinite re-renders from object identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [adminKey, JSON.stringify(args)]
  );
  return useConvexQuery(queryRef, argsWithKey as any);
}

/**
 * Drop-in replacement for Convex `useMutation` that auto-injects `adminKey`.
 *
 * Usage:
 * ```
 * const doSomething = useAdminMutation(api.clients.create);
 * await doSomething({ name: "Acme", ... });
 * ```
 */
export function useAdminMutation<
  T extends FunctionReference<"mutation", "public", any, any>,
>(mutationRef: T) {
  const baseMutation = useConvexMutation(mutationRef);
  return useCallback(
    async (args: Omit<FunctionArgs<T>, "adminKey">) => {
      const adminKey = getAdminKey();
      if (!adminKey) throw new Error("Not authenticated");
      return baseMutation({ ...args, adminKey } as any);
    },
    [baseMutation]
  );
}
