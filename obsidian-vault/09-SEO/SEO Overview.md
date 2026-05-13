# SEO Overview

> Search engine optimization strategy and implementation.

---

## Technical SEO

### Sitemap (`src/app/sitemap.ts`)
- Dynamic sitemap generation
- Includes all public pages, blog posts, book detail pages
- Static routes + dynamic Convex queries for books/posts
- Auto-updates as content changes

### Robots (`src/app/robots.ts`)
- Allows all crawlers
- Points to sitemap URL
- Disallows: `/admin/*`, `/portal/*`, `/api/*`

### Structured Data (JSON-LD)
| Page | Schema Type | Key Fields |
|---|---|---|
| Homepage | `WebSite` + `Person` | Search action, social profiles |
| About | `Person` | Name, job title, certifications, sameAs |
| Books | `Book` (per book) | Title, author, ISBN, offers, publisher |
| FAQ | `FAQPage` | Q&A pairs for rich results |
| Blog | `Article` | Headline, datePublished, author |

### Meta Tags
- Every page has unique `title` and `description`
- OG tags: `og:title`, `og:description`, `og:image`, `og:type`, `og:url`
- Twitter cards: `twitter:card`, `twitter:title`, `twitter:description`
- Canonical URLs on all pages

### Performance
- Server Components for fast first paint
- ISR (`revalidate: 60`) for dynamic pages
- Image optimization via Next.js `<Image>`
- Cloudflare CDN for global delivery

## Content SEO

### Blog Strategy
- Target keywords: business credit, cybersecurity, web development
- Regular publishing cadence
- Category-based organization
- Internal linking between related content

### Keyword Tracking
- Google Search Console integration
- `seo_keywords` table for target tracking
- Admin SEO planner at `/admin/seo`

---

## Related
- [[Sitemap & Robots]]
- [[Google Search Console]]
- [[Google Analytics]]
- [[Admin — Content]]
