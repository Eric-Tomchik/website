# Webhook API

> Handles incoming webhooks from external services.

---

## Stripe Webhook — `POST /api/webhook`

### Security
- Validates Stripe signature using `STRIPE_WEBHOOK_SECRET`
- Rejects requests with invalid signatures

### Handled Events

#### `checkout.session.completed`
1. Extract metadata (book IDs, formats, customer info, discount code)
2. Create order in Convex `orders` table with status `paid`
3. For digital items: generate `download_tokens` (72hr expiry, 5 max downloads)
4. Send confirmation email via Resend with download links
5. Log to `audit_log`

#### Other Events
- `payment_intent.succeeded` — additional payment confirmation
- Refund events — update order status to `refunded`

### Error Handling
- Returns 200 even on processing errors to prevent Stripe retries for non-retryable failures
- Logs errors for debugging

---

## Related
- [[Stripe Integration]]
- [[Checkout API]]
- [[E-Commerce Tables]]
