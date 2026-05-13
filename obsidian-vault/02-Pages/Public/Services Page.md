# Services Page

> Route: `/services` — File: `src/app/services/page.tsx`

---

## Purpose
Web development service offerings with pricing tiers. Dynamically loaded from Convex.

## Metadata
| Field | Value |
|---|---|
| **Title** | Web Development Services — Eric Tomchik |
| **Description** | Custom web development services — from personal brand sites to full-stack applications. |
| **Canonical** | `https://erictomchik.com/services` |

## Service Tiers (from FAQ)

| Tier | Starting Price | Timeline | Features |
|---|---|---|---|
| **Starter** | $1,500 | 2–3 weeks | Personal/small business sites |
| **Business Pro** | $3,500 | 4–6 weeks | Full business sites + Client Portal access |
| **Custom Application** | $7,500 | 6–12 weeks | Full-stack apps with DB, auth, payments |

## Data Source
- Service plans loaded dynamically from Convex `service_plans` table
- Managed in admin at `/admin/services`

## Page Sections

### 1. Hero
- "Web Development Services" headline
- Subtitle about modern frameworks

### 2. Service Plan Cards
- Dynamic cards from Convex
- Each shows: name, description, features, pricing, timeline
- CTA: "Get a Quote" → `/contact`

### 3. "Why Work With Me" Section
- Differentiators and value propositions
- Certifications, tech stack, approach

### 4. FAQ Preview
- Common service questions
- Link to full `/faq`

### 5. CTA
- Contact form link
- Portfolio link as social proof

## Post-Launch Support
- Starter: 30 days
- Business Pro: 60 days
- Custom Application: 90 days
- Ongoing maintenance packages available

## Client Locations
- Primary: Mississippi Gulf Coast
- Also: Nationwide (remote work)

---

## Related
- [[Portfolio Page]]
- [[Contact Page]]
- [[FAQ Page]]
- [[Client Portal Overview]]
