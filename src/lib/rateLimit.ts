// Simple in-memory rate limiter (per-instance; for distributed, use Upstash Redis)
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  // Clean expired entry
  if (entry && now > entry.resetAt) {
    attempts.delete(key);
  }

  const current = attempts.get(key);

  if (!current) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
  }

  if (current.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count++;
  return {
    allowed: true,
    remaining: maxAttempts - current.count,
    resetAt: current.resetAt,
  };
}

// Periodic cleanup of old entries (every 5 minutes)
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of attempts.entries()) {
      if (now > entry.resetAt) {
        attempts.delete(key);
      }
    }
  }, 5 * 60_000);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}
