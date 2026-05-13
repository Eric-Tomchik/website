# Books Page

> Route: `/books` — File: `src/app/books/page.tsx`

---

## Purpose
ArcLight Press book catalog. Lists all published books with covers, pricing, and format options. Serves as the e-commerce storefront.

## Metadata
| Field | Value |
|---|---|
| **Title** | Books — ArcLight Press |
| **Description** | Browse books by Eric Tomchik on business credit, cybersecurity, AI, and more. |
| **Canonical** | `https://erictomchik.com/books` |
| **Revalidate** | 60 seconds (ISR) |

## Data Source
- Fetched via `fetchQuery(api.books.list, { activeOnly: true })` at server level
- Dynamic — books can be added/modified from admin

## Page Sections

### 1. Hero
- ArcLight Press branding
- Subtitle about independent publishing

### 2. Book Grid
- BookCard components for each book
- Shows: cover image, title, price, available formats
- Links to individual book detail pages

### 3. BookComparisonTable
- Side-by-side comparison of formats/editions
- Helps users decide between hardback, paperback, digital

### 4. CTA
- Browse link, newsletter signup

## Components Used
- `BookCard` — Individual book display
- `BookComparisonTable` — Format comparison
- `ScrollReveal` — Fade-in animations

---

## Related
- [[Book Detail Page]]
- [[ArcLight Press Overview]]
- [[Book Catalog]]
- [[Checkout API]]
