import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/auth";

export const subscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await ctx.db
      .query("newsletter_subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      // Reactivate if previously unsubscribed
      if (!existing.is_active) {
        await ctx.db.patch(existing._id, { is_active: true, subscribed_at: Date.now() });
        return { alreadySubscribed: false };
      }
      return { alreadySubscribed: true };
    }

    await ctx.db.insert("newsletter_subscribers", {
      email,
      subscribed_at: Date.now(),
      is_active: true,
    });

    return { alreadySubscribed: false };
  },
});

export const unsubscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const existing = await ctx.db
      .query("newsletter_subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { is_active: false });
    }
  },
});

export const listActive = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const subscribers = await ctx.db
      .query("newsletter_subscribers")
      .collect();
    return subscribers.filter((s) => s.is_active);
  },
});

export const listAll = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const subscribers = await ctx.db
      .query("newsletter_subscribers")
      .collect();
    subscribers.sort((a, b) => b.subscribed_at - a.subscribed_at);
    return subscribers;
  },
});

export const stats = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const all = await ctx.db.query("newsletter_subscribers").collect();
    const active = all.filter((s) => s.is_active);
    const last30d = active.filter(
      (s) => s.subscribed_at > Date.now() - 30 * 24 * 60 * 60 * 1000
    );
    return {
      total: all.length,
      active: active.length,
      inactive: all.length - active.length,
      last30d: last30d.length,
    };
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("newsletter_subscribers") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
