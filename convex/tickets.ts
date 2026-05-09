import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin, assertAdminOrPortal } from "./lib/auth";

export const list = query({
  args: { adminKey: v.optional(v.string()), clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    status: v.optional(v.string()), },
  handler: async (ctx, args) => {
    const auth = assertAdminOrPortal(args.adminKey, args.clientId);
    if (!auth.isAdmin && !args.clientId) {
      throw new Error("Unauthorized: portal users must provide clientId");
    }
    if (args.clientId) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_client", (q) => q.eq("client_id", args.clientId!))
        .collect();
      if (args.status) return tickets.filter((t) => t.status === args.status);
      return tickets.sort((a, b) => b._creationTime - a._creationTime);
    }
    if (args.projectId) {
      return await ctx.db
        .query("tickets")
        .withIndex("by_project", (q) => q.eq("project_id", args.projectId!))
        .collect();
    }
    if (args.status) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
      return tickets.sort((a, b) => b._creationTime - a._creationTime);
    }
    const tickets = await ctx.db.query("tickets").collect();
    return tickets.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const get = query({
  args: { adminKey: v.optional(v.string()), id: v.id("tickets") },
  handler: async (ctx, args) => {
    // Portal users can view their own tickets (verified at UI level)
    if (args.adminKey) assertAdmin(args.adminKey);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: { adminKey: v.optional(v.string()), client_id: v.id("clients"),
    project_id: v.optional(v.id("projects")),
    subject: v.string(),
    category: v.union(
      v.literal("bug"),
      v.literal("feature_request"),
      v.literal("support"),
      v.literal("billing"),
      v.literal("general")
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    message: v.string(),
    sender_name: v.string(), },
  handler: async (ctx, args) => {
    // Portal users can create tickets for their own client_id
    if (args.adminKey) assertAdmin(args.adminKey);
    const { message, sender_name, adminKey: _ak, ...ticketData } = args;

    const ticketId = await ctx.db.insert("tickets", {
      ...ticketData,
      priority: args.priority || "medium",
      status: "open",
    });

    // Create the initial message
    await ctx.db.insert("ticket_messages", {
      ticket_id: ticketId,
      sender_type: "client",
      sender_name,
      message,
    });

    return ticketId;
  },
});

export const updateStatus = mutation({
  args: { adminKey: v.string(), id: v.id("tickets"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("waiting_on_client"),
      v.literal("resolved"),
      v.literal("closed")
    ), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const updates: Record<string, unknown> = { status: args.status };
    if (args.status === "resolved" || args.status === "closed") {
      updates.resolved_at = Date.now();
    }
    await ctx.db.patch(args.id, updates);
  },
});

export const updatePriority = mutation({
  args: { adminKey: v.string(), id: v.id("tickets"),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ), },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { priority: args.priority });
  },
});

// Messages
export const getMessages = query({
  args: { adminKey: v.optional(v.string()), ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    if (args.adminKey) assertAdmin(args.adminKey);
    return await ctx.db
      .query("ticket_messages")
      .withIndex("by_ticket", (q) => q.eq("ticket_id", args.ticketId))
      .collect();
  },
});

export const addMessage = mutation({
  args: { adminKey: v.optional(v.string()), ticket_id: v.id("tickets"),
    sender_type: v.union(v.literal("client"), v.literal("admin")),
    sender_name: v.string(),
    message: v.string(), },
  handler: async (ctx, args) => {
    // Portal users can add messages to their own tickets
    if (args.adminKey) assertAdmin(args.adminKey);
    const { adminKey: _ak, ...messageData } = args;
    await ctx.db.insert("ticket_messages", messageData);

    // Auto-update ticket status based on who replied
    const ticket = await ctx.db.get(args.ticket_id);
    if (ticket) {
      if (args.sender_type === "admin" && ticket.status === "open") {
        await ctx.db.patch(args.ticket_id, { status: "in_progress" });
      } else if (
        args.sender_type === "client" &&
        ticket.status === "waiting_on_client"
      ) {
        await ctx.db.patch(args.ticket_id, { status: "in_progress" });
      }
    }
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("tickets") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    // Delete all messages first
    const messages = await ctx.db
      .query("ticket_messages")
      .withIndex("by_ticket", (q) => q.eq("ticket_id", args.id))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    await ctx.db.delete(args.id);
  },
});

// Counts for dashboard
export const counts = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const all = await ctx.db.query("tickets").collect();
    return {
      total: all.length,
      open: all.filter((t) => t.status === "open").length,
      in_progress: all.filter((t) => t.status === "in_progress").length,
      waiting: all.filter((t) => t.status === "waiting_on_client").length,
      resolved: all.filter(
        (t) => t.status === "resolved" || t.status === "closed"
      ).length,
    };
  },
});
