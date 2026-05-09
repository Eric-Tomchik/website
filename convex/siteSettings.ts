import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/auth";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return setting ? JSON.parse(setting.value) : null;
  },
});

export const getAll = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const settings = await ctx.db.query("site_settings").collect();
    const result: Record<string, unknown> = {};
    for (const s of settings) {
      try {
        result[s.key] = JSON.parse(s.value);
      } catch {
        result[s.key] = s.value;
      }
    }
    return result;
  },
});

export const set = mutation({
  args: { adminKey: v.string(), key: v.string(),
    value: v.string(), // JSON-serialized },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const existing = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("site_settings", {
        key: args.key,
        value: args.value,
      });
    }
  },
});

export const setMany = mutation({
  args: { adminKey: v.string(), settings: v.array(
      v.object({
        key: v.string(),
        value: v.string(), })
    ),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    for (const { key, value } of args.settings) {
      const existing = await ctx.db
        .query("site_settings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { value });
      } else {
        await ctx.db.insert("site_settings", { key, value });
      }
    }
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), key: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const existing = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
