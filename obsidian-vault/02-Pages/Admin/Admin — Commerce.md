# Admin — Commerce

> Admin sections for managing books, orders, revenue, invoices, and discounts.

---

## Books Management (`/admin/books`)
- CRUD for book catalog
- Fields: title, slug, description, long description, cover image, pricing (hardback/paperback/digital), ISBN, page count, published date, preview PDF, Amazon URL, featured flag, active flag
- Format options: `physical`, `both`, `digital`, `all_formats`
- Managed via Convex `books` table

## Orders (`/admin/orders`)
- View all orders with status tracking
- Order statuses: `pending`, `paid`, `shipped`, `fulfilled`, `refunded`
- Each order includes: customer name, email, items (book + format + quantity + price), shipping address, total, Stripe session ID, discount codes
- Badge: shows count of new orders

## Revenue (`/admin/revenue`)
- Financial analytics dashboard
- Revenue trends over time
- Breakdown by format (digital vs paperback vs hardback)
- Top-selling books
- Average order value tracking

## Invoices (`/admin/invoices`)
- Full invoicing system for freelance clients
- Create, edit, send invoices with email notifications
- Fields: client, line items, amounts, tax, due date, status, notes
- Invoice statuses: `draft`, `sent`, `paid`, `overdue`, `cancelled`
- PDF generation via `pdf-lib`
- Sends invoice email to client via Resend

## Discounts (`/admin/discounts`)
- Discount code management
- Types: percentage or fixed amount
- Targeting: per-book, per-format, or site-wide
- Fields: code, type, value, active flag, usage limits, expiry
- Validated via `/api/discount/validate`

---

## Related
- [[Books Page]]
- [[Book Detail Page]]
- [[Stripe Integration]]
- [[E-Commerce Tables]]
