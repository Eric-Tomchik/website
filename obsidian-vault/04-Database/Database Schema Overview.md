# Database Schema Overview

> Backend: Convex (serverless, real-time)
> Schema file: `convex/schema.ts`
> Total tables: 25+

---

## Tables by Domain

### E-Commerce
| Table | Purpose | Key Fields |
|---|---|---|
| `books` | Book catalog | title, slug, description, prices, format, cover, ISBN, page_count |
| `orders` | Purchase orders | customer info, items[], total_cents, status, stripe_session_id, discount_code |
| `download_tokens` | Secure download links | token, book_id, email, expires_at, download_count, max_downloads |
| `discount_codes` | Promo codes | code, type (percentage/fixed), value, per-book/format targeting |

See [[E-Commerce Tables]] for full field details.

### CRM / Client Portal
| Table | Purpose | Key Fields |
|---|---|---|
| `clients` | Client records | name, email, company, phone, address, notes |
| `client_sessions` | Portal sessions | client_id, session_token, expires_at |
| `projects` | Client projects | title, description, client_id, status, progress_percent, budget |
| `project_milestones` | Project milestones | project_id, title, due_date, completed |
| `tickets` | Support tickets | subject, category, priority, status, client_id |
| `ticket_messages` | Ticket thread | ticket_id, sender, content, timestamp |
| `client_documents` | Shared documents | client_id, type, title, file_url, signature_status |

See [[CRM Tables]] for full field details.

### Content
| Table | Purpose | Key Fields |
|---|---|---|
| `blog_posts` | Blog articles | title, slug, content, category, tags, published_at |
| `contact_messages` | Contact form | name, email, subject, message, is_read |
| `reviews` | Testimonials | content, author, rating, approved |
| `portfolio_projects` | Portfolio showcase | title, description, url, client, screenshot |
| `service_plans` | Service offerings | name, description, features, pricing |
| `content_calendar` | Content planning | title, type, scheduled_date, status |
| `seo_keywords` | SEO tracking | keyword, search_volume, position, url |
| `media_files` | Media library | filename, url, type, size |

See [[Content Tables]] for full field details.

### Marketing
| Table | Purpose | Key Fields |
|---|---|---|
| `newsletter_subscribers` | Email list | email, subscribed_at, is_active |
| `drip_sequences` | Drip campaigns | name, trigger_type, active |
| `drip_steps` | Campaign steps | sequence_id, step_number, subject, body, delay |
| `drip_enrollments` | User enrollments | subscriber_id, sequence_id, current_step, status |
| `email_broadcasts` | Bulk emails | subject, body, sent_at, recipient_count |
| `social_posts` | Social media | content, platform, scheduled_at, status |
| `social_campaigns` | Social campaigns | name, posts[], date_range |

See [[Marketing Tables]] for full field details.

### System
| Table | Purpose | Key Fields |
|---|---|---|
| `invoices` | Client invoices | client_id, items[], total, status, due_date |
| `analytics_cache` | GA4 cache | key, data, fetched_at |
| `rate_limits` | Rate limiting | key, count, window_start |
| `notifications` | Admin notifications | type, title, message, read |
| `audit_log` | Action log | action, entity_type, entity_id, details |
| `site_settings` | Global config | key, value |

See [[System Tables]] for full field details.

---

## Indexes
Key indexes defined in schema:
- `books.by_slug` — for URL routing
- `books.by_active` — for catalog filtering
- `blog_posts.by_slug` — for URL routing
- `newsletter_subscribers.by_email` — for dedup
- Various `by_client_id` indexes on CRM tables

## Cron Jobs
| Job | Schedule | Function |
|---|---|---|
| Rate limit cleanup | Every 1 hour | `internal.rateLimit.cleanup` |

---

## Related
- [[E-Commerce Tables]]
- [[CRM Tables]]
- [[Content Tables]]
- [[Marketing Tables]]
- [[System Tables]]
- [[Convex Backend]]
