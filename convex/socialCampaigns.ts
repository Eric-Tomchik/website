import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed")
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("social_campaigns")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }
    return await ctx.db.query("social_campaigns").collect();
  },
});

export const get = query({
  args: { id: v.id("social_campaigns") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const getWithStats = query({
  args: { id: v.id("social_campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) return null;

    const posts = await ctx.db
      .query("social_posts")
      .withIndex("by_campaign", (q) => q.eq("campaign_id", args.id))
      .collect();

    const totalMetrics = posts.reduce(
      (acc, p) => {
        if (p.metrics) {
          acc.impressions += p.metrics.impressions ?? 0;
          acc.reach += p.metrics.reach ?? 0;
          acc.likes += p.metrics.likes ?? 0;
          acc.comments += p.metrics.comments ?? 0;
          acc.shares += p.metrics.shares ?? 0;
          acc.clicks += p.metrics.clicks ?? 0;
        }
        return acc;
      },
      { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0, clicks: 0 }
    );

    return {
      ...campaign,
      post_count: posts.length,
      published_count: posts.filter((p) => p.status === "published").length,
      scheduled_count: posts.filter((p) => p.status === "scheduled").length,
      draft_count: posts.filter((p) => p.status === "draft").length,
      metrics: totalMetrics,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
    start_date: v.optional(v.string()),
    end_date: v.optional(v.string()),
    budget_cents: v.optional(v.number()),
    goal: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("social_campaigns", {
      ...args,
      spent_cents: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("social_campaigns"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed")
      )
    ),
    start_date: v.optional(v.string()),
    end_date: v.optional(v.string()),
    budget_cents: v.optional(v.number()),
    spent_cents: v.optional(v.number()),
    goal: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("social_campaigns") },
  handler: async (ctx, args) => {
    // Remove campaign reference from posts
    const posts = await ctx.db
      .query("social_posts")
      .withIndex("by_campaign", (q) => q.eq("campaign_id", args.id))
      .collect();
    for (const post of posts) {
      await ctx.db.patch(post._id, { campaign_id: undefined });
    }
    await ctx.db.delete(args.id);
  },
});
