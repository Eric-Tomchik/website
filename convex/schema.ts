import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  books: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    long_description: v.optional(v.string()),
    price_cents: v.number(),
    paperback_price_cents: v.optional(v.number()),
    digital_price_cents: v.optional(v.number()),
    book_format: v.union(
      // Legacy values (kept for backward compat during migration)
      v.literal("physical"),
      v.literal("both"),
      // Current values
      v.literal("paperback"),
      v.literal("hardback"),
      v.literal("digital"),
      v.literal("paperback_digital"),
      v.literal("hardback_digital"),
      v.literal("paperback_hardback"),
      v.literal("all")
    ),
    cover_image_url: v.optional(v.string()),
    amazon_url: v.optional(v.string()),
    barnes_noble_url: v.optional(v.string()),
    companion_url: v.optional(v.string()),
    preview_pdf_url: v.optional(v.string()),
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
        format: v.union(
          v.literal("physical"),
          v.literal("paperback"),
          v.literal("hardback"),
          v.literal("digital")
        ),
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
    discount_code: v.optional(v.string()),
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
      v.union(
        v.literal("all"),
        v.literal("digital"),
        v.literal("physical"),
        v.literal("paperback"),
        v.literal("hardback")
      )
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

  // === Blog ===
  blog_posts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(), // Markdown or HTML
    cover_image_url: v.optional(v.string()),
    category: v.union(
      v.literal("business-credit"),
      v.literal("web-development"),
      v.literal("technology"),
      v.literal("cybersecurity"),
      v.literal("ai"),
      v.literal("general")
    ),
    tags: v.array(v.string()),
    is_published: v.boolean(),
    published_at: v.optional(v.number()),
    reading_time_minutes: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["is_published"])
    .index("by_category", ["category"]),

  // === Newsletter ===
  newsletter_subscribers: defineTable({
    email: v.string(),
    subscribed_at: v.number(),
    is_active: v.boolean(),
  })
    .index("by_email", ["email"]),

  // === Drip Sequences ===
  drip_sequences: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    trigger: v.union(v.literal("on_subscribe"), v.literal("manual")),
    is_active: v.boolean(),
    enrolled_count: v.number(),
    completed_count: v.number(),
    total_sent: v.number(),
  })
    .index("by_active", ["is_active"]),

  drip_steps: defineTable({
    sequence_id: v.id("drip_sequences"),
    step_order: v.number(),
    subject: v.string(),
    preview_text: v.optional(v.string()),
    content: v.string(), // HTML content
    delay_hours: v.number(), // hours after previous step (0 = immediate)
  })
    .index("by_sequence", ["sequence_id"]),

  drip_enrollments: defineTable({
    sequence_id: v.id("drip_sequences"),
    email: v.string(),
    current_step: v.number(), // 0-indexed, which step to send next
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("unsubscribed")
    ),
    enrolled_at: v.number(),
    next_send_at: v.number(), // timestamp when next email should be sent
    last_sent_at: v.optional(v.number()),
    emails_sent: v.number(),
  })
    .index("by_sequence", ["sequence_id"])
    .index("by_email", ["email"])
    .index("by_status_next", ["status", "next_send_at"])
    .index("by_sequence_email", ["sequence_id", "email"]),

  // === Email Broadcasts ===
  email_broadcasts: defineTable({
    subject: v.string(),
    preview_text: v.optional(v.string()),
    content: v.string(), // HTML content
    status: v.union(
      v.literal("draft"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("failed")
    ),
    recipient_count: v.number(),
    sent_count: v.number(),
    failed_count: v.number(),
    sent_at: v.optional(v.number()),
    error_message: v.optional(v.string()),
  })
    .index("by_status", ["status"]),

  // === Invoicing ===
  invoices: defineTable({
    client_id: v.optional(v.id("clients")),
    project_id: v.optional(v.id("projects")),
    invoice_number: v.string(),
    customer_name: v.string(),
    customer_email: v.string(),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unit_price_cents: v.number(),
      })
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
    paid_at: v.optional(v.number()),
    sent_at: v.optional(v.number()),
    notes: v.optional(v.string()),
    payment_method: v.optional(v.string()),
  })
    .index("by_client", ["client_id"])
    .index("by_status", ["status"])
    .index("by_invoice_number", ["invoice_number"]),

  // === Notifications ===
  notifications: defineTable({
    type: v.union(
      v.literal("order"),
      v.literal("ticket"),
      v.literal("contact"),
      v.literal("subscriber"),
      v.literal("invoice"),
      v.literal("client"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    is_read: v.boolean(),
    reference_id: v.optional(v.string()),
  })
    .index("by_read", ["is_read"]),

  // === Reviews & Testimonials ===
  reviews: defineTable({
    author_name: v.string(),
    author_title: v.optional(v.string()),
    author_image_url: v.optional(v.string()),
    content: v.string(),
    rating: v.number(), // 1-5
    source: v.union(
      v.literal("amazon"),
      v.literal("google"),
      v.literal("direct"),
      v.literal("social"),
      v.literal("other")
    ),
    source_url: v.optional(v.string()),
    book_id: v.optional(v.string()),
    project_id: v.optional(v.string()),
    is_featured: v.boolean(),
    is_active: v.boolean(),
  })
    .index("by_active", ["is_active"])
    .index("by_featured", ["is_featured"]),

  // === Site Settings ===
  site_settings: defineTable({
    key: v.string(),
    value: v.string(), // JSON-serialized value
  })
    .index("by_key", ["key"]),

  // === Audit Log ===
  audit_log: defineTable({
    actor: v.union(v.literal("admin"), v.literal("client"), v.literal("system")),
    actor_name: v.optional(v.string()),
    action: v.string(),
    entity_type: v.string(),
    entity_id: v.optional(v.string()),
    details: v.optional(v.string()), // JSON extra data
    ip_address: v.optional(v.string()),
  }),

  // === Media Library ===
  media_files: defineTable({
    name: v.string(),
    storage_id: v.string(),
    url: v.optional(v.string()),
    file_type: v.union(
      v.literal("image"),
      v.literal("pdf"),
      v.literal("document"),
      v.literal("video"),
      v.literal("other")
    ),
    mime_type: v.string(),
    file_size_bytes: v.number(),
    alt_text: v.optional(v.string()),
    folder: v.optional(v.string()),
    tags: v.array(v.string()),
    used_in: v.optional(v.array(v.string())),
  })
    .index("by_type", ["file_type"])
    .index("by_folder", ["folder"]),

  // === SEO ===
  seo_keywords: defineTable({
    keyword: v.string(),
    target_url: v.optional(v.string()),
    current_position: v.optional(v.number()),
    previous_position: v.optional(v.number()),
    search_volume: v.optional(v.number()),
    difficulty: v.optional(v.number()),
    status: v.union(
      v.literal("tracking"),
      v.literal("targeting"),
      v.literal("ranking"),
      v.literal("archived")
    ),
    notes: v.optional(v.string()),
    last_checked: v.optional(v.number()),
  })
    .index("by_status", ["status"]),

  content_calendar: defineTable({
    title: v.string(),
    content_type: v.union(
      v.literal("blog"),
      v.literal("social"),
      v.literal("email"),
      v.literal("video")
    ),
    target_keyword: v.optional(v.string()),
    scheduled_date: v.string(),
    status: v.union(
      v.literal("idea"),
      v.literal("writing"),
      v.literal("review"),
      v.literal("scheduled"),
      v.literal("published")
    ),
    assigned_to: v.optional(v.string()),
    blog_post_id: v.optional(v.id("blog_posts")),
    social_post_id: v.optional(v.id("social_posts")),
    notes: v.optional(v.string()),
  })
    .index("by_date", ["scheduled_date"])
    .index("by_status", ["status"]),

  // === Service Plans ===
  service_plans: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    features: v.array(v.string()),
    price_cents: v.number(),
    price_type: v.union(
      v.literal("fixed"),
      v.literal("starting_at"),
      v.literal("hourly"),
      v.literal("monthly")
    ),
    is_popular: v.boolean(),
    is_active: v.boolean(),
    sort_order: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["is_active"]),

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
