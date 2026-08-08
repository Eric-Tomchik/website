'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode, useMemo } from 'react';

/**
 * Client-side Convex provider for the admin dashboard.
 *
 * The Convex React SDK needs a `ConvexReactClient` instance available in the
 * browser before any `useQuery` / `useMutation` / `useConvexQuery` hook can
 * connect. Without this wrapper somewhere in the admin route tree, the
 * dashboard pages render with zero Convex JavaScript and every live query
 * silently returns `undefined` — which is why the Merchant Applications
 * (and every other admin) list appeared empty even though the underlying
 * `useAdminQuery` calls were correct.
 *
 * The deployment URL is baked into the bundle at build time via
 * NEXT_PUBLIC_CONVEX_URL. If it is missing at build time, the client will
 * throw on first render — surface that loudly so it can't fail silently.
 */
export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  const client = useMemo(() => {
    if (!convexUrl) {
      throw new Error(
        'NEXT_PUBLIC_CONVEX_URL is not set. Add it to your Cloudflare Worker ' +
          'environment variables and rebuild the worker so the bundle picks it up.'
      );
    }
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
