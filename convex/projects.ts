import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { clientId: v.optional(v.id("clients")), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.clientId) {
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_client", (q) => q.eq("client_id", args.clientId!))
        .collect();
      if (args.status) return projects.filter((p) => p.status === args.status);
      return projects;
    }
    if (args.status) {
      return await ctx.db
        .query("projects")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    }
    return await ctx.db.query("projects").collect();
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    client_id: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    service_tier: v.optional(
      v.union(v.literal("starter"), v.literal("business_pro"), v.literal("custom"))
    ),
    status: v.optional(
      v.union(
        v.literal("discovery"),
        v.literal("proposal"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("completed"),
        v.literal("on_hold"),
        v.literal("cancelled")
      )
    ),
    start_date: v.optional(v.string()),
    target_date: v.optional(v.string()),
    budget_cents: v.optional(v.number()),
    live_url: v.optional(v.string()),
    repo_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      ...args,
      status: args.status || "discovery",
      progress_percent: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    service_tier: v.optional(
      v.union(v.literal("starter"), v.literal("business_pro"), v.literal("custom"))
    ),
    status: v.optional(
      v.union(
        v.literal("discovery"),
        v.literal("proposal"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("completed"),
        v.literal("on_hold"),
        v.literal("cancelled")
      )
    ),
    progress_percent: v.optional(v.number()),
    start_date: v.optional(v.string()),
    target_date: v.optional(v.string()),
    completed_date: v.optional(v.string()),
    budget_cents: v.optional(v.number()),
    paid_cents: v.optional(v.number()),
    live_url: v.optional(v.string()),
    repo_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }
    // Auto-set completed_date
    if (updates.status === "completed" && !updates.completed_date) {
      filtered.completed_date = new Date().toISOString().split("T")[0];
      filtered.progress_percent = 100;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
