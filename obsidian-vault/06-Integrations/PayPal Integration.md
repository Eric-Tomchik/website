# PayPal Integration

> Alternative payment method for book purchases.

---

## Setup
- Package: `@paypal/react-paypal-js`
- Client ID: `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

## How It's Used
- PayPal buttons rendered alongside Stripe checkout on book detail pages
- Uses PayPal's React SDK for client-side integration
- On successful payment → calls `POST /api/paypal/record-order`
- Server records order in Convex and generates download tokens

## CSP Configuration
- `script-src`: `https://www.paypal.com`
- `connect-src`: `https://www.paypal.com`
- `frame-src`: `https://www.paypal.com`

---

## Related
- [[Stripe Integration]]
- [[Checkout API]]
- [[E-Commerce Tables]]
