import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listPublished = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("blog_posts")
      .withIndex("by_published", (q) => q.eq("is_published", true))
      .order("desc")
      .collect();
    
    // Sort by published_at descending
    posts.sort((a, b) => (b.published_at || 0) - (a.published_at || 0));
    
    if (args.limit) {
      return posts.slice(0, args.limit);
    }
    return posts;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blog_posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return post;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("blog_posts").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    cover_image_url: v.optional(v.string()),
    category: v.union(
      v.literal("business-credit"),
      v.literal("web-development"),
      v.literal("technology"),
      v.literal("cybersecurity"),
      v.literal("ai"),
      v.literal("general")
    ),
    tags: v.array(v.string()),
    is_published: v.boolean(),
    reading_time_minutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("blog_posts", {
      ...args,
      published_at: args.is_published ? Date.now() : undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("blog_posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    cover_image_url: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("business-credit"),
        v.literal("web-development"),
        v.literal("technology"),
        v.literal("cybersecurity"),
        v.literal("ai"),
        v.literal("general")
      )
    ),
    tags: v.optional(v.array(v.string())),
    is_published: v.optional(v.boolean()),
    reading_time_minutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Blog post not found");

    // Set published_at when first published
    const patch: Record<string, unknown> = { ...updates };
    if (updates.is_published && !existing.published_at) {
      patch.published_at = Date.now();
    }

    return await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("blog_posts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
