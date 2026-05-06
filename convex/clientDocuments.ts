import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.clientId) {
      const docs = await ctx.db
        .query("client_documents")
        .withIndex("by_client", (q) => q.eq("client_id", args.clientId!))
        .collect();
      if (args.category) return docs.filter((d) => d.category === args.category);
      return docs.sort((a, b) => b._creationTime - a._creationTime);
    }
    if (args.projectId) {
      return await ctx.db
        .query("client_documents")
        .withIndex("by_project", (q) => q.eq("project_id", args.projectId!))
        .collect();
    }
    const all = await ctx.db.query("client_documents").collect();
    return all.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const create = mutation({
  args: {
    client_id: v.id("clients"),
    project_id: v.optional(v.id("projects")),
    name: v.string(),
    category: v.union(
      v.literal("contract"),
      v.literal("invoice"),
      v.literal("proposal"),
      v.literal("deliverable"),
      v.literal("brief"),
      v.literal("other")
    ),
    file_url: v.optional(v.string()),
    storage_id: v.optional(v.string()),
    file_size_bytes: v.optional(v.number()),
    mime_type: v.optional(v.string()),
    notes: v.optional(v.string()),
    uploaded_by: v.union(v.literal("admin"), v.literal("client")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("client_documents", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("client_documents"),
    name: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("contract"),
        v.literal("invoice"),
        v.literal("proposal"),
        v.literal("deliverable"),
        v.literal("brief"),
        v.literal("other")
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("client_documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
