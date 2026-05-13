# Tech Stack

> All technologies used to build and run erictomchik.com.

---

## Core Framework

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js | 15.x | App Router, React Server Components, ISR |
| **UI Library** | React | 19.x | Component rendering |
| **Language** | TypeScript | 5.5+ | Type safety throughout |
| **Runtime** | Bun | 1.0+ | Package management, build tooling |

## Backend & Data

| Technology | Purpose |
|---|---|
| **Convex** | Real-time serverless database, backend functions, cron jobs |
| **Convex Schema** | 25+ tables covering e-commerce, CRM, blog, social, analytics |

## Styling & Design

| Technology | Purpose |
|---|---|
| **Tailwind CSS** | 3.4+ with custom design system (brand/surface colors) |
| **@tailwindcss/typography** | Prose styling for blog/long-form content |
| **Framer Motion** | Page transitions, scroll reveals, animations |
| **Lucide React** | Icon library (400+ icons) |
| **Custom Fonts** | Inter (body), JetBrains Mono (code) |

## Payments

| Technology | Purpose |
|---|---|
| **Stripe** | Primary payment processor, checkout sessions, webhooks |
| **PayPal** | Alternative payment method via `@paypal/react-paypal-js` |

## Email

| Technology | Purpose |
|---|---|
| **Resend** | Transactional emails, drip sequences, broadcasts |

## Analytics & SEO

| Technology | Purpose |
|---|---|
| **Google Analytics 4** | Traffic analytics, real-time + historical |
| **Google Search Console** | SEO performance tracking |
| **Meta Pixel** | Facebook/Instagram conversion tracking |
| **JSON-LD** | Structured data (Organization, Person, Book, FAQ, etc.) |

## Auth & Security

| Technology | Purpose |
|---|---|
| **TOTP** | Admin two-factor authentication (via `qrcode` package) |
| **bcryptjs** | Client portal password hashing |
| **CSP Nonce** | Content Security Policy with per-request nonces |
| **Middleware** | Route protection, CSP injection, subdomain proxy |

## Hosting & Infrastructure

| Technology | Purpose |
|---|---|
| **Cloudflare Pages** | Static hosting + serverless functions |
| **@opennextjs/cloudflare** | Next.js → Cloudflare Workers adapter |
| **Wrangler** | Cloudflare deployment CLI |

## Testing

| Technology | Purpose |
|---|---|
| **Vitest** | Unit/integration testing framework |

## Other Libraries

| Library | Purpose |
|---|---|
| `clsx` + `tailwind-merge` | Conditional class management |
| `marked` | Markdown → HTML rendering |
| `pdf-lib` | Invoice PDF generation |
| `fflate` | File compression |
| `zod` | Schema validation |
| `react-hook-form` | Form state management |
| `next-themes` | Dark/light theme management |

---

## Related
- [[Architecture Overview]]
- [[Project Structure]]
- [[Environment Variables]]
