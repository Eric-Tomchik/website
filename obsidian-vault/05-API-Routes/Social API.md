# Social API

> Handles social media post scheduling and publishing.

---

## Publish Post — `POST /api/social/publish`

### Flow
1. Fetch social post from Convex
2. Determine platform (Facebook, Instagram, X, LinkedIn)
3. Call platform-specific publisher from `src/lib/socialPublishers.ts`
4. Update post status to `published` with `external_id`
5. Log result

## Process Scheduled — `POST /api/social/process`

### Flow (triggered by cron or manual)
1. Query all posts with status `scheduled` and `scheduled_at <= now`
2. For each: call publish flow
3. Update statuses accordingly
4. Handle failures gracefully (set status to `failed`)

## Platform Publishers (`src/lib/socialPublishers.ts`)

### Facebook Pages
- Uses Facebook Graph API
- Requires: `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN`
- Posts text content to page feed

### Instagram
- Via Facebook Graph API (Instagram Business Account)
- Image + caption publishing

### X (Twitter)
- Twitter API v2
- Text post publishing

### LinkedIn
- LinkedIn API
- Professional content sharing

---

## Related
- [[Social Media Publishing]]
- [[Admin — Content]]
- [[Marketing Tables]]
