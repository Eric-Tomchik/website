"use client";

import { useCallback, useMemo } from "react";
import {
  useQuery as useConvexQuery,
  useMutation as useConvexMutation,
} from "convex/react";
import type { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";

/**
 * Read the admin auth key from the `admin_ck` cookie.
 * This cookie is set (non-httpOnly) on successful admin login.
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
  args: Omit<FunctionArgs<T>, "adminKey">
): FunctionReturnType<T> | undefined {
  const adminKey = getAdminKey();
  const argsWithKey = useMemo(
    () => (adminKey ? { ...args, adminKey } : "skip" as const),
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
