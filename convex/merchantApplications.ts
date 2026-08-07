import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/auth";

const statusValidator = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("signed"),
  v.literal("not_qualified"),
  v.literal("declined")
);

export const list = query({
  args: { adminKey: v.string(), status: v.optional(statusValidator) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    if (args.status) {
      return await ctx.db
        .query("merchant_applications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("merchant_applications").order("desc").collect();
  },
});

export const get = query({
  args: { adminKey: v.string(), id: v.id("merchant_applications") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.get(args.id);
  },
});

// Called from the public /become-a-merchant application form (no admin key required).
export const create = mutation({
  args: {
    business_name: v.string(),
    owner_name: v.string(),
    email: v.string(),
    phone: v.string(),
    industry: v.optional(v.string()),
    monthly_volume: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("merchant_applications", {
      ...args,
      status: "new",
    });
  },
});

export const updateStatus = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("merchant_applications"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { status: args.status });
    await ctx.db.insert("merchant_application_activities", {
      application_id: args.id,
      type: "status_change",
      note: `Status changed to "${args.status.replace("_", " ")}"`,
    });
  },
});

export const updateNotes = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("merchant_applications"),
    admin_notes: v.string(),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { admin_notes: args.admin_notes });
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("merchant_applications") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const activities = await ctx.db
      .query("merchant_application_activities")
      .withIndex("by_application", (q) => q.eq("application_id", args.id))
      .collect();
    for (const a of activities) {
      await ctx.db.delete(a._id);
    }
    await ctx.db.delete(args.id);
  },
});

export const counts = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const all = await ctx.db.query("merchant_applications").collect();
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
    const newOnes = await ctx.db
      .query("merchant_applications")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .collect();
    return newOnes.length;
  },
});

// ── Sales activity log (contact attempts, outcomes, notes) ──────────────────

export const listActivities = query({
  args: { adminKey: v.string(), applicationId: v.id("merchant_applications") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const activities = await ctx.db
      .query("merchant_application_activities")
      .withIndex("by_application", (q) => q.eq("application_id", args.applicationId))
      .collect();
    return activities.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const logActivity = mutation({
  args: {
    adminKey: v.string(),
    applicationId: v.id("merchant_applications"),
    type: v.union(v.literal("note"), v.literal("call"), v.literal("email")),
    outcome: v.optional(
      v.union(
        v.literal("reached"),
        v.literal("no_answer"),
        v.literal("voicemail"),
        v.literal("email_sent"),
        v.literal("scheduled"),
        v.literal("signed"),
        v.literal("not_interested"),
        v.literal("other")
      )
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.insert("merchant_application_activities", {
      application_id: args.applicationId,
      type: args.type,
      outcome: args.outcome,
      note: args.note,
    });
  },
});
