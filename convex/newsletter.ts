import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
  args: {},
  handler: async (ctx) => {
    const subscribers = await ctx.db
      .query("newsletter_subscribers")
      .collect();
    return subscribers.filter((s) => s.is_active);
  },
});
