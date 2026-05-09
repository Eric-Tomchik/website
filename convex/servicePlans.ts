import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { assertAdmin } from "./lib/auth";

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db
      .query("service_plans")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .collect();
    plans.sort((a, b) => a.sort_order - b.sort_order);
    return plans;
  },
});

export const listAll = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const plans = await ctx.db.query("service_plans").collect();
    plans.sort((a, b) => a.sort_order - b.sort_order);
    return plans;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("service_plans")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const create = mutation({
  args: { adminKey: v.string(), name: v.string(),
    slug: v.string(),
    description: v.string(),
    features: v.array(v.string()),
    price_cents: v.number(),
    price_type: v.union(
      v.literal("fixed"),
      v.literal("starting_at"),
      v.literal("hourly"),
      v.literal("monthly")
    ),
    is_popular: v.boolean(),
    is_active: v.boolean(),
    sort_order: v.number(), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.insert("service_plans", args);
  },
});

export const update = mutation({
  args: { adminKey: v.string(), id: v.id("service_plans"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    price_cents: v.optional(v.number()),
    price_type: v.optional(
      v.union(
        v.literal("fixed"),
        v.literal("starting_at"),
        v.literal("hourly"),
        v.literal("monthly")
      )
    ),
    is_popular: v.optional(v.boolean()),
    is_active: v.optional(v.boolean()),
    sort_order: v.optional(v.number()), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { id, adminKey: _adminKey, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Service plan not found");
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("service_plans") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
