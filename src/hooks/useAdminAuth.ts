"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useQuery as useConvexQuery,
  useMutation as useConvexMutation,
} from "convex/react";
import type { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";

let cachedCapability = "";
let refreshPromise: Promise<string> | null = null;

function readCapabilityCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)admin_ck=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function capabilityExpiresSoon(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return true;
  const expiresAt = Number(parts[1]);
  return !Number.isSafeInteger(expiresAt) || expiresAt - Date.now() < 5 * 60_000;
}

async function refreshCapability(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch('/api/auth/capability', { method: 'POST', credentials: 'same-origin' })
    .then(async (res) => {
      if (!res.ok) throw new Error('Admin session expired');
      const data = await res.json();
      if (typeof data.capability !== 'string') throw new Error('Invalid admin capability');
      cachedCapability = data.capability;
      return cachedCapability;
    })
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

function useAdminCapability(): string {
  const [capability, setCapability] = useState(() => cachedCapability || readCapabilityCookie());

  useEffect(() => {
    let cancelled = false;
    const current = cachedCapability || readCapabilityCookie();
    if (current && !capabilityExpiresSoon(current)) {
      cachedCapability = current;
      setCapability(current);
      return;
    }
    refreshCapability()
      .then((value) => { if (!cancelled) setCapability(value); })
      .catch(() => { if (!cancelled) setCapability(""); });
    return () => { cancelled = true; };
  }, []);

  return capability;
}

export function useAdminQuery<
  T extends FunctionReference<"query", "public", any, any>,
>(
  queryRef: T,
  args: Omit<FunctionArgs<T>, "adminKey"> | "skip"
): FunctionReturnType<T> | undefined {
  const adminKey = useAdminCapability();
  const argsWithKey = useMemo(() => {
    if (args === "skip") return "skip" as const;
    return adminKey ? { ...args, adminKey } : "skip" as const;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey, JSON.stringify(args)]);
  return useConvexQuery(queryRef, argsWithKey as any);
}

export function useAdminMutation<
  T extends FunctionReference<"mutation", "public", any, any>,
>(mutationRef: T) {
  const baseMutation = useConvexMutation(mutationRef);
  return useCallback(async (args: Omit<FunctionArgs<T>, "adminKey">) => {
    let adminKey = cachedCapability || readCapabilityCookie();
    if (!adminKey || capabilityExpiresSoon(adminKey)) adminKey = await refreshCapability();
    return baseMutation({ ...args, adminKey } as any);
  }, [baseMutation]);
}
