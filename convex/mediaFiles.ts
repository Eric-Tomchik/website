import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    file_type: v.optional(
      v.union(
        v.literal("image"),
        v.literal("pdf"),
        v.literal("document"),
        v.literal("video"),
        v.literal("other")
      )
    ),
    folder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("media_files");
    if (args.file_type) {
      const files = await q.withIndex("by_type", (qb) => qb.eq("file_type", args.file_type!)).collect();
      files.sort((a, b) => b._creationTime - a._creationTime);
      return files;
    }
    if (args.folder) {
      const files = await q.withIndex("by_folder", (qb) => qb.eq("folder", args.folder!)).collect();
      files.sort((a, b) => b._creationTime - a._creationTime);
      return files;
    }
    const files = await q.order("desc").collect();
    return files;
  },
});

export const stats = query({
  handler: async (ctx) => {
    const files = await ctx.db.query("media_files").collect();
    const totalSize = files.reduce((sum, f) => sum + f.file_size_bytes, 0);
    const byType = files.reduce(
      (acc, f) => {
        acc[f.file_type] = (acc[f.file_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const folderSet = new Set<string>();
    for (const f of files) {
      if (f.folder) folderSet.add(f.folder);
    }
    const folders = Array.from(folderSet);
    return {
      total: files.length,
      totalSize,
      byType,
      folders: folders as string[],
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    storage_id: v.string(),
    url: v.optional(v.string()),
    file_type: v.union(
      v.literal("image"),
      v.literal("pdf"),
      v.literal("document"),
      v.literal("video"),
      v.literal("other")
    ),
    mime_type: v.string(),
    file_size_bytes: v.number(),
    alt_text: v.optional(v.string()),
    folder: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("media_files", {
      ...args,
      used_in: [],
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("media_files"),
    name: v.optional(v.string()),
    alt_text: v.optional(v.string()),
    folder: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("media_files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (file) {
      // Also delete from storage
      try {
        await ctx.storage.delete(file.storage_id as any);
      } catch {
        // Storage may already be deleted
      }
      await ctx.db.delete(args.id);
    }
  },
});
