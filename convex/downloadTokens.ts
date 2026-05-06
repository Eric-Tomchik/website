import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Generate a unique download token for a purchased book
export const create = mutation({
  args: {
    book_id: v.string(),
    customer_email: v.string(),
    order_id: v.optional(v.string()),
    max_downloads: v.optional(v.number()),
    expires_hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const token =
      crypto.randomUUID().replace(/-/g, "") +
      crypto.randomUUID().replace(/-/g, "");

    const maxDownloads = args.max_downloads ?? 5;
    const expiresHours = args.expires_hours ?? 72;
    const expiresAt = Date.now() + expiresHours * 60 * 60 * 1000;

    const id = await ctx.db.insert("download_tokens", {
      token,
      book_id: args.book_id,
      customer_email: args.customer_email,
      order_id: args.order_id,
      download_count: 0,
      max_downloads: maxDownloads,
      expires_at: expiresAt,
    });

    return { token, id };
  },
});

// Validate a download token and return the book info if valid
export const validate = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("download_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!record) {
      return { valid: false, error: "Invalid download link." };
    }

    if (Date.now() > record.expires_at) {
      return { valid: false, error: "This download link has expired." };
    }

    if (record.download_count >= record.max_downloads) {
      return {
        valid: false,
        error: "Download limit reached. Please contact support.",
      };
    }

    // Get the book using typed Id
    const bookId = record.book_id as Id<"books">;
    const book = await ctx.db.get(bookId);
    if (!book) {
      return { valid: false, error: "Book not found." };
    }

    return {
      valid: true,
      book: {
        title: book.title,
        cover_image_url: book.cover_image_url,
        has_pdf: !!book.digital_pdf_storage_id,
        has_epub: !!book.digital_epub_storage_id,
      },
      downloads_remaining: record.max_downloads - record.download_count,
      expires_at: record.expires_at,
    };
  },
});

// Increment download count when a file is downloaded
export const recordDownload = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("download_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!record) return { success: false };

    if (
      Date.now() > record.expires_at ||
      record.download_count >= record.max_downloads
    ) {
      return { success: false };
    }

    await ctx.db.patch(record._id, {
      download_count: record.download_count + 1,
    });

    // Return the book so we can get the storage IDs
    const bookId = record.book_id as Id<"books">;
    const book = await ctx.db.get(bookId);
    if (!book) return { success: false };

    return {
      success: true,
      digital_pdf_storage_id: book.digital_pdf_storage_id,
      digital_epub_storage_id: book.digital_epub_storage_id,
      title: book.title,
      customer_email: record.customer_email,
      order_id: record.order_id || record.token,
    };
  },
});

// Generate a file upload URL (for admin to upload digital files)
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get a download URL for a stored file
export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const id = args.storageId as Id<"_storage">;
    return await ctx.storage.getUrl(id);
  },
});
