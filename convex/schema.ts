import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  books: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    long_description: v.optional(v.string()),
    price_cents: v.number(),
    digital_price_cents: v.optional(v.number()),
    book_format: v.union(
      v.literal("physical"),
      v.literal("digital"),
      v.literal("both")
    ),
    cover_image_url: v.optional(v.string()),
    amazon_url: v.optional(v.string()),
    digital_file_url: v.optional(v.string()),
    digital_pdf_storage_id: v.optional(v.string()),
    digital_epub_storage_id: v.optional(v.string()),
    page_count: v.optional(v.number()),
    isbn: v.optional(v.string()),
    published_date: v.optional(v.string()),
    is_featured: v.boolean(),
    is_active: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["is_active"]),

  download_tokens: defineTable({
    token: v.string(),
    order_id: v.optional(v.string()),
    book_id: v.string(),
    customer_email: v.string(),
    download_count: v.number(),
    max_downloads: v.number(),
    expires_at: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_book_and_email", ["book_id", "customer_email"]),

  orders: defineTable({
    customer_email: v.string(),
    customer_name: v.string(),
    stripe_session_id: v.string(),
    stripe_payment_intent_id: v.optional(v.string()),
    items: v.array(
      v.object({
        book_id: v.string(),
        book_title: v.string(),
        format: v.union(v.literal("physical"), v.literal("digital")),
        quantity: v.number(),
        price_cents: v.optional(v.number()),
      })
    ),
    total_cents: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("fulfilled"),
      v.literal("refunded")
    ),
    shipping_address: v.optional(
      v.object({
        line1: v.optional(v.string()),
        line2: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        postal_code: v.optional(v.string()),
        country: v.optional(v.string()),
      })
    ),
    tracking_number: v.optional(v.string()),
  })
    .index("by_stripe_session", ["stripe_session_id"])
    .index("by_stripe_payment_intent", ["stripe_payment_intent_id"])
    .index("by_status", ["status"]),

  discount_codes: defineTable({
    code: v.string(),
    description: v.optional(v.string()),
    discount_type: v.union(v.literal("percentage"), v.literal("fixed")),
    discount_value: v.number(), // percentage (0-100) or fixed amount in cents
    min_order_cents: v.optional(v.number()),
    max_uses: v.optional(v.number()),
    current_uses: v.number(),
    expires_at: v.optional(v.number()),
    is_active: v.boolean(),
    applicable_book_ids: v.optional(v.array(v.string())), // empty = all books
    applicable_formats: v.optional(
      v.union(v.literal("all"), v.literal("digital"), v.literal("physical"))
    ),
  })
    .index("by_code", ["code"])
    .index("by_active", ["is_active"]),

  contact_messages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    service_interest: v.optional(v.string()),
    is_read: v.boolean(),
  }),

  portfolio_projects: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    long_description: v.optional(v.string()),
    thumbnail_url: v.optional(v.string()),
    images: v.array(v.string()),
    live_url: v.optional(v.string()),
    github_url: v.optional(v.string()),
    technologies: v.array(v.string()),
    category: v.string(),
    is_featured: v.boolean(),
    is_active: v.boolean(),
    sort_order: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["is_active"]),
});
