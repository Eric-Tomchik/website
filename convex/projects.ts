import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin, requireAdminOrPortal } from "./lib/auth";

export const list = query({
  args: { adminKey: v.optional(v.string()), portalToken: v.optional(v.string()), clientId: v.optional(v.id("clients")), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const auth = await requireAdminOrPortal(ctx, args.adminKey, args.portalToken);
    const clientId = auth.isAdmin ? args.clientId : auth.clientId;
    if (clientId) {
      const projects = await ctx.db.query("projects").withIndex("by_client", (q) => q.eq("client_id", clientId)).collect();
      return args.status ? projects.filter((p) => p.status === args.status) : projects;
    }
    if (args.status) return await ctx.db.query("projects").withIndex("by_status", (q) => q.eq("status", args.status as any)).collect();
    return await ctx.db.query("projects").collect();
  },
});

export const get = query({
  args: { adminKey: v.optional(v.string()), portalToken: v.optional(v.string()), id: v.id("projects") },
  handler: async (ctx, args) => {
    const auth = await requireAdminOrPortal(ctx, args.adminKey, args.portalToken);
    const project = await ctx.db.get(args.id);
    if (!project) return null;
    if (!auth.isAdmin && project.client_id !== auth.clientId) throw new Error("Unauthorized: project does not belong to this portal account");
    return project;
  },
});

export const create = mutation({
  args: { adminKey: v.string(), client_id: v.id("clients"), title: v.string(), description: v.optional(v.string()), service_tier: v.optional(v.union(v.literal("starter"),v.literal("business_pro"),v.literal("custom"))), status: v.optional(v.union(v.literal("discovery"),v.literal("proposal"),v.literal("in_progress"),v.literal("review"),v.literal("completed"),v.literal("on_hold"),v.literal("cancelled"))), start_date: v.optional(v.string()), target_date: v.optional(v.string()), budget_cents: v.optional(v.number()), live_url: v.optional(v.string()), repo_url: v.optional(v.string()) },
  handler: async (ctx, args) => { assertAdmin(args.adminKey); const { adminKey: _, ...data } = args; return await ctx.db.insert("projects", { ...data, status: args.status || "discovery", progress_percent: 0 }); },
});

export const update = mutation({
  args: { adminKey: v.string(), id: v.id("projects"), title: v.optional(v.string()), description: v.optional(v.string()), service_tier: v.optional(v.union(v.literal("starter"),v.literal("business_pro"),v.literal("custom"))), status: v.optional(v.union(v.literal("discovery"),v.literal("proposal"),v.literal("in_progress"),v.literal("review"),v.literal("completed"),v.literal("on_hold"),v.literal("cancelled"))), progress_percent: v.optional(v.number()), start_date: v.optional(v.string()), target_date: v.optional(v.string()), completed_date: v.optional(v.string()), budget_cents: v.optional(v.number()), paid_cents: v.optional(v.number()), live_url: v.optional(v.string()), repo_url: v.optional(v.string()) },
  handler: async (ctx, args) => { assertAdmin(args.adminKey); const { id, adminKey: _, ...updates } = args; const filtered: Record<string, unknown> = {}; for (const [k,val] of Object.entries(updates)) if (val !== undefined) filtered[k]=val; if (updates.status === "completed" && !updates.completed_date) { filtered.completed_date = new Date().toISOString().split("T")[0]; filtered.progress_percent=100; } await ctx.db.patch(id, filtered); },
});

export const remove = mutation({ args: { adminKey: v.string(), id: v.id("projects") }, handler: async (ctx,args) => { assertAdmin(args.adminKey); await ctx.db.delete(args.id); } });
