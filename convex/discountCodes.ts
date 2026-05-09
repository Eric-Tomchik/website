import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/auth";

export const list = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const codes = await ctx.db.query("discount_codes").collect();
    codes.sort((a, b) => b._creationTime - a._creationTime);
    return codes;
  },
});

export const validate = query({
  args: {
    code: v.string(),
    book_id: v.optional(v.string()),
    format: v.optional(v.string()),
    order_total_cents: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const discount = await ctx.db
      .query("discount_codes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase().trim()))
      .first();

    if (!discount) return { valid: false, error: "Invalid discount code." };
    if (!discount.is_active) return { valid: false, error: "This code is no longer active." };
    if (discount.expires_at && Date.now() > discount.expires_at)
      return { valid: false, error: "This code has expired." };
    if (discount.max_uses && discount.current_uses >= discount.max_uses)
      return { valid: false, error: "This code has reached its usage limit." };
    if (
      discount.min_order_cents &&
      args.order_total_cents &&
      args.order_total_cents < discount.min_order_cents
    )
      return {
        valid: false,
        error: `Minimum order of $${(discount.min_order_cents / 100).toFixed(2)} required.`,
      };

    // Check book applicability
    if (
      discount.applicable_book_ids &&
      discount.applicable_book_ids.length > 0 &&
      args.book_id &&
      !discount.applicable_book_ids.includes(args.book_id)
    )
      return { valid: false, error: "This code doesn't apply to this book." };

    // Check format applicability
    if (
      discount.applicable_formats &&
      discount.applicable_formats !== "all" &&
      args.format &&
      discount.applicable_formats !== args.format
    )
      return { valid: false, error: `This code only applies to ${discount.applicable_formats} purchases.` };

    return {
      valid: true,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      description: discount.description,
    };
  },
});

export const apply = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const discount = await ctx.db
      .query("discount_codes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase().trim()))
      .first();

    if (!discount) return { success: false };

    // Atomic check: re-validate inside the mutation to prevent race conditions
    if (!discount.is_active) return { success: false };
    if (discount.expires_at && Date.now() > discount.expires_at)
      return { success: false };
    if (discount.max_uses && discount.current_uses >= discount.max_uses)
      return { success: false };

    await ctx.db.patch(discount._id, {
      current_uses: discount.current_uses + 1,
    });

    return { success: true };
  },
});

export const create = mutation({
  args: { adminKey: v.string(), code: v.string(),
    description: v.optional(v.string()),
    discount_type: v.union(v.literal("percentage"), v.literal("fixed")),
    discount_value: v.number(),
    min_order_cents: v.optional(v.number()),
    max_uses: v.optional(v.number()),
    expires_at: v.optional(v.number()),
    is_active: v.boolean(),
    applicable_book_ids: v.optional(v.array(v.string())),
    applicable_formats: v.optional(
      v.union(v.literal("all"), v.literal("digital"), v.literal("physical"), v.literal("paperback"), v.literal("hardback"))
    ), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { adminKey: _adminKey, ...data } = args;
    return await ctx.db.insert("discount_codes", {
      ...data,
      code: args.code.toUpperCase().trim(),
      current_uses: 0,
    });
  },
});

export const update = mutation({
  args: { adminKey: v.string(), id: v.id("discount_codes"),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    discount_type: v.optional(v.union(v.literal("percentage"), v.literal("fixed"))),
    discount_value: v.optional(v.number()),
    min_order_cents: v.optional(v.number()),
    max_uses: v.optional(v.number()),
    expires_at: v.optional(v.number()),
    is_active: v.optional(v.boolean()),
    applicable_book_ids: v.optional(v.array(v.string())),
    applicable_formats: v.optional(
      v.union(v.literal("all"), v.literal("digital"), v.literal("physical"), v.literal("paperback"), v.literal("hardback"))
    ), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { id, adminKey: _adminKey, ...updates } = args;
    const cleanUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = key === "code" ? (value as string).toUpperCase().trim() : value;
      }
    }
    await ctx.db.patch(id, cleanUpdates);
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("discount_codes") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});

/**
 * Atomically validate AND apply a discount code in a single transaction.
 * Prevents race conditions where two concurrent checkouts both pass validation
 * before either increments the usage count.
 */
export const validateAndApply = mutation({
  args: {
    code: v.string(),
    book_id: v.optional(v.string()),
    format: v.optional(v.string()),
    order_total_cents: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const discount = await ctx.db
      .query("discount_codes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase().trim()))
      .first();

    if (!discount) return { valid: false, error: "Invalid discount code." };
    if (!discount.is_active) return { valid: false, error: "This code is no longer active." };
    if (discount.expires_at && Date.now() > discount.expires_at)
      return { valid: false, error: "This code has expired." };
    if (discount.max_uses && discount.current_uses >= discount.max_uses)
      return { valid: false, error: "This code has reached its usage limit." };
    if (
      discount.min_order_cents &&
      args.order_total_cents &&
      args.order_total_cents < discount.min_order_cents
    )
      return {
        valid: false,
        error: `Minimum order of $${(discount.min_order_cents / 100).toFixed(2)} required.`,
      };

    if (
      discount.applicable_book_ids &&
      discount.applicable_book_ids.length > 0 &&
      args.book_id &&
      !discount.applicable_book_ids.includes(args.book_id)
    )
      return { valid: false, error: "This code doesn't apply to this book." };

    if (
      discount.applicable_formats &&
      discount.applicable_formats !== "all" &&
      args.format &&
      discount.applicable_formats !== args.format
    )
      return { valid: false, error: `This code only applies to ${discount.applicable_formats} purchases.` };

    // Atomically increment usage count within same transaction as validation
    await ctx.db.patch(discount._id, {
      current_uses: discount.current_uses + 1,
    });

    return {
      valid: true,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      description: discount.description,
    };
  },
});

/**
 * Release a previously reserved discount code usage (e.g. if checkout fails).
 */
export const release = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const discount = await ctx.db
      .query("discount_codes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase().trim()))
      .first();

    if (discount && discount.current_uses > 0) {
      await ctx.db.patch(discount._id, {
        current_uses: discount.current_uses - 1,
      });
    }
  },
});
