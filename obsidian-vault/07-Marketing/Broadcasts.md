# Broadcasts

> One-off bulk email campaigns to newsletter subscribers.

---

## Overview
Broadcasts are manually triggered bulk emails sent to all active newsletter subscribers. Used for announcements, new book launches, promotions, and updates.

## Admin UI
- Compose at `/admin/broadcasts`
- Fields: subject, body (rich text/HTML)
- Preview before sending
- Send to all active subscribers

## API
- `POST /api/broadcasts/send`
- Fetches all active `newsletter_subscribers`
- Sends individual emails via Resend
- Records broadcast in `email_broadcasts` table

## Data
| Field | Type | Description |
|---|---|---|
| `subject` | string | Email subject |
| `body` | string | HTML email body |
| `sent_at` | number | When it was sent |
| `recipient_count` | number | How many received it |

## Best Practices
- Preview email in admin before sending
- Check subscriber count first
- Can't unsend — double-check content

---

## Related
- [[Drip Sequences]]
- [[Newsletter API]]
- [[Resend Email]]
