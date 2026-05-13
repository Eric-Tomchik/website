# Google Analytics

> GA4 integration for website traffic analytics.

---

## Setup
- Measurement ID: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (GA4 tag, client-side)
- Service Account: `GOOGLE_SA_CREDENTIALS` (server-side API access)

## Client-Side Tracking
- GA4 script loaded in root `layout.tsx`
- Tracks: page views, sessions, user interactions
- Also includes **Meta Pixel** for Facebook/Instagram conversion tracking

## Server-Side API (`/api/analytics`)
- Uses GA4 Data API (v1beta) with service account credentials
- Fetches: sessions, page views, bounce rate, avg session duration
- Supports period comparison (7d, 30d, 90d)
- Data cached in Convex `analytics_cache` table to avoid API rate limits

## Admin Dashboard Display
- Real-time analytics at `/admin/analytics`
- Daily sparkline charts
- Period-over-period comparison with trend badges
- Top pages, traffic sources

## CSP Configuration
- `script-src`: `https://www.googletagmanager.com`, `https://www.google-analytics.com`
- `connect-src`: `https://www.google-analytics.com`

---

## Related
- [[Google Search Console]]
- [[Analytics API]]
- [[Admin — System]]
