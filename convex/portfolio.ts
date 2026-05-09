import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/auth";

export const list = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let projects;
    if (args.activeOnly) {
      projects = await ctx.db
        .query("portfolio_projects")
        .withIndex("by_active", (q) => q.eq("is_active", true))
        .collect();
    } else {
      projects = await ctx.db.query("portfolio_projects").collect();
    }
    projects.sort((a, b) => a.sort_order - b.sort_order);
    return projects;
  },
});

export const create = mutation({
  args: { adminKey: v.string(), title: v.string(),
    slug: v.string(),
    description: v.string(),
    long_description: v.optional(v.string()),
    thumbnail_url: v.optional(v.string()),
    images: v.array(v.string()),
    live_url: v.optional(v.string()),
    github_url: v.optional(v.string()),
    technologies: v.array(v.string()),
    category: v.string(),
    is_featured: v.boolean(),
    is_active: v.boolean(),
    sort_order: v.number(), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.insert("portfolio_projects", args);
  },
});

export const update = mutation({
  args: { adminKey: v.string(), id: v.id("portfolio_projects"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    long_description: v.optional(v.string()),
    thumbnail_url: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    live_url: v.optional(v.string()),
    github_url: v.optional(v.string()),
    technologies: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    is_featured: v.optional(v.boolean()),
    is_active: v.optional(v.boolean()),
    sort_order: v.optional(v.number()), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { id, adminKey: _adminKey, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("portfolio_projects") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
