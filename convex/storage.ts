import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/auth";

export const generateUploadUrl = mutation({
  args: { adminKey: v.string() },
  handler: async (ctx,args) => { assertAdmin(args.adminKey); return await ctx.storage.generateUploadUrl(); },
});

// Signing links are capability URLs already; validate the document capability
// before minting a storage upload URL for the signed PDF.
export const generateSignatureUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx,args) => {
    const doc=await ctx.db.query("client_documents").withIndex("by_signature_token",q=>q.eq("signature_token",args.token)).first();
    if(!doc || doc.signature_status === "declined") throw new Error("Unauthorized signing token");
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = query({ args:{storageId:v.id("_storage")}, handler:async(ctx,args)=>await ctx.storage.getUrl(args.storageId) });
export const deleteFile = mutation({ args:{adminKey:v.string(),storageId:v.id("_storage")}, handler:async(ctx,args)=>{assertAdmin(args.adminKey);await ctx.storage.delete(args.storageId);} });
