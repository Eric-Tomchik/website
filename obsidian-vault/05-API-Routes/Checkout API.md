# Checkout API

> Handles book purchases via Stripe and PayPal.

---

## Stripe Checkout — `POST /api/checkout`

### Request
```json
{
  "items": [
    {
      "bookId": "convex-id",
      "format": "hardback",
      "quantity": 1
    }
  ],
  "discountCode": "SAVE10"
}
```

### Flow
1. Validate items — look up books in Convex, verify prices
2. Validate discount code (if provided) via `discount_codes` table
3. Calculate total with discounts
4. Create Stripe Checkout Session with:
   - Line items with correct prices
   - Customer email
   - Success/cancel URLs
   - Metadata (book IDs, formats, discount code)
5. Return checkout session URL

### Success Flow
Handled by [[Webhook API]] — Stripe sends `checkout.session.completed` event.

## Free Download — `POST /api/checkout/free`

### Request
```json
{
  "bookId": "convex-id",
  "email": "user@example.com"
}
```

### Flow
1. Verify book exists and has a free digital version
2. Capture email
3. Generate download token
4. Send download email via Resend
5. Optionally enroll in newsletter

## PayPal Order — `POST /api/paypal/record-order`

### Flow
1. Receives PayPal order completion data
2. Creates order record in Convex
3. Generates download tokens for digital items
4. Sends confirmation email

## Discount Validation — `POST /api/discount/validate`

### Request
```json
{
  "code": "SAVE10",
  "bookId": "convex-id",
  "format": "digital"
}
```

### Response
```json
{
  "valid": true,
  "type": "percentage",
  "value": 10,
  "message": "10% off applied!"
}
```

---

## Related
- [[Stripe Integration]]
- [[PayPal Integration]]
- [[Webhook API]]
- [[E-Commerce Tables]]
