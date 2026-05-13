# Analytics API

> Fetches and caches Google Analytics 4 and Google Search Console data.

---

## GA4 Analytics — `GET /api/analytics`

### Flow
1. Check `analytics_cache` in Convex for recent data
2. If cached data is fresh enough → return cached
3. Otherwise: call GA4 Data API using service account credentials
4. Metrics fetched: sessions, page views, bounce rate, avg session duration
5. Store in `analytics_cache` for future requests
6. Return formatted data

### Query Parameters
- `period` — `7d`, `30d`, `90d`

## GA4 Refresh — `POST /api/analytics`
- Force-refresh analytics cache
- Useful for cron-triggered updates

## GSC Data — `GET /api/gsc`
- Fetches Google Search Console performance data
- Metrics: queries, pages, clicks, impressions, CTR, average position
- Breakdowns: by device, by country
- Uses `GSC_SITE_URL` env var

## GSC Refresh — `POST /api/gsc`
- Force-refresh GSC data cache

---

## Related
- [[Google Analytics]]
- [[Google Search Console]]
- [[Admin — System]]
