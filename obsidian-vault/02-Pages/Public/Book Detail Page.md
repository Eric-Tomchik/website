# Book Detail Page

> Route: `/books/[slug]` — File: `src/app/books/[slug]/page.tsx`

---

## Purpose
Individual book product page. Full details, pricing for all formats, "Look Inside" preview, and purchase CTAs.

## Metadata
| Field | Value |
|---|---|
| **Title** | `{Book Title} — ArcLight Press` |
| **Description** | Dynamic from `book.description` |
| **OG Type** | book |
| **OG Image** | Book cover image URL |
| **Revalidate** | 60 seconds (ISR) |

## Data Source
- `fetchQuery(api.books.getBySlug, { slug })` — Server-side fetch
- Renders 404 if slug not found

## Page Layout

### Left Column (Sticky)
- Book cover image (3:4 aspect ratio)
- Gradient glow border effect
- "Featured" badge if `is_featured: true`

### Right Column
1. **Title & Author** — "by Eric Tomchik"
2. **PriceButtons** — Format selection + Add to Cart
   - Hardback, Paperback, Digital options
   - Price display per format
   - Stripe checkout integration
   - Amazon link (if available)
3. **"Look Inside" Preview** — BookPreviewButton for PDF preview
4. **About This Book** — `long_description` rendered as HTML paragraphs
5. **Details Card** — Page count, ISBN, Published date, Formats
6. **BookDetailActions** — Additional purchase/share CTAs

## Book Schema Fields
| Field | Type | Purpose |
|---|---|---|
| `title` | string | Book title |
| `slug` | string | URL slug |
| `description` | string | Short description |
| `long_description` | string? | Full description |
| `price_cents` | number | Hardback price in cents |
| `paperback_price_cents` | number? | Paperback price |
| `digital_price_cents` | number? | Digital price |
| `book_format` | enum | `physical`, `both`, `digital`, `all_formats` |
| `cover_image_url` | string? | Cover image |
| `preview_pdf_url` | string? | "Look Inside" PDF |
| `isbn` | string? | ISBN number |
| `page_count` | number? | Page count |
| `published_date` | string? | Publication date |
| `amazon_url` | string? | Amazon listing link |
| `is_featured` | boolean | Show on homepage |
| `is_active` | boolean | Visible in catalog |

## Structured Data (JSON-LD)
- `@type: Book`
- Author: Eric Tomchik
- Publisher: ArcLight Press
- Offers array: one per format (hardback, paperback, digital) with prices
- ISBN, page count, published date

## Purchase Flow
1. User selects format → clicks "Buy Now" or "Add to Cart"
2. Stripe checkout session created via `/api/checkout`
3. On success → order recorded, download token generated
4. Confirmation email sent via Resend
5. Digital: download link at `/download/[token]`

---

## Related
- [[Books Page]]
- [[Stripe Integration]]
- [[Checkout API]]
- [[E-Commerce Tables]]
