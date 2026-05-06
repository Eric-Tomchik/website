import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("scheduled"),
        v.literal("published"),
        v.literal("failed")
      )
    ),
    campaignId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let posts;
    if (args.status) {
      posts = await ctx.db
        .query("social_posts")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else if (args.campaignId) {
      posts = await ctx.db
        .query("social_posts")
        .withIndex("by_campaign", (q) =>
          q.eq("campaign_id", args.campaignId as any)
        )
        .collect();
    } else {
      posts = await ctx.db.query("social_posts").collect();
    }
    return posts.sort(
      (a, b) =>
        (b.scheduled_at ?? b._creationTime) -
        (a.scheduled_at ?? a._creationTime)
    );
  },
});

export const get = query({
  args: { id: v.id("social_posts") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const upcoming = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const posts = await ctx.db
      .query("social_posts")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .collect();
    return posts
      .filter((p) => p.scheduled_at && p.scheduled_at > now)
      .sort((a, b) => (a.scheduled_at ?? 0) - (b.scheduled_at ?? 0));
  },
});

export const counts = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("social_posts").collect();
    return {
      draft: all.filter((p) => p.status === "draft").length,
      scheduled: all.filter((p) => p.status === "scheduled").length,
      published: all.filter((p) => p.status === "published").length,
      total: all.length,
    };
  },
});

// ── Mutations ──

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    content: v.string(),
    image_url: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    platforms: v.array(
      v.union(
        v.literal("facebook"),
        v.literal("instagram"),
        v.literal("x"),
        v.literal("linkedin"),
        v.literal("tiktok")
      )
    ),
    hashtags: v.array(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published")
    ),
    post_type: v.union(
      v.literal("post"),
      v.literal("ad"),
      v.literal("story"),
      v.literal("reel")
    ),
    campaign_id: v.optional(v.id("social_campaigns")),
    scheduled_at: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("social_posts", {
      ...args,
      published_at: args.status === "published" ? Date.now() : undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("social_posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    image_url: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    platforms: v.optional(
      v.array(
        v.union(
          v.literal("facebook"),
          v.literal("instagram"),
          v.literal("x"),
          v.literal("linkedin"),
          v.literal("tiktok")
        )
      )
    ),
    hashtags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("scheduled"),
        v.literal("published"),
        v.literal("failed")
      )
    ),
    post_type: v.optional(
      v.union(
        v.literal("post"),
        v.literal("ad"),
        v.literal("story"),
        v.literal("reel")
      )
    ),
    campaign_id: v.optional(v.id("social_campaigns")),
    scheduled_at: v.optional(v.number()),
    notes: v.optional(v.string()),
    platform_links: v.optional(
      v.object({
        facebook: v.optional(v.string()),
        instagram: v.optional(v.string()),
        x: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        tiktok: v.optional(v.string()),
      })
    ),
    metrics: v.optional(
      v.object({
        impressions: v.optional(v.number()),
        reach: v.optional(v.number()),
        likes: v.optional(v.number()),
        comments: v.optional(v.number()),
        shares: v.optional(v.number()),
        clicks: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Post not found");

    // Auto-set published_at when marking as published
    const updates: any = { ...fields };
    if (fields.status === "published" && existing.status !== "published") {
      updates.published_at = Date.now();
    }

    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("social_posts") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
