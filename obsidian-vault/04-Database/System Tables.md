# System Tables

> Convex tables for invoices, analytics, rate limiting, notifications, and settings.

---

## `invoices`
| Field | Type | Description |
|---|---|---|
| `client_id` | ID | Associated client |
| `items` | array | Line items with description, quantity, amount |
| `total` | number | Invoice total in cents |
| `tax` | number? | Tax amount |
| `status` | enum | `draft`, `sent`, `paid`, `overdue`, `cancelled` |
| `due_date` | string | Payment due date |
| `notes` | string? | Invoice notes |
| `pdf_url` | string? | Generated PDF URL |

## `analytics_cache`
| Field | Type | Description |
|---|---|---|
| `key` | string | Cache key (e.g., `ga4_7d`) |
| `data` | any | Cached analytics data |
| `fetched_at` | number | Cache timestamp |

## `rate_limits`
| Field | Type | Description |
|---|---|---|
| `key` | string | Rate limit key (e.g., IP + endpoint) |
| `count` | number | Request count in window |
| `window_start` | number | Window start timestamp |

**Cleanup:** Expired entries cleaned hourly via cron job.

## `notifications`
| Field | Type | Description |
|---|---|---|
| `type` | string | Notification type |
| `title` | string | Title text |
| `message` | string | Body text |
| `read` | boolean | Read status |
| `link` | string? | Click-through URL |

## `audit_log`
| Field | Type | Description |
|---|---|---|
| `action` | string | Action type (create, update, delete) |
| `entity_type` | string | Entity type (book, order, client, etc.) |
| `entity_id` | string | Entity identifier |
| `details` | string? | Additional details |

## `site_settings`
| Field | Type | Description |
|---|---|---|
| `key` | string | Setting key |
| `value` | string | Setting value |

---

## Related
- [[Database Schema Overview]]
- [[Admin — System]]
