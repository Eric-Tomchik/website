import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    activeOnly: v.optional(v.boolean()),
    format: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let books;
    if (args.activeOnly) {
      books = await ctx.db
        .query("books")
        .withIndex("by_active", (q) => q.eq("is_active", true))
        .collect();
    } else {
      books = await ctx.db.query("books").collect();
    }

    if (args.format) {
      books = books.filter((b) => b.book_format === args.format);
    }

    books.sort((a, b) => b._creationTime - a._creationTime);
    return books;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("books")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id("books")) },
  handler: async (ctx, args) => {
    const books = await Promise.all(
      args.ids.map((id) => ctx.db.get(id))
    );
    return books.filter(Boolean);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    long_description: v.optional(v.string()),
    price_cents: v.number(),
    book_format: v.union(
      v.literal("physical"),
      v.literal("digital"),
      v.literal("both")
    ),
    cover_image_url: v.optional(v.string()),
    amazon_url: v.optional(v.string()),
    digital_file_url: v.optional(v.string()),
    page_count: v.optional(v.number()),
    isbn: v.optional(v.string()),
    published_date: v.optional(v.string()),
    is_featured: v.boolean(),
    is_active: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("books", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("books"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    long_description: v.optional(v.string()),
    price_cents: v.optional(v.number()),
    book_format: v.optional(
      v.union(
        v.literal("physical"),
        v.literal("digital"),
        v.literal("both")
      )
    ),
    cover_image_url: v.optional(v.string()),
    amazon_url: v.optional(v.string()),
    digital_file_url: v.optional(v.string()),
    page_count: v.optional(v.number()),
    isbn: v.optional(v.string()),
    published_date: v.optional(v.string()),
    is_featured: v.optional(v.boolean()),
    is_active: v.optional(v.boolean()),
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
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
