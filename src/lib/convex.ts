import { ConvexHttpClient } from "convex/browser";

/**
 * Server-side Convex client for API routes and server actions.
 * Uses NEXT_PUBLIC_CONVEX_URL for the deployment URL.
 */
export function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}
