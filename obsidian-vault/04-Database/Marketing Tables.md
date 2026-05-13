# Marketing Tables

> Convex tables for newsletter, drip campaigns, broadcasts, and social media.

---

## `newsletter_subscribers`
| Field | Type | Description |
|---|---|---|
| `email` | string | Subscriber email (lowercased) |
| `subscribed_at` | number | Subscription timestamp |
| `is_active` | boolean | Active or unsubscribed |

**Index:** `by_email` (deduplication)

**Logic:**
- Duplicate email → reactivates if previously unsubscribed
- Unsubscribe sets `is_active: false` (soft delete)

## `drip_sequences`
| Field | Type | Description |
|---|---|---|
| `name` | string | Sequence name |
| `trigger_type` | string | What triggers enrollment |
| `active` | boolean | Currently active |

## `drip_steps`
| Field | Type | Description |
|---|---|---|
| `sequence_id` | ID | Parent sequence |
| `step_number` | number | Order in sequence |
| `subject` | string | Email subject |
| `body` | string | Email HTML body |
| `delay` | number | Delay in hours from previous step |

## `drip_enrollments`
| Field | Type | Description |
|---|---|---|
| `subscriber_id` | ID | Newsletter subscriber |
| `sequence_id` | ID | Drip sequence |
| `current_step` | number | Current step number |
| `status` | enum | `active`, `completed`, `paused` |
| `next_send_at` | number? | Next email timestamp |

## `email_broadcasts`
| Field | Type | Description |
|---|---|---|
| `subject` | string | Email subject |
| `body` | string | Email HTML body |
| `sent_at` | number | Send timestamp |
| `recipient_count` | number | Number of recipients |

## `social_posts`
| Field | Type | Description |
|---|---|---|
| `content` | string | Post text |
| `platform` | string | Target platform |
| `scheduled_at` | number? | Scheduled publish time |
| `published_at` | number? | Actual publish time |
| `status` | enum | `draft`, `scheduled`, `published`, `failed` |
| `external_id` | string? | Platform post ID after publishing |

## `social_campaigns`
| Field | Type | Description |
|---|---|---|
| `name` | string | Campaign name |
| `posts` | ID[] | Associated post IDs |
| `start_date` | string | Campaign start |
| `end_date` | string | Campaign end |

---

## Related
- [[Database Schema Overview]]
- [[Newsletter API]]
- [[Social Media Publishing]]
- [[Admin — Content]]
