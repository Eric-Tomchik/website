# Contact Page

> Route: `/contact` — File: `src/app/contact/page.tsx`

---

## Purpose
Contact form for inquiries about web development services, book orders, speaking, consulting, and general questions.

## Metadata
| Field | Value |
|---|---|
| **Title** | Contact — Eric Tomchik |
| **Description** | Get in touch for web development services, book orders, or general inquiries. |
| **Canonical** | `https://erictomchik.com/contact` |

## Form Fields
| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text | ✅ | Full name |
| Email | email | ✅ | Reply-to address |
| Subject | text | ✅ | Message subject |
| Service Interest | dropdown | ❌ | Options: Web Dev, Book Inquiry, Consulting, Speaking, Other |
| Message | textarea | ✅ | Free-form message |
| Honeypot | hidden | — | Anti-spam field (hidden from users) |

## Anti-Spam
- **Honeypot field** — hidden field that bots fill out; submissions with content in this field are rejected
- **Rate limiting** — via Convex `rate_limits` table, prevents repeated submissions

## Submission Flow
1. Form validated client-side
2. POST to `/api/contact`
3. Rate limit check
4. Inserted into Convex `contact_messages` table with `is_read: false`
5. Notification email sent to admin via Resend
6. Admin reviews at `/admin/messages`

## Contact Information
| Method | Value |
|---|---|
| **Email** | info@erictomchik.com |
| **Response Time** | Within 24 hours |

---

## Related
- [[Admin — Clients]]
- [[FAQ Page]]
