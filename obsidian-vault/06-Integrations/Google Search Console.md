# Google Search Console

> SEO performance tracking integration.

---

## Setup
- Site URL: `GSC_SITE_URL` (defaults to `https://erictomchik.com`)
- Uses same service account as GA4: `GOOGLE_SA_CREDENTIALS`

## Data Fetched (`/api/gsc`)
| Metric | Description |
|---|---|
| Queries | Top search queries driving traffic |
| Pages | Top performing pages |
| Clicks | Total clicks from search |
| Impressions | Total impressions in search results |
| CTR | Click-through rate |
| Position | Average search ranking position |

## Breakdowns
- **By Device** — Desktop, Mobile, Tablet
- **By Country** — Geographic performance

## Admin Display
- SEO Planner at `/admin/seo`
- Query performance tables
- Page performance ranking
- Position tracking over time

## Keyword Tracking
- `seo_keywords` table in Convex
- Track target keywords, search volumes, current positions
- Plan content around keyword opportunities

---

## Related
- [[Google Analytics]]
- [[Analytics API]]
- [[Admin — Content]]
