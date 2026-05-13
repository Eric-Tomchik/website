# Blog Page

> Route: `/blog` — File: `src/app/blog/page.tsx`

---

## Purpose
Content hub with two sections: original blog posts and curated industry news from RSS feeds.

## Metadata
| Field | Value |
|---|---|
| **Title** | Blog — Eric Tomchik |
| **Description** | Insights on business credit, web development, cybersecurity, AI, and more. |
| **Canonical** | `https://erictomchik.com/blog` |

## Two Tab Sections

### Tab 1: My Articles
- Original blog posts authored by Eric
- Stored in Convex `blog_posts` table
- Categories: `business-credit`, `web-development`, `technology`, `cybersecurity`, `ai`, `general`
- Features: search bar, category filter pills, tag system

### Tab 2: Industry News
- Curated RSS feeds from 9 external sources
- Fetched server-side via `src/lib/rss.ts`
- Sources organized by category:

**Cybersecurity:**
| Source | URL |
|---|---|
| Krebs on Security | krebsonsecurity.com |
| The Hacker News | thehackernews.com |
| Dark Reading | darkreading.com |

**Web Development:**
| Source | URL |
|---|---|
| CSS-Tricks | css-tricks.com |
| Smashing Magazine | smashingmagazine.com |
| The New Stack | thenewstack.io |

**AI & Technology:**
| Source | URL |
|---|---|
| Ars Technica | arstechnica.com |
| The Verge AI | theverge.com |
| OpenAI Blog | openai.com |

### Blog Post Detail (`/blog/[slug]`)
- Full article rendering with prose typography
- Auto-generated table of contents
- Inline newsletter CTA
- Related articles

### News Reader (`/news/[slug]`)
- On-site full article view from RSS items
- No redirect to external sites — read directly on erictomchik.com

## Components
- `BlogTabs` — Tab switching between articles and news
- Category filter pills
- Search bar
- Tag cloud

---

## Related
- [[Admin — Content]]
- [[Newsletter API]]
- [[Content Tables]]
