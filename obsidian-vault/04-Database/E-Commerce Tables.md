# E-Commerce Tables

> Convex tables powering the book store and order system.

---

## `books`
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Book title |
| `slug` | string | ✅ | URL-safe identifier |
| `description` | string | ✅ | Short description |
| `long_description` | string | ❌ | Full book description |
| `price_cents` | number | ✅ | Primary (hardback) price in cents |
| `paperback_price_cents` | number | ❌ | Paperback price |
| `digital_price_cents` | number | ❌ | Digital download price |
| `book_format` | `"physical"` \| `"both"` \| `"digital"` \| `"all_formats"` | ✅ | Available formats |
| `cover_image_url` | string | ❌ | Cover image URL |
| `preview_pdf_url` | string | ❌ | "Look Inside" PDF |
| `isbn` | string | ❌ | ISBN number |
| `page_count` | number | ❌ | Number of pages |
| `published_date` | string | ❌ | Publication date |
| `amazon_url` | string | ❌ | Amazon listing URL |
| `is_featured` | boolean | ✅ | Show on homepage |
| `is_active` | boolean | ✅ | Visible in catalog |

**Indexes:** `by_slug`, `by_active`

## `orders`
| Field | Type | Description |
|---|---|---|
| `customer_name` | string | Buyer name |
| `customer_email` | string | Buyer email |
| `items` | array | `[{ book_id, book_title, format, quantity, price_cents }]` |
| `total_cents` | number | Order total in cents |
| `status` | enum | `pending`, `paid`, `shipped`, `fulfilled`, `refunded` |
| `stripe_session_id` | string? | Stripe checkout session ID |
| `shipping_address` | object? | Shipping details for physical orders |
| `discount_code` | string? | Applied discount code |

## `download_tokens`
| Field | Type | Description |
|---|---|---|
| `token` | string | Unique download token |
| `book_id` | ID | Associated book |
| `email` | string | Purchaser email |
| `expires_at` | number | Token expiry timestamp (72 hours) |
| `download_count` | number | Times downloaded |
| `max_downloads` | number | Max allowed (5) |

## `discount_codes`
| Field | Type | Description |
|---|---|---|
| `code` | string | Discount code string |
| `type` | `"percentage"` \| `"fixed"` | Discount type |
| `value` | number | Amount (% or cents) |
| `book_id` | ID? | Specific book targeting |
| `format` | string? | Specific format targeting |
| `is_active` | boolean | Currently active |
| `usage_limit` | number? | Max uses |
| `usage_count` | number | Times used |
| `expires_at` | number? | Expiry timestamp |

---

## Related
- [[Database Schema Overview]]
- [[Stripe Integration]]
- [[Checkout API]]
