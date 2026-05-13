# Content Tables

> Convex tables for blog, contact messages, reviews, portfolio, services, and media.

---

## `blog_posts`
| Field | Type | Description |
|---|---|---|
| `title` | string | Post title |
| `slug` | string | URL slug |
| `content` | string | Markdown content |
| `category` | enum | `business-credit`, `web-development`, `technology`, `cybersecurity`, `ai`, `general` |
| `tags` | string[] | Tag array |
| `featured_image` | string? | Header image URL |
| `published_at` | number? | Publication timestamp |
| `status` | enum | `draft`, `published` |

**Indexes:** `by_slug`

## `contact_messages`
| Field | Type | Description |
|---|---|---|
| `name` | string | Sender name |
| `email` | string | Sender email |
| `subject` | string | Message subject |
| `message` | string | Message body |
| `service_interest` | string? | Selected service interest |
| `is_read` | boolean | Read status |

## `reviews`
| Field | Type | Description |
|---|---|---|
| `content` | string | Review text |
| `author` | string | Reviewer name |
| `rating` | number? | Star rating |
| `approved` | boolean | Display on site |

## `portfolio_projects`
| Field | Type | Description |
|---|---|---|
| `title` | string | Project name |
| `description` | string | Project description |
| `url` | string | Live URL |
| `client` | string? | Client name |
| `screenshot` | string? | Screenshot URL |
| `tags` | string[] | Technology tags |
| `is_live` | boolean | Currently active |
| `order` | number | Display order |

## `service_plans`
| Field | Type | Description |
|---|---|---|
| `name` | string | Plan name |
| `description` | string | Plan description |
| `features` | string[] | Feature list |
| `price` | string | Pricing text |
| `timeline` | string | Estimated timeline |

## `content_calendar`
| Field | Type | Description |
|---|---|---|
| `title` | string | Content title |
| `type` | string | Content type (blog, social, email) |
| `scheduled_date` | string | Target date |
| `status` | string | Planning status |

## `seo_keywords`
| Field | Type | Description |
|---|---|---|
| `keyword` | string | Target keyword |
| `search_volume` | number? | Monthly search volume |
| `position` | number? | Current ranking |
| `url` | string? | Target page |

## `media_files`
| Field | Type | Description |
|---|---|---|
| `filename` | string | File name |
| `url` | string | File URL |
| `type` | string | MIME type |
| `size` | number | File size in bytes |

---

## Related
- [[Database Schema Overview]]
- [[Blog Page]]
- [[Admin — Content]]
