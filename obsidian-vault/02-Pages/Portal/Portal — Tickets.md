# Portal — Tickets

> Route: `/portal/tickets`

---

## Purpose
Client support ticket system. Clients can create tickets, track status, and communicate with Eric.

## Features
- Submit new support tickets
- View ticket history with status
- Threaded messaging per ticket
- Priority indicators

## Ticket Fields
| Field | Type | Description |
|---|---|---|
| `subject` | string | Ticket subject line |
| `description` | string | Initial message |
| `category` | string | Issue category |
| `priority` | enum | `low`, `normal`, `high`, `urgent` |
| `status` | enum | `open`, `in_progress`, `waiting_on_client`, `resolved`, `closed` |
| `client_id` | ID | Associated client |

## Status Flow
```
open → in_progress → waiting_on_client ↔ in_progress → resolved → closed
```

## Data
- Tables: `tickets`, `ticket_messages`
- Messages have: ticket ID, sender (client or admin), content, timestamp

---

## Related
- [[Client Portal Overview]]
- [[Admin — Clients]]
- [[CRM Tables]]
