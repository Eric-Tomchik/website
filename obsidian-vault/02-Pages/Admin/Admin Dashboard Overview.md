# Admin Dashboard Overview

> Route: `/admin` — Protected by TOTP 2FA authentication

---

## Purpose
Full-featured administration panel for managing the entire website: e-commerce, content, clients, marketing, and analytics.

## Authentication
- Login at `/admin/login`
- Requires password + TOTP code (time-based one-time password)
- Session stored as JWT in `admin_session` cookie
- Verified via `verifyAdminToken()` in `src/lib/adminAuth.ts`
- Middleware redirects unauthenticated users to login

## Dashboard Home (`/admin`)
### Metrics Display (7 cards)
1. **Revenue (30d)** — with % change vs previous 30 days
2. **Orders (30d)** — with % change
3. **Avg Order Value** — total revenue / total orders
4. **Total Revenue** — all-time with order count
5. **Books** — total count in catalog
6. **Customers** — unique customer emails
7. **Messages** — unread contact form count

### Charts
- **Revenue (Last 14 Days)** — Bar chart with daily revenue
- **Sales by Format** — Digital / Paperback / Hardback breakdown with stacked bar

### Tables
- **Top Books** — Ranked by all-time revenue with progress bars
- **Recent Orders** — Last 5 orders with status badges

---

## Admin Sidebar Navigation

### Overview
| Page | Route | Icon |
|---|---|---|
| Dashboard | `/admin` | LayoutDashboard |
| Notifications | `/admin/notifications` | Bell |

### Commerce
| Page | Route | Icon |
|---|---|---|
| Books | `/admin/books` | BookOpen |
| Orders | `/admin/orders` | ShoppingCart |
| Revenue | `/admin/revenue` | DollarSign |
| Invoices | `/admin/invoices` | Receipt |
| Discounts | `/admin/discounts` | Tag |

### Clients
| Page | Route | Icon |
|---|---|---|
| Clients | `/admin/clients` | Users |
| Contracts | `/admin/contracts` | Sparkles |
| Project Board | `/admin/kanban` | Columns3 |
| Tickets | `/admin/tickets` | LifeBuoy |
| Messages | `/admin/messages` | MessageSquare |

### Content
| Page | Route | Icon |
|---|---|---|
| Blog Posts | `/admin/blog` | FileText |
| Newsletter | `/admin/newsletter` | Mail |
| Broadcasts | `/admin/broadcasts` | Send |
| Social Media | `/admin/social` | Share2 |
| Reviews | `/admin/reviews` | MessageSquareQuote |
| Media Library | `/admin/media` | FolderOpen |
| SEO Planner | `/admin/seo` | Target |

### System
| Page | Route | Icon |
|---|---|---|
| Services | `/admin/services` | Wrench |
| Portfolio | `/admin/portfolio` | Briefcase |
| Analytics | `/admin/analytics` | BarChart3 |
| Automations | `/admin/automations` | Zap |
| Audit Log | `/admin/audit-log` | ScrollText |
| Settings | `/admin/settings` | Settings |

## Badge Notifications
The sidebar shows live badge counts for:
- **Orders** — new/unprocessed orders
- **Messages** — unread contact messages
- **Tickets** — open support tickets
- **Social** — scheduled posts pending

---

## Related
- [[Admin — Commerce]]
- [[Admin — Clients]]
- [[Admin — Content]]
- [[Admin — System]]
- [[Security — CSP & Auth]]
