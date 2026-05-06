import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const milestones = await ctx.db
      .query("project_milestones")
      .withIndex("by_project", (q) => q.eq("project_id", args.projectId))
      .collect();
    return milestones.sort((a, b) => a.sort_order - b.sort_order);
  },
});

export const create = mutation({
  args: {
    project_id: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    due_date: v.optional(v.string()),
    sort_order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("project_milestones")
      .withIndex("by_project", (q) => q.eq("project_id", args.project_id))
      .collect();

    return await ctx.db.insert("project_milestones", {
      ...args,
      status: "pending",
      sort_order: args.sort_order ?? existing.length,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("project_milestones"),
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
    sort_order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
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
  args: { id: v.id("project_milestones") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
