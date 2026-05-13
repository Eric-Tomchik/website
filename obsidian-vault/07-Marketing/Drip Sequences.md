# Drip Sequences

> Automated email campaigns that nurture subscribers over time.

---

## Overview
Drip sequences are multi-step automated email campaigns. When a subscriber enrolls (e.g., newsletter signup), they receive a series of emails on a timed schedule.

## Architecture
| Table | Purpose |
|---|---|
| `drip_sequences` | Campaign definitions (name, trigger, active) |
| `drip_steps` | Individual emails (subject, body, delay, order) |
| `drip_enrollments` | Subscriber enrollment tracking (status, current step, next send) |

## Flow
```
Newsletter signup → Auto-enroll in active sequences
  → Step 1: Sent immediately (or after initial delay)
  → Wait X hours
  → Step 2: Sent
  → Wait X hours
  → Step 3: Sent
  → ... until all steps complete
  → Status: "completed"
```

## Processing
- Endpoint: `POST /api/drip/process`
- Queries enrollments where `next_send_at <= now` and status is `active`
- Sends email via Resend
- Advances to next step or marks completed
- Triggered periodically (cron or manual)

## Admin Management
- Build sequences at `/admin/automations`
- Create/edit steps with subject, body, delay
- Preview emails before activating
- View enrollment stats

## Enrollment Statuses
| Status | Description |
|---|---|
| `active` | Currently receiving emails |
| `completed` | All steps sent |
| `paused` | Temporarily paused (e.g., unsubscribed) |

---

## Related
- [[Newsletter API]]
- [[Marketing Tables]]
- [[Admin — Content]]
- [[Resend Email]]
