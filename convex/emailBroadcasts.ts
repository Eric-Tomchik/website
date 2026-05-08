import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const broadcasts = await ctx.db.query("email_broadcasts").order("desc").collect();
    return broadcasts;
  },
});

export const get = query({
  args: { id: v.id("email_broadcasts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    subject: v.string(),
    preview_text: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("email_broadcasts", {
      subject: args.subject,
      preview_text: args.preview_text,
      content: args.content,
      status: "draft",
      recipient_count: 0,
      sent_count: 0,
      failed_count: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("email_broadcasts"),
    subject: v.optional(v.string()),
    preview_text: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.status !== "draft") {
      throw new Error("Can only edit draft broadcasts");
    }
    // Filter out undefined values
    const filtered: Record<string, string> = {};
    if (updates.subject !== undefined) filtered.subject = updates.subject;
    if (updates.preview_text !== undefined) filtered.preview_text = updates.preview_text;
    if (updates.content !== undefined) filtered.content = updates.content;
    await ctx.db.patch(id, filtered);
  },
});

export const markSending = mutation({
  args: {
    id: v.id("email_broadcasts"),
    recipient_count: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "sending",
      recipient_count: args.recipient_count,
      sent_count: 0,
      failed_count: 0,
    });
  },
});

export const markSent = mutation({
  args: {
    id: v.id("email_broadcasts"),
    sent_count: v.number(),
    failed_count: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "sent",
      sent_count: args.sent_count,
      failed_count: args.failed_count,
      sent_at: Date.now(),
    });
  },
});

export const markFailed = mutation({
  args: {
    id: v.id("email_broadcasts"),
    error_message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "failed",
      error_message: args.error_message,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("email_broadcasts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("email_broadcasts").collect();
    const sent = all.filter((b) => b.status === "sent");
    const totalSent = sent.reduce((sum, b) => sum + b.sent_count, 0);
    return {
      total: all.length,
      drafts: all.filter((b) => b.status === "draft").length,
      sent: sent.length,
      totalEmailsSent: totalSent,
    };
  },
});
