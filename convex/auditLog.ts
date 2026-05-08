import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("audit_log").order("desc").collect();
    if (args.limit) return logs.slice(0, args.limit);
    return logs;
  },
});

export const create = mutation({
  args: {
    actor: v.union(v.literal("admin"), v.literal("client"), v.literal("system")),
    actor_name: v.optional(v.string()),
    action: v.string(),
    entity_type: v.string(),
    entity_id: v.optional(v.string()),
    details: v.optional(v.string()),
    ip_address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("audit_log", args);
  },
});

export const stats = query({
  handler: async (ctx) => {
    const logs = await ctx.db.query("audit_log").order("desc").collect();
    const last24h = logs.filter(
      (l) => l._creationTime > Date.now() - 24 * 60 * 60 * 1000
    );
    const last7d = logs.filter(
      (l) => l._creationTime > Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    const byActor = logs.reduce(
      (acc, l) => {
        acc[l.actor] = (acc[l.actor] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const byEntity = logs.reduce(
      (acc, l) => {
        acc[l.entity_type] = (acc[l.entity_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return {
      total: logs.length,
      last24h: last24h.length,
      last7d: last7d.length,
      byActor,
      byEntity,
    };
  },
});

export const clearOld = mutation({
  args: { olderThanDays: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanDays * 24 * 60 * 60 * 1000;
    const old = await ctx.db.query("audit_log").collect();
    let deleted = 0;
    for (const log of old) {
      if (log._creationTime < cutoff) {
        await ctx.db.delete(log._id);
        deleted++;
      }
    }
    return { deleted };
  },
});
