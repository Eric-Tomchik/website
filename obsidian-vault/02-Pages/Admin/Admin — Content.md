# Admin — Content

> Admin sections for blog, newsletter, broadcasts, social media, reviews, media, and SEO.

---

## Blog Posts (`/admin/blog`)
- Rich blog post editor
- Fields: title, slug, content (markdown), category, tags, featured image, published date, status
- Categories: `business-credit`, `web-development`, `technology`, `cybersecurity`, `ai`, `general`
- Drafts vs published posts
- Auto-generates table of contents

## Newsletter (`/admin/newsletter`)
- Subscriber management dashboard
- Stats: total, active, inactive, last 30 days
- List all subscribers with subscribe date
- Actions: remove, export
- Table: `newsletter_subscribers`

## Broadcasts (`/admin/broadcasts`)
- Bulk email campaigns to subscriber list
- Compose email with subject + HTML/markdown body
- Send via Resend to all active subscribers
- Sent via `/api/broadcasts/send`
- History of past broadcasts

## Social Media (`/admin/social`)
- Social media post scheduler
- Platforms: Facebook Pages, Instagram, X/Twitter, LinkedIn
- Schedule posts for future publishing
- Drafts → Scheduled → Published workflow
- Processed via `/api/social/process` (cron-triggered)
- Published via `/api/social/publish`
- Campaign grouping via `social_campaigns` table
- Badge: shows scheduled post count

## Reviews (`/admin/reviews`)
- Testimonial and review management
- Collect and display client reviews
- Approval workflow for public display

## Media Library (`/admin/media`)
- Centralized file management
- Upload images, PDFs, documents
- `media_files` table with metadata
- Used across blog posts, books, portfolio

## SEO Planner (`/admin/seo`)
- Google Search Console integration
- Keyword tracking via `seo_keywords` table
- Performance metrics: queries, pages, clicks, impressions, CTR, position
- Device and country breakdown
- Data fetched via `/api/gsc`

---

## Related
- [[Blog Page]]
- [[Social Media Publishing]]
- [[Newsletter API]]
- [[Google Search Console]]
