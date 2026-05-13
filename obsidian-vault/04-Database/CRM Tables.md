# CRM Tables

> Convex tables for client management, projects, tickets, and documents.

---

## `clients`
| Field | Type | Description |
|---|---|---|
| `name` | string | Client name |
| `email` | string | Client email |
| `company` | string? | Company name |
| `phone` | string? | Phone number |
| `address` | string? | Physical address |
| `notes` | string? | Internal notes |
| `password_hash` | string? | bcrypt hash for portal login |

## `client_sessions`
| Field | Type | Description |
|---|---|---|
| `client_id` | ID | Client reference |
| `session_token` | string | Random session token |
| `expires_at` | number | Expiry timestamp |

## `projects`
| Field | Type | Description |
|---|---|---|
| `title` | string | Project name |
| `description` | string? | Project description |
| `client_id` | ID | Associated client |
| `status` | enum | `discovery`, `proposal`, `in_progress`, `review`, `completed`, `on_hold`, `cancelled` |
| `progress_percent` | number | 0–100 completion |
| `budget` | number? | Project budget in cents |
| `start_date` | string? | Start date |
| `end_date` | string? | Target end date |

## `project_milestones`
| Field | Type | Description |
|---|---|---|
| `project_id` | ID | Parent project |
| `title` | string | Milestone name |
| `description` | string? | Details |
| `due_date` | string? | Target date |
| `completed` | boolean | Completion status |

## `tickets`
| Field | Type | Description |
|---|---|---|
| `subject` | string | Ticket subject |
| `description` | string | Initial message |
| `category` | string | Issue category |
| `priority` | enum | `low`, `normal`, `high`, `urgent` |
| `status` | enum | `open`, `in_progress`, `waiting_on_client`, `resolved`, `closed` |
| `client_id` | ID | Associated client |

## `ticket_messages`
| Field | Type | Description |
|---|---|---|
| `ticket_id` | ID | Parent ticket |
| `sender` | string | `admin` or `client` |
| `content` | string | Message text |

## `client_documents`
| Field | Type | Description |
|---|---|---|
| `client_id` | ID | Associated client |
| `type` | enum | `contract`, `invoice`, `proposal`, `other` |
| `title` | string | Document title |
| `file_url` | string | File location |
| `signature_status` | enum? | `pending`, `sent`, `viewed`, `signed`, `declined` |
| `signed_at` | number? | Signature timestamp |
| `signer_name` | string? | Signer name |
| `signer_email` | string? | Signer email |

---

## Related
- [[Database Schema Overview]]
- [[Client Portal Overview]]
- [[Admin — Clients]]
