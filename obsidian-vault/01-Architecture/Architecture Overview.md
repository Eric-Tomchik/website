# Architecture Overview

> High-level system architecture for erictomchik.com.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Pages                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Next.js 15 (App Router)                               │ │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐│ │
│  │  │  Public   │  │  Admin   │  │    Client Portal      ││ │
│  │  │  Pages    │  │Dashboard │  │  (per-client login)   ││ │
│  │  └──────────┘  └──────────┘  └───────────────────────┘│ │
│  │  ┌────────────────────────────────────────────────────┐│ │
│  │  │              API Routes (/api/*)                    ││ │
│  │  │  analytics · auth · checkout · drip · gsc · social ││ │
│  │  └────────────────────────────────────────────────────┘│ │
│  └────────────────────────────────────────────────────────┘ │
│            │              │              │                   │
│    ┌───────┘     ┌────────┘     ┌────────┘                  │
│    ▼             ▼              ▼                            │
│  Convex       Stripe         Resend                         │
│  (DB +        PayPal         (Transactional                 │
│  real-time)   (Payments)      & drip email)                 │
└─────────────────────────────────────────────────────────────┘
```

## Key Architectural Patterns

### 1. Server Components First
- All public pages use React Server Components for SEO and fast initial load
- Data fetched via `fetchQuery()` from Convex at the server level
- ISR (Incremental Static Regeneration) with `revalidate = 60` on book/blog pages

### 2. Client Components for Real-Time
- Admin dashboard and Client Portal use client-side Convex subscriptions (`useQuery()`)
- Real-time updates — orders, messages, tickets appear instantly
- Optimistic updates for admin mutations

### 3. API Routes as Middleware Layer
- Server-side integrations (Stripe, Resend, GA4, GSC) live in `/api/` routes
- Webhook handlers validate signatures before processing
- Rate limiting via Convex `rate_limits` table

### 4. Middleware Pipeline
All requests flow through `middleware.ts`:
1. **Subdomain detection** → proxy to Viktor Space origins for portfolio sites
2. **CSP nonce generation** → per-request cryptographic nonce for scripts
3. **Admin route protection** → redirect to `/admin/login` if no valid session cookie
4. **Portal route protection** → redirect to `/portal/login` if no valid session cookie

### 5. Auth Strategy
| System | Method | Storage |
|---|---|---|
| Admin | TOTP 2FA | `admin_session` cookie (JWT) |
| Client Portal | Email + Password (bcrypt) | `portal_session` cookie |

### 6. Subdomain Proxy
Portfolio showcase sites are proxied via subdomains:
- `boonies.erictomchik.com` → Viktor Space
- `rickeys.erictomchik.com` → Viktor Space
- etc. (10 portfolio subdomains)

See [[Subdomain Proxy System]] for full mapping.

---

## Data Flow Examples

### Book Purchase Flow
```
User → /books/[slug] → Add to Cart
  → Stripe Checkout Session (POST /api/checkout)
  → Stripe processes payment
  → Stripe Webhook (POST /api/webhook)
  → Convex: Create order, generate download token
  → Resend: Send confirmation email with download link
  → User downloads at /download/[token] (5 downloads, 72hr expiry)
```

### Contact Form Flow
```
User → /contact → Submit form
  → POST /api/contact → Rate limit check
  → Convex: Insert contact_messages
  → Resend: Send notification to admin
  → Admin sees in /admin/messages
```

### Newsletter Subscription
```
User → Footer/page signup → POST /api/newsletter
  → Convex: Insert newsletter_subscribers
  → Convex: Enroll in drip_sequences
  → POST /api/drip/process (cron-triggered)
  → Resend: Send drip emails on schedule
```

---

## Related
- [[Tech Stack]]
- [[Project Structure]]
- [[Security — CSP & Auth]]
- [[Subdomain Proxy System]]
