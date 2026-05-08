import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .order("desc")
      .collect();
    if (args.limit) return notifications.slice(0, args.limit);
    return notifications;
  },
});

export const unreadCount = query({
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_read", (q) => q.eq("is_read", false))
      .collect();
    return unread.length;
  },
});

export const create = mutation({
  args: {
    type: v.union(
      v.literal("order"),
      v.literal("ticket"),
      v.literal("contact"),
      v.literal("subscriber"),
      v.literal("invoice"),
      v.literal("client"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    reference_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      is_read: false,
    });
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { is_read: true });
  },
});

export const markAllRead = mutation({
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_read", (q) => q.eq("is_read", false))
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { is_read: true });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const clearAll = mutation({
  handler: async (ctx) => {
    const all = await ctx.db.query("notifications").collect();
    for (const n of all) {
      await ctx.db.delete(n._id);
    }
  },
});
