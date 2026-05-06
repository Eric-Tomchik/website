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

  // === Client Portal & CRM ===
  clients: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    password_hash: v.string(),
    avatar_url: v.optional(v.string()),
    notes: v.optional(v.string()),
    is_active: v.boolean(),
    last_login_at: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_active", ["is_active"]),

  client_sessions: defineTable({
    client_id: v.id("clients"),
    token: v.string(),
    expires_at: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_client", ["client_id"]),

  projects: defineTable({
    client_id: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    service_tier: v.optional(
      v.union(v.literal("starter"), v.literal("business_pro"), v.literal("custom"))
    ),
    status: v.union(
      v.literal("discovery"),
      v.literal("proposal"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("completed"),
      v.literal("on_hold"),
      v.literal("cancelled")
    ),
    progress_percent: v.number(),
    start_date: v.optional(v.string()),
    target_date: v.optional(v.string()),
    completed_date: v.optional(v.string()),
    budget_cents: v.optional(v.number()),
    paid_cents: v.optional(v.number()),
    live_url: v.optional(v.string()),
    repo_url: v.optional(v.string()),
  })
    .index("by_client", ["client_id"])
    .index("by_status", ["status"]),

  tickets: defineTable({
    client_id: v.id("clients"),
    project_id: v.optional(v.id("projects")),
    subject: v.string(),
    category: v.union(
      v.literal("bug"),
      v.literal("feature_request"),
      v.literal("support"),
      v.literal("billing"),
      v.literal("general")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("waiting_on_client"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    resolved_at: v.optional(v.number()),
  })
    .index("by_client", ["client_id"])
    .index("by_project", ["project_id"])
    .index("by_status", ["status"]),

  ticket_messages: defineTable({
    ticket_id: v.id("tickets"),
    sender_type: v.union(v.literal("client"), v.literal("admin")),
    sender_name: v.string(),
    message: v.string(),
    attachment_url: v.optional(v.string()),
  })
    .index("by_ticket", ["ticket_id"]),

  client_documents: defineTable({
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
    // AI-generated document content (for contracts/invoices/quotes)
    generated_content: v.optional(v.string()),
    // Digital signature workflow
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
    signature_data: v.optional(v.string()),
    signed_at: v.optional(v.number()),
    signer_name: v.optional(v.string()),
    admin_signature_data: v.optional(v.string()),
    admin_signed_at: v.optional(v.number()),
    signed_storage_id: v.optional(v.string()),
    signer_ip: v.optional(v.string()),
    sent_for_signature_at: v.optional(v.number()),
  })
    .index("by_client", ["client_id"])
    .index("by_project", ["project_id"])
    .index("by_category", ["category"])
    .index("by_signature_token", ["signature_token"]),

  project_milestones: defineTable({
    project_id: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    due_date: v.optional(v.string()),
    completed_date: v.optional(v.string()),
    sort_order: v.number(),
  })
    .index("by_project", ["project_id"]),

  // === Social Media Marketing ===
  social_posts: defineTable({
    title: v.optional(v.string()),
    content: v.string(),
    image_url: v.optional(v.string()),
    image_storage_id: v.optional(v.string()),
    platforms: v.array(
      v.union(
        v.literal("facebook"),
        v.literal("instagram"),
        v.literal("x"),
        v.literal("linkedin"),
        v.literal("tiktok")
      )
    ),
    hashtags: v.array(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("failed")
    ),
    post_type: v.union(
      v.literal("post"),
      v.literal("ad"),
      v.literal("story"),
      v.literal("reel")
    ),
    campaign_id: v.optional(v.id("social_campaigns")),
    scheduled_at: v.optional(v.number()),
    published_at: v.optional(v.number()),
    notes: v.optional(v.string()),
    // Per-platform links after manual posting
    platform_links: v.optional(
      v.object({
        facebook: v.optional(v.string()),
        instagram: v.optional(v.string()),
        x: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        tiktok: v.optional(v.string()),
      })
    ),
    // Engagement metrics (manually entered or via API)
    metrics: v.optional(
      v.object({
        impressions: v.optional(v.number()),
        reach: v.optional(v.number()),
        likes: v.optional(v.number()),
        comments: v.optional(v.number()),
        shares: v.optional(v.number()),
        clicks: v.optional(v.number()),
      })
    ),
  })
    .index("by_status", ["status"])
    .index("by_campaign", ["campaign_id"])
    .index("by_scheduled", ["scheduled_at"]),

  social_campaigns: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
    start_date: v.optional(v.string()),
    end_date: v.optional(v.string()),
    budget_cents: v.optional(v.number()),
    spent_cents: v.optional(v.number()),
    goal: v.optional(v.string()),
    color: v.optional(v.string()),
  })
    .index("by_status", ["status"]),

  contact_messages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    service_interest: v.optional(v.string()),
    is_read: v.boolean(),
  }),

  rate_limits: defineTable({
    key: v.string(),
    count: v.number(),
    window_start: v.number(),
  })
    .index("by_key", ["key"]),

  analytics_cache: defineTable({
    type: v.union(v.literal("realtime"), v.literal("historical")),
    period: v.optional(v.string()), // "7", "30", "90" for historical
    data: v.string(), // JSON-serialized analytics data
    fetched_at: v.number(),
  })
    .index("by_type_period", ["type", "period"]),

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
