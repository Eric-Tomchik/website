import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/auth";

export const list = query({
  args: { adminKey: v.optional(v.string()), projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Portal users can view milestones for their projects
    if (args.adminKey) assertAdmin(args.adminKey);
    const milestones = await ctx.db
      .query("project_milestones")
      .withIndex("by_project", (q) => q.eq("project_id", args.projectId))
      .collect();
    return milestones.sort((a, b) => a.sort_order - b.sort_order);
  },
});

export const create = mutation({
  args: { adminKey: v.string(), project_id: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    due_date: v.optional(v.string()),
    sort_order: v.optional(v.number()), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { adminKey: _adminKey, ...data } = args;
    const existing = await ctx.db
      .query("project_milestones")
      .withIndex("by_project", (q) => q.eq("project_id", args.project_id))
      .collect();

    return await ctx.db.insert("project_milestones", {
      ...data,
      status: "pending",
      sort_order: args.sort_order ?? existing.length,
    });
  },
});

export const update = mutation({
  args: { adminKey: v.string(), id: v.id("project_milestones"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed")
      )
    ),
    due_date: v.optional(v.string()),
    completed_date: v.optional(v.string()),
    sort_order: v.optional(v.number()), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { id, adminKey: _adminKey, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }
    if (updates.status === "completed" && !updates.completed_date) {
      filtered.completed_date = new Date().toISOString().split("T")[0];
    }
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("project_milestones") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
