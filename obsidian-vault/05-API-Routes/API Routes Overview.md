# API Routes Overview

> All server-side API routes at `src/app/api/`
> Runtime: Cloudflare Workers (via OpenNext adapter)

---

## Complete Route Table

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/analytics` | GET | Admin | Fetch GA4 analytics data (cached in Convex) |
| `/api/analytics` | POST | Admin | Refresh analytics cache |
| `/api/auth/login` | POST | None | Admin TOTP login → sets session cookie |
| `/api/auth/logout` | POST | Admin | Admin logout → clears session cookie |
| `/api/auth/totp-setup` | POST | Admin | Generate TOTP secret + QR code |
| `/api/broadcasts/send` | POST | Admin | Send bulk email to all active subscribers |
| `/api/checkout` | POST | None | Create Stripe checkout session for book purchase |
| `/api/checkout/free` | POST | None | Process free e-book download (email capture) |
| `/api/contact` | POST | None | Handle contact form submission (rate limited) |
| `/api/discount/validate` | POST | None | Validate a discount code |
| `/api/download/[token]` | GET | Token | Serve secure file download (5 max, 72hr expiry) |
| `/api/drip/process` | POST | Admin | Process pending drip email sends |
| `/api/feed` | GET | None | RSS feed output |
| `/api/gsc` | GET | Admin | Fetch Google Search Console data |
| `/api/gsc` | POST | Admin | Refresh GSC data cache |
| `/api/newsletter` | POST | None | Subscribe email to newsletter |
| `/api/newsletter/unsubscribe` | POST | None | Unsubscribe email |
| `/api/notify/client` | POST | Admin | Send notification email to client |
| `/api/paypal/record-order` | POST | None | Record completed PayPal order |
| `/api/portal/login` | POST | None | Client portal login → sets session cookie |
| `/api/portal/session` | GET | Portal | Validate portal session cookie |
| `/api/search-index` | GET | None | Build site-wide search index |
| `/api/social/publish` | POST | Admin | Publish a social media post immediately |
| `/api/social/process` | POST | Admin | Process all scheduled social posts |
| `/api/webhook` | POST | Stripe | Stripe webhook handler (signature verified) |

---

## Related
- [[Auth API]]
- [[Checkout API]]
- [[Webhook API]]
- [[Newsletter API]]
- [[Social API]]
- [[Analytics API]]
