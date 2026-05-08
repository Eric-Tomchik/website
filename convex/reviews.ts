import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("reviews").order("desc").collect();
  },
});

export const listActive = query({
  handler: async (ctx) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .collect();
    return reviews;
  },
});

export const listFeatured = query({
  handler: async (ctx) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_featured", (q) => q.eq("is_featured", true))
      .collect();
    return reviews.filter((r) => r.is_active);
  },
});

export const stats = query({
  handler: async (ctx) => {
    const reviews = await ctx.db.query("reviews").collect();
    const active = reviews.filter((r) => r.is_active);
    const avgRating =
      active.length > 0
        ? active.reduce((sum, r) => sum + r.rating, 0) / active.length
        : 0;
    const bySource = active.reduce(
      (acc, r) => {
        acc[r.source] = (acc[r.source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return {
      total: reviews.length,
      active: active.length,
      featured: active.filter((r) => r.is_featured).length,
      avgRating: Math.round(avgRating * 10) / 10,
      bySource,
    };
  },
});

export const create = mutation({
  args: {
    author_name: v.string(),
    author_title: v.optional(v.string()),
    author_image_url: v.optional(v.string()),
    content: v.string(),
    rating: v.number(),
    source: v.union(
      v.literal("amazon"),
      v.literal("google"),
      v.literal("direct"),
      v.literal("social"),
      v.literal("other")
    ),
    source_url: v.optional(v.string()),
    book_id: v.optional(v.string()),
    project_id: v.optional(v.string()),
    is_featured: v.boolean(),
    is_active: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reviews", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("reviews"),
    author_name: v.optional(v.string()),
    author_title: v.optional(v.string()),
    author_image_url: v.optional(v.string()),
    content: v.optional(v.string()),
    rating: v.optional(v.number()),
    source: v.optional(
      v.union(
        v.literal("amazon"),
        v.literal("google"),
        v.literal("direct"),
        v.literal("social"),
        v.literal("other")
      )
    ),
    source_url: v.optional(v.string()),
    book_id: v.optional(v.string()),
    project_id: v.optional(v.string()),
    is_featured: v.optional(v.boolean()),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
