import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/auth";

export const list = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.query("seo_keywords").order("desc").collect();
  },
});

export const stats = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const keywords = await ctx.db.query("seo_keywords").collect();
    const tracking = keywords.filter((k) => k.status === "tracking");
    const targeting = keywords.filter((k) => k.status === "targeting");
    const ranking = keywords.filter((k) => k.status === "ranking");
    return {
      total: keywords.length,
      tracking: tracking.length,
      targeting: targeting.length,
      ranking: ranking.length,
    };
  },
});

export const create = mutation({
  args: { adminKey: v.string(), keyword: v.string(),
    target_url: v.optional(v.string()),
    current_position: v.optional(v.number()),
    search_volume: v.optional(v.number()),
    difficulty: v.optional(v.number()),
    status: v.union(
      v.literal("tracking"),
      v.literal("targeting"),
      v.literal("ranking"),
      v.literal("archived")
    ),
    notes: v.optional(v.string()), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { adminKey: _adminKey, ...data } = args;
    return await ctx.db.insert("seo_keywords", {
      ...data,
      previous_position: undefined,
      last_checked: Date.now(),
    });
  },
});

export const update = mutation({
  args: { adminKey: v.string(), id: v.id("seo_keywords"),
    keyword: v.optional(v.string()),
    target_url: v.optional(v.string()),
    current_position: v.optional(v.number()),
    search_volume: v.optional(v.number()),
    difficulty: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("tracking"),
        v.literal("targeting"),
        v.literal("ranking"),
        v.literal("archived")
      )
    ),
    notes: v.optional(v.string()), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { id, adminKey: _adminKey, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Keyword not found");

    const patch: Record<string, unknown> = { ...updates };
    // Track position changes
    if (updates.current_position !== undefined && existing.current_position !== undefined) {
      patch.previous_position = existing.current_position;
    }
    patch.last_checked = Date.now();

    return await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("seo_keywords") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
