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

export const getBySignatureToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("client_documents")
      .withIndex("by_signature_token", (q) => q.eq("signature_token", args.token))
      .first();
    if (!doc) return null;

    // Get client info for display
    const client = await ctx.db.get(doc.client_id);

    // Get file URL if stored in Convex
    let fileUrl = doc.file_url;
    if (doc.storage_id) {
      try {
        fileUrl = await ctx.storage.getUrl(doc.storage_id as any) ?? undefined;
      } catch {
        // storage_id might be invalid
      }
    }

    return { ...doc, file_url: fileUrl, client_name: client?.name, client_email: client?.email };
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
    file_type: v.optional(v.string()),
    mime_type: v.optional(v.string()),
    notes: v.optional(v.string()),
    uploaded_by: v.union(v.literal("admin"), v.literal("client")),
    generated_content: v.optional(v.string()),
    signature_status: v.optional(
      v.union(
        v.literal("not_required"),
        v.literal("pending"),
        v.literal("sent"),
        v.literal("viewed"),
        v.literal("signed"),
        v.literal("declined")
      )
    ),
    signature_token: v.optional(v.string()),
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
    file_url: v.optional(v.string()),
    storage_id: v.optional(v.string()),
    file_size_bytes: v.optional(v.number()),
    mime_type: v.optional(v.string()),
    generated_content: v.optional(v.string()),
    signature_status: v.optional(
      v.union(
        v.literal("not_required"),
        v.literal("pending"),
        v.literal("sent"),
        v.literal("viewed"),
        v.literal("signed"),
        v.literal("declined")
      )
    ),
    signature_token: v.optional(v.string()),
    sent_for_signature_at: v.optional(v.number()),
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

export const markViewed = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("client_documents")
      .withIndex("by_signature_token", (q) => q.eq("signature_token", args.token))
      .first();
    if (doc && doc.signature_status === "sent") {
      await ctx.db.patch(doc._id, { signature_status: "viewed" });
    }
  },
});

export const sign = mutation({
  args: {
    token: v.string(),
    signature_data: v.string(),
    signer_name: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("client_documents")
      .withIndex("by_signature_token", (q) => q.eq("signature_token", args.token))
      .first();
    if (!doc) throw new Error("Document not found");
    if (doc.signature_status === "signed") throw new Error("Already signed");
    if (doc.signature_status === "declined") throw new Error("Document was declined");

    await ctx.db.patch(doc._id, {
      signature_status: "signed",
      signature_data: args.signature_data,
      signed_at: Date.now(),
      signer_name: args.signer_name,
    });

    return { success: true };
  },
});

export const adminSign = mutation({
  args: {
    id: v.id("client_documents"),
    signature_data: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Document not found");
    await ctx.db.patch(args.id, {
      admin_signature_data: args.signature_data,
      admin_signed_at: Date.now(),
    });
    return { success: true };
  },
});

export const saveSignedPdf = mutation({
  args: {
    id: v.id("client_documents"),
    signed_storage_id: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      signed_storage_id: args.signed_storage_id,
    });
    return { success: true };
  },
});

export const decline = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("client_documents")
      .withIndex("by_signature_token", (q) => q.eq("signature_token", args.token))
      .first();
    if (!doc) throw new Error("Document not found");

    await ctx.db.patch(doc._id, { signature_status: "declined" });
    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("client_documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    // Clean up stored file
    if (doc?.storage_id) {
      try {
        await ctx.storage.delete(doc.storage_id as any);
      } catch {
        // ignore storage errors
      }
    }
    await ctx.db.delete(args.id);
  },
});
