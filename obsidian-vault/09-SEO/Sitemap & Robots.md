# Sitemap & Robots

> Dynamic sitemap and robots.txt configuration.

---

## Sitemap (`src/app/sitemap.ts`)

### Static Routes
| URL | Priority | Change Frequency |
|---|---|---|
| `/` | 1.0 | weekly |
| `/about` | 0.8 | monthly |
| `/books` | 0.9 | weekly |
| `/blog` | 0.9 | daily |
| `/services` | 0.8 | monthly |
| `/portfolio` | 0.7 | monthly |
| `/contact` | 0.6 | monthly |
| `/faq` | 0.6 | monthly |
| `/resources` | 0.7 | weekly |
| `/credit-checklist` | 0.7 | monthly |
| `/links` | 0.5 | monthly |
| `/privacy` | 0.3 | yearly |
| `/terms` | 0.3 | yearly |

### Dynamic Routes
| Pattern | Source | Priority |
|---|---|---|
| `/books/[slug]` | Convex `books.list` | 0.8 |
| `/blog/[slug]` | Convex `blogPosts.list` | 0.7 |

### Implementation
- Exported as `sitemap()` function
- Queries Convex for dynamic slugs at build/request time
- Returns `MetadataRoute.Sitemap` array

## Robots (`src/app/robots.ts`)

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /portal/
Disallow: /api/
Disallow: /download/
Disallow: /sign/

Sitemap: https://erictomchik.com/sitemap.xml
```

### Blocked Paths
| Path | Reason |
|---|---|
| `/admin/*` | Private admin dashboard |
| `/portal/*` | Private client portal |
| `/api/*` | API endpoints (not pages) |
| `/download/*` | Secure download tokens |
| `/sign/*` | Document signing pages |

---

## Related
- [[SEO Overview]]
