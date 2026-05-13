# Homepage

> Route: `/` — File: `src/app/page.tsx`

---

## Purpose
The main landing page for erictomchik.com. Introduces Eric as an author, web developer, and creator. Drives traffic to books, services, and portfolio.

## Metadata
| Field | Value |
|---|---|
| **Title** | Eric Tomchik — Author, Web Developer, Creator |
| **Description** | Author, web developer, and creator. Browse my books, explore services, and see my portfolio. |
| **OG Type** | website |
| **Canonical** | `https://erictomchik.com` |

## Page Sections (Top to Bottom)

### 1. Announcement Banner
- Dismissible banner promoting latest book
- Current: "Credit Without a Credit Score" — new book promo
- Uses `localStorage` to remember dismissal
- Links to `/books/credit-without-a-credit-score`

### 2. Hero Section
- Headline: "Hi, I'm *Eric Tomchik*"
- Subtitle: Author, web developer, and creator
- CTA Buttons: "Browse My Books" → `/books`, "View My Work" → `/portfolio`
- Gradient background with animated glow effect

### 3. Credibility Bar
- Key stats: books published, websites built, years experience
- Animated counter numbers on scroll

### 4. Featured Books
- Dynamic section pulling featured books from Convex
- BookCard components with cover images, titles, prices
- "View All Books" link → `/books`

### 5. Quick Links / Services Preview
- Cards linking to major sections: Services, Portfolio, Blog, Resources
- Icon + title + short description for each

### 6. Newsletter Signup
- Inline email capture form
- "Stay in the loop" messaging
- Triggers newsletter subscription + drip enrollment

### 7. Footer
- Full site footer with link columns, social icons, newsletter form
- See [[Footer Component]]

## Structured Data
- `@type: WebSite` with `potentialAction: SearchAction`
- `@type: Person` for Eric Tomchik

## Components Used
- `AnnouncementBanner`
- `ScrollReveal` (fade-up animations)
- `BookCard`
- `NewsletterForm`

---

## Related
- [[About Page]]
- [[Books Page]]
- [[Services Page]]
- [[Footer Component]]
