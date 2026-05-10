/**
 * Raw Convex HTTP helpers for server-side API routes.
 *
 * Uses direct HTTP calls instead of the typed `api.*` imports.
 * This avoids build failures when Convex types haven't been
 * regenerated yet (e.g. new modules not yet deployed).
 */

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

export async function convexQuery<T = any>(
  path: string,
  args: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status === 'error') {
    throw new Error(data.errorMessage ?? `Convex query ${path} failed`);
  }
  return data.value;
}

export async function convexMutation<T = any>(
  path: string,
  args: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status === 'error') {
    throw new Error(data.errorMessage ?? `Convex mutation ${path} failed`);
  }
  return data.value;
}
