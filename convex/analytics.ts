import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/auth";

/**
 * Get cached analytics data by type and period.
 */
export const get = query({
  args: { adminKey: v.string(), type: v.union(v.literal("realtime"), v.literal("historical")),
    period: v.optional(v.string()), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const cached = await ctx.db
      .query("analytics_cache")
      .withIndex("by_type_period", (q) =>
        q.eq("type", args.type).eq("period", args.period ?? "30")
      )
      .first();

    if (!cached) return null;

    return {
      data: JSON.parse(cached.data),
      fetched_at: cached.fetched_at,
    };
  },
});

/**
 * Update cached analytics data (called by Viktor cron).
 */
export const update = mutation({
  args: { adminKey: v.string(), type: v.union(v.literal("realtime"), v.literal("historical")),
    period: v.optional(v.string()),
    data: v.string(), // JSON string
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const period = args.period ?? (args.type === "realtime" ? "realtime" : "30");

    const existing = await ctx.db
      .query("analytics_cache")
      .withIndex("by_type_period", (q) =>
        q.eq("type", args.type).eq("period", period)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        data: args.data,
        fetched_at: Date.now(),
      });
    } else {
      await ctx.db.insert("analytics_cache", {
        type: args.type,
        period,
        data: args.data,
        fetched_at: Date.now(),
      });
    }
  },
});
