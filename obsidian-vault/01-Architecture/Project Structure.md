# Project Structure

> File and directory organization of the website codebase.

---

## Root Directory

```
erictomchik.com/
├── convex/                    # Convex backend (DB schema, functions, crons)
├── src/                       # Next.js application source
│   ├── app/                   # App Router pages & API routes
│   ├── components/            # Shared React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Shared utilities & service clients
│   └── middleware.ts          # Request pipeline (CSP, auth, proxy)
├── public/                    # Static assets
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS config
├── wrangler.jsonc             # Cloudflare Workers config
├── open-next.config.ts        # OpenNext adapter config
├── vitest.config.ts           # Test configuration
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript configuration
└── bun.lock                   # Bun lockfile
```

## Convex Backend (`convex/`)

```
convex/
├── schema.ts               # All 25+ table definitions
├── crons.ts                # Scheduled jobs (rate limit cleanup)
├── _generated/             # Auto-generated types and API
├── lib/
│   └── auth.ts             # assertAdmin() helper
├── books.ts                # Book CRUD, list, getBySlug
├── orders.ts               # Order management
├── blogPosts.ts            # Blog CRUD + listing
├── clients.ts              # Client CRM operations
├── projects.ts             # Project management
├── tickets.ts              # Support tickets
├── clientDocuments.ts      # Document management
├── newsletter.ts           # Subscriber management
├── dripSequences.ts        # Drip campaign logic
├── invoices.ts             # Invoice management
├── socialPosts.ts          # Social media post CRUD
├── contacts.ts             # Contact form messages
├── discountCodes.ts        # Discount code management
├── notifications.ts        # Notification system
├── reviews.ts              # Review/testimonial management
├── rateLimit.ts            # Rate limit entries + cleanup
├── analytics.ts            # Analytics cache
├── siteSettings.ts         # Global settings
├── auditLog.ts             # Audit trail
└── ... (additional modules)
```

## App Router (`src/app/`)

### Public Pages
```
src/app/
├── page.tsx                # Homepage (/)
├── layout.tsx              # Root layout (fonts, GA, Meta Pixel, providers)
├── about/page.tsx          # /about
├── blog/
│   ├── page.tsx            # /blog (listing)
│   └── [slug]/page.tsx     # /blog/[slug] (article)
├── books/
│   ├── page.tsx            # /books (catalog)
│   └── [slug]/             # /books/[slug] (detail)
│       ├── page.tsx
│       ├── PriceButtons.tsx
│       ├── BookDetailActions.tsx
│       └── ...
├── contact/page.tsx        # /contact
├── credit-checklist/       # /credit-checklist (interactive tool)
├── faq/page.tsx            # /faq
├── links/page.tsx          # /links (link-in-bio)
├── news/[slug]/page.tsx    # /news/[slug] (RSS reader)
├── portfolio/page.tsx      # /portfolio
├── privacy/page.tsx        # /privacy
├── resources/              # /resources (companion guides)
├── services/page.tsx       # /services
├── terms/page.tsx          # /terms
├── unsubscribe/page.tsx    # /unsubscribe
├── download/[token]/       # /download/[token] (secure downloads)
├── sign/[token]/           # /sign/[token] (document signing)
├── feed/route.ts           # RSS feed output
├── sitemap.ts              # Dynamic sitemap generator
└── robots.ts               # robots.txt rules
```

### Admin Dashboard
```
src/app/admin/
├── login/page.tsx          # Admin login (/admin/login)
└── (dashboard)/
    ├── layout.tsx          # Dashboard layout + auth guard
    ├── page.tsx            # Main dashboard (/admin)
    ├── analytics/          # GA4 analytics dashboard
    ├── audit-log/          # Action audit trail
    ├── automations/        # Drip sequence builder
    ├── blog/               # Blog post editor
    ├── books/              # Book management
    ├── broadcasts/         # Bulk email campaigns
    ├── clients/            # Client CRM
    ├── contracts/          # Document signing workflow
    ├── discounts/          # Discount code management
    ├── invoices/           # Invoice management
    ├── kanban/             # Project board (drag-and-drop)
    ├── media/              # Media library
    ├── messages/           # Contact form submissions
    ├── newsletter/         # Subscriber management
    ├── notifications/      # Notification center
    ├── orders/             # Order management
    ├── portfolio/          # Portfolio management
    ├── revenue/            # Revenue analytics
    ├── reviews/            # Testimonial management
    ├── seo/                # SEO keyword/GSC tracking
    ├── services/           # Service plan editor
    ├── settings/           # Site settings
    ├── social/             # Social media scheduler
    └── tickets/            # Support ticket management
```

### Client Portal
```
src/app/portal/
├── login/page.tsx          # Portal login (/portal/login)
├── PortalAuthContext.tsx    # Auth context provider
└── (dashboard)/
    ├── layout.tsx          # Portal layout + auth guard
    ├── page.tsx            # Dashboard overview (/portal)
    ├── projects/           # Project tracking
    ├── documents/          # Shared documents
    └── tickets/            # Support tickets
```

### API Routes
```
src/app/api/
├── analytics/route.ts      # GA4 data fetching
├── auth/
│   ├── login/route.ts      # Admin TOTP login
│   ├── logout/route.ts     # Admin logout
│   └── totp-setup/route.ts # TOTP setup
├── broadcasts/send/route.ts
├── checkout/
│   ├── route.ts            # Stripe checkout
│   └── free/route.ts       # Free download
├── contact/route.ts
├── discount/validate/route.ts
├── download/[token]/route.ts
├── drip/process/route.ts
├── feed/route.ts           # RSS feed
├── gsc/route.ts            # Google Search Console
├── newsletter/
│   ├── route.ts            # Subscribe
│   └── unsubscribe/route.ts
├── notify/client/route.ts
├── paypal/record-order/route.ts
├── portal/
│   ├── login/route.ts
│   └── session/route.ts
├── search-index/route.ts
├── social/
│   ├── process/route.ts
│   └── publish/route.ts
└── webhook/route.ts        # Stripe webhooks
```

## Components (`src/components/`)

```
src/components/
├── AdminSidebar.tsx         # Admin navigation sidebar
├── layout/
│   ├── Navbar.tsx           # Main site navbar
│   ├── Footer.tsx           # Site footer
│   ├── ThemeToggle.tsx      # Dark/light mode toggle
│   ├── NewsletterForm.tsx   # Newsletter signup form
│   └── AnnouncementBanner.tsx # Dismissible promo banner
├── ui/
│   ├── BlogTabs.tsx         # Blog category tabs
│   ├── BookCard.tsx         # Book grid card
│   ├── BookPreview.tsx      # "Look Inside" preview
│   ├── BookComparisonTable.tsx # Format comparison table
│   ├── LeadMagnet.tsx       # Download lead magnet CTA
│   ├── ScrollReveal.tsx     # Scroll-triggered animations
│   ├── SearchProvider.tsx   # Site-wide search modal
│   └── ...
└── checkout/
    ├── CheckoutContext.tsx   # Shopping cart state
    └── CheckoutDrawer.tsx   # Slide-out cart drawer
```

## Libraries (`src/lib/`)

```
src/lib/
├── adminAuth.ts            # verifyAdminToken(), JWT-based
├── convex.ts               # Convex HTTP client
├── convexRaw.ts            # Raw Convex HTTP helpers
├── pdfGenerator.ts         # Invoice PDF generation (pdf-lib)
├── rss.ts                  # RSS feed fetcher (9 sources)
├── sanitize.ts             # escapeHtml() for XSS prevention
├── socialPublishers.ts     # Platform-specific social publishing
├── stripe.ts               # Stripe client initialization
├── totp.ts                 # TOTP generate/verify
└── utils.ts                # cn(), formatPrice(), format helpers
```

---

## Related
- [[Architecture Overview]]
- [[Tech Stack]]
