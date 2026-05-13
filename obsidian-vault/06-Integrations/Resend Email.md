# Resend Email

> Transactional and marketing email delivery.

---

## Setup
- API Key: `RESEND_API_KEY`
- Package: `resend`

## Email Types

### Transactional Emails
| Email | Trigger | Content |
|---|---|---|
| Order confirmation | Stripe webhook | Order details + download links (digital) |
| Download link | Free checkout | Download URL with token |
| Contact notification | Contact form | New message alert to admin |
| Invoice email | Admin action | Invoice PDF + payment link |
| Signature request | Admin action | Document signing link |
| Status update | Admin action | Project milestone/status notification |

### Marketing Emails
| Email | Trigger | Content |
|---|---|---|
| Drip sequence | Scheduled | Multi-step automated campaigns |
| Broadcasts | Manual | One-off bulk emails to subscribers |
| Client notifications | Admin action | Project updates, invoice reminders |

## CSP Configuration
- `connect-src`: `https://api.resend.com`

## From Address
- Sent from domain associated with Resend account
- Likely: `notifications@erictomchik.com` or similar

---

## Related
- [[Newsletter API]]
- [[Admin — Content]]
- [[Marketing Tables]]
