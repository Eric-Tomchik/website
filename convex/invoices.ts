import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/auth";

export const list = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const invoices = await ctx.db.query("invoices").order("desc").collect();
    return invoices;
  },
});

export const getById = query({
  args: { adminKey: v.string(), id: v.id("invoices") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await ctx.db.get(args.id);
  },
});

export const stats = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const invoices = await ctx.db.query("invoices").collect();
    const total = invoices.length;
    const paid = invoices.filter((i) => i.status === "paid");
    const overdue = invoices.filter((i) => i.status === "overdue");
    const pending = invoices.filter((i) => i.status === "sent" || i.status === "viewed");
    const draft = invoices.filter((i) => i.status === "draft");

    const totalRevenue = paid.reduce((sum, i) => sum + i.total_cents, 0);
    const totalOutstanding = [...pending, ...overdue].reduce((sum, i) => sum + i.total_cents, 0);

    return {
      total,
      paid: paid.length,
      overdue: overdue.length,
      pending: pending.length,
      draft: draft.length,
      totalRevenue,
      totalOutstanding,
    };
  },
});

export const create = mutation({
  args: { adminKey: v.string(), client_id: v.optional(v.id("clients")),
    project_id: v.optional(v.id("projects")),
    invoice_number: v.string(),
    customer_name: v.string(),
    customer_email: v.string(),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unit_price_cents: v.number(), })
    ),
    subtotal_cents: v.number(),
    tax_cents: v.optional(v.number()),
    discount_cents: v.optional(v.number()),
    total_cents: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("viewed"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
    due_date: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { adminKey: _adminKey, ...data } = args;
    return await ctx.db.insert("invoices", {
      ...data,
      paid_at: undefined,
      sent_at: args.status === "sent" ? Date.now() : undefined,
      payment_method: undefined,
    });
  },
});

export const update = mutation({
  args: { adminKey: v.string(), id: v.id("invoices"),
    customer_name: v.optional(v.string()),
    customer_email: v.optional(v.string()),
    items: v.optional(
      v.array(
        v.object({
          description: v.string(),
          quantity: v.number(),
          unit_price_cents: v.number(), })
      )
    ),
    subtotal_cents: v.optional(v.number()),
    tax_cents: v.optional(v.number()),
    discount_cents: v.optional(v.number()),
    total_cents: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("viewed"),
        v.literal("paid"),
        v.literal("overdue"),
        v.literal("cancelled")
      )
    ),
    due_date: v.optional(v.string()),
    notes: v.optional(v.string()),
    payment_method: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { id, adminKey: _adminKey, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Invoice not found");

    const patch: Record<string, unknown> = { ...updates };
    if (updates.status === "paid" && existing.status !== "paid") {
      patch.paid_at = Date.now();
    }
    if (updates.status === "sent" && !existing.sent_at) {
      patch.sent_at = Date.now();
    }

    return await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { adminKey: v.string(), id: v.id("invoices") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});

export const nextInvoiceNumber = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const invoices = await ctx.db.query("invoices").collect();
    const maxNum = invoices.reduce((max, inv) => {
      const num = parseInt(inv.invoice_number.replace(/\D/g, ""), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return `INV-${String(maxNum + 1).padStart(4, "0")}`;
  },
});
