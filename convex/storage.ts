import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a short-lived upload URL for the client to upload a file directly
 * to Convex storage. Call this first, then PUT the file to the returned URL,
 * then store the resulting storageId in your document record.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a download URL for a stored file.
 */
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete a file from storage.
 */
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
