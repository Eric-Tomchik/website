# Social Media Publishing

> Automated social media posting to multiple platforms.

---

## Supported Platforms
| Platform | API | Env Vars |
|---|---|---|
| Facebook Pages | Graph API | `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN` |
| Instagram | Graph API (Business) | Shared with Facebook |
| X (Twitter) | Twitter API v2 | Twitter API keys |
| LinkedIn | LinkedIn API | LinkedIn API keys |

## Implementation
- Publishers: `src/lib/socialPublishers.ts`
- Admin UI: `/admin/social`
- API: `/api/social/publish`, `/api/social/process`

## Workflow
1. **Draft** — Create post in admin with content + platform selection
2. **Schedule** — Set date/time for publishing
3. **Process** — Cron or manual trigger processes scheduled posts
4. **Publish** — Platform-specific API call
5. **Track** — External post ID stored for reference

## Post Statuses
- `draft` → `scheduled` → `published`
- `draft` → `scheduled` → `failed` (on API error)

## Campaign Grouping
- Group related posts into `social_campaigns`
- Track campaign performance across platforms

## CSP Configuration
- `connect-src`: `https://www.facebook.com`
- `script-src`: `https://connect.facebook.net`

---

## Related
- [[Social API]]
- [[Admin — Content]]
- [[Marketing Tables]]
