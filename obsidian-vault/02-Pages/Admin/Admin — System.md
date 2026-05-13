# Admin — System

> Admin sections for services, portfolio, analytics, automations, audit log, and settings.

---

## Services (`/admin/services`)
- Manage web development service plans
- Fields: name, description, features list, pricing, timeline, post-launch support
- Powers the dynamic `/services` page
- Table: `service_plans`

## Portfolio (`/admin/portfolio`)
- Manage portfolio showcase projects
- Fields: title, description, URL, client, screenshot, tags, live status, order
- Table: `portfolio_projects`

## Analytics (`/admin/analytics`)
- Google Analytics 4 dashboard
- Metrics: sessions, page views, bounce rate, avg session duration
- Daily sparkline charts
- Period comparison (7d, 30d, 90d)
- Trend badges (up/down arrows with %)
- Data fetched via `/api/analytics` and cached in Convex `analytics_cache`

## Automations (`/admin/automations`)
- Email drip sequence builder
- Create multi-step automated email campaigns
- Tables: `drip_sequences`, `drip_steps`, `drip_enrollments`
- Flow: subscriber → enrolled in sequence → receives steps on schedule
- Processed via `/api/drip/process`
- Trigger types: newsletter subscribe, manual enrollment

## Audit Log (`/admin/audit-log`)
- Action history for accountability
- Logs admin actions: create, update, delete across all entities
- Table: `audit_log`
- Fields: action type, entity type, entity ID, details, timestamp

## Settings (`/admin/settings`)
- Global site configuration
- Table: `site_settings`
- Key/value store for site-wide settings

---

## Related
- [[Services Page]]
- [[Portfolio Page]]
- [[Google Analytics]]
- [[Marketing Tables]]
