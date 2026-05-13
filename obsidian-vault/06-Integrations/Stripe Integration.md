# Stripe Integration

> Primary payment processor for book purchases.

---

## Setup
- Client: `src/lib/stripe.ts`
- Publishable key: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Secret key: `STRIPE_SECRET_KEY`
- Webhook secret: `STRIPE_WEBHOOK_SECRET`

## How It's Used

### Checkout Flow
1. User selects book + format on `/books/[slug]`
2. Frontend calls `POST /api/checkout` with items
3. Server creates Stripe Checkout Session with:
   - Line items (book title, format, price)
   - Customer email
   - Success URL: `/books?success=true`
   - Cancel URL: `/books/[slug]`
   - Metadata: book IDs, formats, discount code
4. User redirected to Stripe-hosted checkout
5. On success → Stripe fires webhook

### Webhook Processing (`POST /api/webhook`)
- Event: `checkout.session.completed`
- Verifies signature with `STRIPE_WEBHOOK_SECRET`
- Creates order in Convex
- Generates download tokens for digital items
- Sends confirmation email

### CSP Configuration
Stripe JS is allowed in the Content Security Policy:
- `script-src`: `https://js.stripe.com`
- `connect-src`: `https://api.stripe.com`
- `frame-src`: `https://js.stripe.com`

## Pricing Model
- All prices stored in cents in Convex
- Converted to dollars for display (`formatPrice()`)
- Supports per-format pricing: hardback, paperback, digital
- Discount codes applied server-side before checkout session creation

---

## Related
- [[Checkout API]]
- [[Webhook API]]
- [[PayPal Integration]]
- [[E-Commerce Tables]]
