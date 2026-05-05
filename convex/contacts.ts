import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    const messages = await ctx.db.query("contact_messages").collect();
    messages.sort((a, b) => b._creationTime - a._creationTime);
    return messages;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    service_interest: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contact_messages", {
      ...args,
      is_read: false,
    });
  },
});

export const markRead = mutation({
  args: { id: v.id("contact_messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { is_read: true });
  },
});

export const unreadCount = query({
  handler: async (ctx) => {
    const messages = await ctx.db.query("contact_messages").collect();
    return messages.filter((m) => !m.is_read).length;
  },
});

export const remove = mutation({
  args: { id: v.id("contact_messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const markUnread = mutation({
  args: { id: v.id("contact_messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { is_read: false });
  },
});
