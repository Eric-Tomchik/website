import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/auth";

export const list = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.query("content_calendar").order("desc").collect();
  },
});

export const listByDateRange = query({
  args: { adminKey: v.string(), startDate: v.string(),
    endDate: v.string(), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const items = await ctx.db
      .query("content_calendar")
      .withIndex("by_date")
      .collect();
    return items.filter(
      (i) => i.scheduled_date >= args.startDate && i.scheduled_date <= args.endDate
    );
  },
});

export const create = mutation({
  args: { adminKey: v.string(), title: v.string(),
    content_type: v.union(
      v.literal("blog"),
      v.literal("social"),
      v.literal("email"),
      v.literal("video")
    ),
    target_keyword: v.optional(v.string()),
    scheduled_date: v.string(),
    status: v.union(
      v.literal("idea"),
      v.literal("writing"),
      v.literal("review"),
      v.literal("scheduled"),
      v.literal("published")
    ),
    assigned_to: v.optional(v.string()),
    blog_post_id: v.optional(v.id("blog_posts")),
    social_post_id: v.optional(v.id("social_posts")),
    notes: v.optional(v.string()), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.insert("content_calendar", args);
  },
});

export const update = mutation({
  args: { adminKey: v.string(), id: v.id("content_calendar"),
    title: v.optional(v.string()),
    content_type: v.optional(
      v.union(
        v.literal("blog"),
        v.literal("social"),
        v.literal("email"),
        v.literal("video")
      )
    ),
    target_keyword: v.optional(v.string()),
    scheduled_date: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("idea"),
        v.literal("writing"),
        v.literal("review"),
        v.literal("scheduled"),
        v.literal("published")
      )
    ),
    assigned_to: v.optional(v.string()),
    notes: v.optional(v.string()), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { id, adminKey: _adminKey, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("content_calendar") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
