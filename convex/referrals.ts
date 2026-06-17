import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/auth";

export const list = query({
  args: {
    adminKey: v.string(),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("qualified"),
        v.literal("signed"),
        v.literal("not_qualified"),
        v.literal("declined")
      )
    ),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    if (args.status) {
      return await ctx.db
        .query("referrals")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    const referrals = await ctx.db.query("referrals").order("desc").collect();
    return referrals;
  },
});

export const get = query({
  args: { adminKey: v.string(), id: v.id("referrals") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    business_name: v.string(),
    owner_name: v.string(),
    business_phone: v.string(),
    referrer_name: v.string(),
    referrer_phone: v.string(),
    referrer_email: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("referrals", {
      ...args,
      status: "new",
    });
  },
});

export const updateStatus = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("referrals"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("signed"),
      v.literal("not_qualified"),
      v.literal("declined")
    ),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateNotes = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("referrals"),
    admin_notes: v.string(),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { admin_notes: args.admin_notes });
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("referrals") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});

export const counts = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const all = await ctx.db.query("referrals").collect();
    const counts = {
      total: all.length,
      new: 0,
      contacted: 0,
      qualified: 0,
      signed: 0,
      not_qualified: 0,
      declined: 0,
    };
    for (const r of all) {
      counts[r.status]++;
    }
    return counts;
  },
});

export const newCount = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const newReferrals = await ctx.db
      .query("referrals")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .collect();
    return newReferrals.length;
  },
});
