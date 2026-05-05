import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    orders.sort((a, b) => b._creationTime - a._creationTime);
    return orders;
  },
});

export const newCount = query({
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    return orders.filter((o) => o.status === "paid").length;
  },
});

export const create = mutation({
  args: {
    customer_email: v.string(),
    customer_name: v.string(),
    stripe_session_id: v.string(),
    stripe_payment_intent_id: v.optional(v.string()),
    items: v.array(
      v.object({
        book_id: v.string(),
        book_title: v.string(),
        format: v.union(v.literal("physical"), v.literal("digital")),
        quantity: v.number(),
        price_cents: v.optional(v.number()),
      })
    ),
    total_cents: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("fulfilled"),
      v.literal("refunded")
    ),
    shipping_address: v.optional(
      v.object({
        line1: v.optional(v.string()),
        line2: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        postal_code: v.optional(v.string()),
        country: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", args);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("fulfilled"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateStatusByPaymentIntent = mutation({
  args: {
    stripe_payment_intent_id: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("fulfilled"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripe_payment_intent", (q) =>
        q.eq("stripe_payment_intent_id", args.stripe_payment_intent_id)
      )
      .first();
    if (order) {
      await ctx.db.patch(order._id, { status: args.status });
    }
  },
});
