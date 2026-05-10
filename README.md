# erictomchik.com

Personal website, portfolio, e-commerce store, blog, and freelance business platform for **Eric Tomchik** — author, web developer, and creator. Built with Next.js 15, Convex, and deployed on Cloudflare Pages.

🔗 **Live:** [erictomchik.com](https://erictomchik.com)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Features](#features)
  - [Public Site](#public-site)
  - [Admin Dashboard](#admin-dashboard)
  - [Client Portal](#client-portal)
  - [E-Commerce (ArcLight Press)](#e-commerce-arclight-press)
  - [Blog & Content](#blog--content)
  - [Marketing & Automation](#marketing--automation)
  - [Analytics & SEO](#analytics--seo)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security](#security)
- [License](#license)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org) (App Router, React 19) |
| **Backend / Database** | [Convex](https://convex.dev) (real-time, serverless) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com) + custom design system |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Payments** | [Stripe](https://stripe.com) + [PayPal](https://developer.paypal.com) |
| **Email** | [Resend](https://resend.com) |
| **Analytics** | Google Analytics 4 + Google Search Console |
| **Auth** | TOTP-based admin auth, bcrypt client portal auth |
| **Hosting** | [Cloudflare Pages](https://pages.cloudflare.com) via [@opennextjs/cloudflare](https://github.com/opennextjs/opennextjs-cloudflare) |
| **Runtime** | [Bun](https://bun.sh) (build), Node.js compat on Workers |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Forms** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **Typography** | Inter (body), JetBrains Mono (code) |

---

## Architecture Overview

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

**Key patterns:**
- **Server Components** for public pages (SEO, fast loads)
- **Client Components** for admin/portal dashboards (real-time via Convex subscriptions)
- **API Routes** for server-side integrations (Stripe webhooks, email sending, analytics fetching)
- **Middleware** handles CSP nonce injection and subdomain proxying for portfolio sites

---

## Features

### Public Site

| Page | Route | Description |
|---|---|---|
| Home | `/` | Hero, services overview, featured work, testimonials |
| Services | `/services` | Web development service plans with pricing |
| Portfolio | `/portfolio` | Project showcase with live site links |
| About | `/about` | Bio, certifications, photo |
| Contact | `/contact` | Contact form with rate limiting |
| Blog | `/blog` | Articles + industry news (RSS aggregation) |
| Resources | `/resources/*` | Guides (AI, cybersecurity, credit score, POS) |
| FAQ | `/faq` | Frequently asked questions |
| Links | `/links` | Link-in-bio page |
| Privacy / Terms | `/privacy`, `/terms` | Legal pages |

**Additional features:**
- 🔍 **Site-wide search** — Modal-based search across all pages, blog posts, books, and services
- 📰 **Industry news reader** — Curated RSS feeds from 9 sources across cybersecurity, web dev, and AI
- 📱 **PWA-ready** — Web app manifest with icons
- 🌓 **Dark/light theme** — System-aware with manual toggle
- ♿ **Accessible** — Skip-to-content, ARIA labels, keyboard navigation, focus management

### Admin Dashboard

Full-featured admin panel at `/admin` with TOTP-based two-factor authentication.

| Section | Description |
|---|---|
| **Dashboard** | Overview stats, quick actions |
| **Kanban** | Drag-and-drop project management board |
| **Clients** | CRM with client details, linked projects/invoices |
| **Invoices** | Create, send, track invoices with email notifications |
| **Contracts** | Document signing workflow with email-for-signature |
| **Blog** | Rich blog post editor with categories and tags |
| **Books** | E-book product management (covers, pricing, bundles) |
| **Orders** | Order history, digital delivery tracking |
| **Social** | Social media post scheduler (Facebook, Instagram, X, LinkedIn) |
| **Newsletter** | Subscriber management |
| **Broadcasts** | Bulk email campaigns |
| **Automations** | Email drip sequence builder |
| **Analytics** | GA4 dashboard with weekly trends, sparklines, period comparison |
| **SEO** | Google Search Console tracking — queries, pages, device/country breakdown |
| **Revenue** | Revenue analytics and financial overview |
| **Portfolio** | Portfolio project management |
| **Services** | Service plan editor |
| **Reviews** | Testimonial management |
| **Media** | Media library with file uploads |
| **Discounts** | Discount code management |
| **Notifications** | Notification center |
| **Messages** | Contact form submissions |
| **Tickets** | Client support tickets |
| **Audit Log** | Action history for accountability |
| **Settings** | Site-wide settings |

### Client Portal

Secure per-client portal at `/portal` with password-based authentication.

- **Projects** — View project status, milestones, progress
- **Documents** — Access shared documents, sign contracts
- **Tickets** — Submit and track support requests
- **Email notifications** — Automated alerts for invoices, milestones, document requests, status updates

### E-Commerce (ArcLight Press)

Digital bookstore at `/books` powered by Stripe + PayPal.

- Product pages with cover previews and comparison tables
- Stripe Checkout + PayPal integration
- Free download flow (with email capture)
- Secure digital delivery via time-limited download tokens
- Discount code support
- Order confirmation + email receipts

### Blog & Content

- **My Articles** — Original blog posts with categories (Business Credit, Web Dev, Technology, Cybersecurity, AI, General), tag system, search bar, category/tag filter pills
- **Industry News** — Aggregated RSS feeds from 9 sources with search, category filters, and source filters:
  - *Cybersecurity:* Krebs on Security, The Hacker News, Dark Reading
  - *Web Development:* CSS-Tricks, Smashing Magazine, The New Stack
  - *AI & Technology:* Ars Technica, The Verge AI, OpenAI Blog
- **On-site news reader** — Full article view at `/news/[slug]` (no redirect to external sites)
- **Newsletter** — Subscribe form with auto-enrollment into drip sequences
- **Table of contents** — Auto-generated for long-form articles
- **Blog newsletter CTA** — Inline signup within articles

### Marketing & Automation

- **Email drip sequences** — Multi-step automated email campaigns triggered on subscribe or manually
- **Email broadcasts** — One-off bulk email sends to subscriber list
- **Social auto-posting** — Schedule and publish to Facebook Pages, Instagram, X/Twitter, and LinkedIn
- **Content calendar** — Plan and organize content across channels
- **Client notifications** — Automated emails for invoice, signature request, milestone, and status updates

### Analytics & SEO

- **GA4 integration** — Real-time analytics dashboard with sessions, page views, bounce rate, session duration, daily sparklines, trend badges, and period-over-period comparison
- **Google Search Console** — SEO performance tracking with queries, pages, device breakdown, country breakdown, CTR/position metrics
- **SEO keywords** — Keyword tracking and content planning
- **Lead magnet** — Free credit checklist download at `/credit-checklist`

---

## Project Structure

```
├── convex/                    # Convex backend
│   ├── schema.ts              # Database schema (25+ tables)
│   ├── crons.ts               # Scheduled jobs (rate limit cleanup)
│   ├── blogPosts.ts           # Blog CRUD + queries
│   ├── books.ts               # Book catalog management
│   ├── clients.ts             # Client CRM operations
│   ├── dripSequences.ts       # Drip campaign logic
│   ├── invoices.ts            # Invoice management
│   ├── orders.ts              # Order processing
│   ├── socialPosts.ts         # Social media post CRUD
│   ├── projects.ts            # Project management
│   ├── tickets.ts             # Support ticket system
│   └── ...                    # 20+ more modules
│
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout (fonts, GA, meta pixel, providers)
│   │   ├── ConvexClientProvider.tsx
│   │   │
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── login/         # TOTP-based admin login
│   │   │   └── (dashboard)/   # 25+ admin sections
│   │   │
│   │   ├── portal/            # Client portal
│   │   │   ├── login/         # Per-client password login
│   │   │   └── (dashboard)/   # Projects, documents, tickets
│   │   │
│   │   ├── blog/              # Blog listing + [slug] pages
│   │   ├── books/             # E-commerce store + [slug] pages
│   │   ├── news/[slug]/       # RSS news reader
│   │   ├── services/          # Service plans
│   │   ├── portfolio/         # Project showcase
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact form
│   │   ├── resources/         # Resource guides
│   │   ├── sign/[token]/      # Document signing page
│   │   ├── download/[token]/  # Secure file download
│   │   ├── unsubscribe/       # Newsletter unsubscribe
│   │   │
│   │   └── api/               # API routes
│   │       ├── analytics/     # GA4 data fetching + caching
│   │       ├── auth/          # Admin login, logout, TOTP setup
│   │       ├── broadcasts/    # Bulk email sending
│   │       ├── checkout/      # Stripe checkout session creation
│   │       ├── contact/       # Contact form handler
│   │       ├── drip/          # Drip sequence processor
│   │       ├── gsc/           # Google Search Console fetcher
│   │       ├── newsletter/    # Subscribe / unsubscribe
│   │       ├── notify/        # Client email notifications
│   │       ├── portal/        # Client portal auth
│   │       ├── search-index/  # Search index builder
│   │       ├── social/        # Social media publishing
│   │       └── webhook/       # Stripe webhook handler
│   │
│   ├── components/
│   │   ├── layout/            # Navbar, Footer, ThemeToggle, NewsletterForm
│   │   ├── ui/                # BlogTabs, SearchModal, BookCard, ScrollReveal, etc.
│   │   └── checkout/          # CheckoutContext, CheckoutDrawer
│   │
│   ├── hooks/
│   │   ├── useAdminAuth.ts    # Admin auth hooks (useAdminQuery, useAdminMutation)
│   │   └── useClientNotify.ts # Client notification hook
│   │
│   ├── lib/
│   │   ├── adminAuth.ts       # Admin session verification
│   │   ├── convex.ts          # Convex HTTP client helper
│   │   ├── convexRaw.ts       # Raw Convex HTTP helpers (avoids typed imports)
│   │   ├── pdfGenerator.ts    # Invoice PDF generation
│   │   ├── rss.ts             # RSS feed fetcher (9 sources)
│   │   ├── sanitize.ts        # HTML sanitization
│   │   ├── socialPublishers.ts# Social media platform publishers
│   │   ├── stripe.ts          # Stripe client initialization
│   │   ├── totp.ts            # TOTP generation/verification
│   │   └── utils.ts           # Shared utilities (cn, etc.)
│   │
│   └── middleware.ts          # CSP nonce injection + subdomain proxying
│
├── public/                    # Static assets (images, favicons, PWA icons)
├── next.config.js             # Rewrites (WebP), security headers, remote images
├── tailwind.config.ts         # Custom brand/surface color palette, typography plugin
├── wrangler.jsonc             # Cloudflare Workers configuration
├── open-next.config.ts        # OpenNext adapter for Cloudflare
├── vitest.config.ts           # Test configuration
└── package.json
```

---

## Database Schema

The Convex database has 25+ tables organized by domain:

| Domain | Tables |
|---|---|
| **E-Commerce** | `books`, `orders`, `download_tokens`, `discount_codes` |
| **CRM / Portal** | `clients`, `client_sessions`, `projects`, `project_milestones`, `tickets`, `ticket_messages`, `client_documents` |
| **Social Media** | `social_posts`, `social_campaigns` |
| **Blog** | `blog_posts` |
| **Newsletter** | `newsletter_subscribers`, `drip_sequences`, `drip_steps`, `drip_enrollments`, `email_broadcasts` |
| **Invoicing** | `invoices` |
| **Content** | `contact_messages`, `reviews`, `portfolio_projects`, `service_plans`, `content_calendar`, `seo_keywords` |
| **System** | `analytics_cache`, `rate_limits`, `notifications`, `audit_log`, `media_files`, `site_settings` |

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/analytics` | GET | Fetch GA4 analytics data (with Convex caching) |
| `/api/analytics` | POST | Refresh analytics cache (cron endpoint) |
| `/api/auth/login` | POST | Admin TOTP login |
| `/api/auth/logout` | POST | Admin logout |
| `/api/auth/totp-setup` | POST | Generate TOTP secret for admin setup |
| `/api/broadcasts/send` | POST | Send bulk email broadcast |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/checkout/free` | POST | Process free e-book download |
| `/api/contact` | POST | Handle contact form submission |
| `/api/discount/validate` | POST | Validate discount code |
| `/api/download/[token]` | GET | Serve secure file download |
| `/api/drip/process` | POST | Process pending drip email sends |
| `/api/gsc` | GET | Fetch Google Search Console data |
| `/api/gsc` | POST | Refresh GSC cache |
| `/api/newsletter` | POST | Subscribe to newsletter |
| `/api/newsletter/unsubscribe` | POST | Unsubscribe from newsletter |
| `/api/notify/client` | POST | Send client notification email |
| `/api/paypal/record-order` | POST | Record PayPal order completion |
| `/api/portal/login` | POST | Client portal login |
| `/api/portal/session` | GET | Validate client portal session |
| `/api/search-index` | GET | Build site search index |
| `/api/social/publish` | POST | Publish a social media post |
| `/api/social/process` | POST | Process scheduled social posts |
| `/api/webhook` | POST | Stripe webhook handler |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Convex CLI](https://docs.convex.dev/getting-started) (`npm install -g convex`)
- A Convex project (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/Eric-Tomchik/website.git
cd website

# Install dependencies
bun install

# Set up Convex (follow prompts to create/link a project)
npx convex dev

# In a new terminal, start the dev server
bun dev
```

The site will be available at `http://localhost:3000`.

### Initial Setup

1. **Create admin account:** Set `ADMIN_PASSWORD` and `CONVEX_AUTH_SECRET` env vars, then visit `/admin/login`
2. **Configure Stripe:** Add Stripe keys and set up webhook endpoint at `/api/webhook`
3. **Configure Resend:** Add `RESEND_API_KEY` for email functionality
4. **Configure GA4:** Add `GOOGLE_SA_CREDENTIALS` and `NEXT_PUBLIC_GA_MEASUREMENT_ID` for analytics

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# ── Convex ──
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=prod:your-deploy-key
CONVEX_AUTH_SECRET=your-admin-secret

# ── Admin ──
ADMIN_PASSWORD=your-admin-password

# ── Stripe ──
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── PayPal ──
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id

# ── Email (Resend) ──
RESEND_API_KEY=re_...

# ── Google Analytics ──
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_SA_CREDENTIALS={"type":"service_account",...}

# ── Google Search Console (optional) ──
GSC_SITE_URL=https://erictomchik.com

# ── Social Media (optional) ──
FB_PAGE_ID=your-page-id
FB_PAGE_ACCESS_TOKEN=your-token
IG_USER_ID=your-ig-user-id
IG_ACCESS_TOKEN=your-token
X_API_KEY=your-key
X_API_SECRET=your-secret
X_ACCESS_TOKEN=your-token
X_ACCESS_SECRET=your-secret
LINKEDIN_ACCESS_TOKEN=your-token
LINKEDIN_PERSON_URN=urn:li:person:your-id

# ── Meta Pixel (optional) ──
NEXT_PUBLIC_META_PIXEL_ID=your-pixel-id

# ── Site ──
NEXT_PUBLIC_SITE_URL=https://erictomchik.com
```

---

## Deployment

The site deploys to **Cloudflare Pages** using the OpenNext adapter.

### Build Command

```bash
CI=1 npx convex deploy --cmd 'bun run build'
```

This first deploys Convex functions, then builds the Next.js app.

### Cloudflare Pages Settings

| Setting | Value |
|---|---|
| **Build command** | `CI=1 npx convex deploy --cmd 'bun run build'` |
| **Build output directory** | `.open-next` |
| **Node.js version** | 20+ |
| **Environment variable** | `NODE_ENV=production` (required for Convex v1.37+) |
| **Environment variable** | `CI=1` |

### Subdomain Proxying

The middleware proxies portfolio subdomains (e.g., `boonies.erictomchik.com`) to their respective hosted sites, enabling URL masking for client projects.

---

## Security

- **Content Security Policy** — Per-request CSP with nonce-based script allowlisting
- **Security headers** — HSTS, X-Frame-Options (DENY), X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **TOTP admin auth** — Time-based one-time password for admin dashboard access
- **Rate limiting** — Contact form and API endpoint rate limiting with automatic cleanup
- **Secure downloads** — Time-limited download tokens for digital products
- **Input sanitization** — HTML sanitization on user-generated content
- **CSRF protection** — Auth secret validation on sensitive API routes

---

## License

This is a personal project. All rights reserved.
