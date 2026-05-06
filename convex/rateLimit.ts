import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Distributed rate limiter backed by Convex.
 * Checks and increments atomically in a single transaction —
 * works correctly on serverless (Cloudflare Workers, etc.)
 * where in-memory state is per-instance and ephemeral.
 */
export const check = mutation({
  args: {
    key: v.string(),
    maxAttempts: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const entry = await ctx.db
      .query("rate_limits")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    // No entry or window expired — create fresh
    if (!entry || now - entry.window_start > args.windowMs) {
      if (entry) {
        await ctx.db.patch(entry._id, {
          count: 1,
          window_start: now,
        });
      } else {
        await ctx.db.insert("rate_limits", {
          key: args.key,
          count: 1,
          window_start: now,
        });
      }
      return {
        allowed: true,
        remaining: args.maxAttempts - 1,
        resetAt: now + args.windowMs,
      };
    }

    // Window is still active
    if (entry.count >= args.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.window_start + args.windowMs,
      };
    }

    // Increment count
    await ctx.db.patch(entry._id, { count: entry.count + 1 });

    return {
      allowed: true,
      remaining: args.maxAttempts - (entry.count + 1),
      resetAt: entry.window_start + args.windowMs,
    };
  },
});

/**
 * Clean up expired rate limit entries (call periodically or via cron).
 */
export const cleanup = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    // Default window is 60s, clean anything older than 5 minutes
    const cutoff = now - 5 * 60_000;
    const entries = await ctx.db.query("rate_limits").collect();
    let cleaned = 0;
    for (const entry of entries) {
      if (entry.window_start < cutoff) {
        await ctx.db.delete(entry._id);
        cleaned++;
      }
    }
    return { cleaned };
  },
});
