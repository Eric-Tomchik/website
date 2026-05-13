# Client Portal Overview

> Route: `/portal` — Protected by per-client password authentication

---

## Purpose
Secure client-facing portal for tracking projects, accessing documents, and submitting support tickets. Available to Business Pro and Custom Application clients.

## Authentication
- Login at `/portal/login`
- Per-client email + password (bcrypt hashed)
- Session stored in `portal_session` cookie
- Auth context via `PortalAuthContext.tsx`
- Middleware redirects unauthenticated users to login

## Portal Navigation
| Page | Route | Icon |
|---|---|---|
| Dashboard | `/portal` | LayoutDashboard |
| Projects | `/portal/projects` | FolderKanban |
| Documents | `/portal/documents` | FileText |
| Support | `/portal/tickets` | LifeBuoy |

## Dashboard (`/portal`)
### Quick Stats (4 cards)
1. **Active Projects** — projects not completed/cancelled
2. **Total Projects** — all-time count
3. **Open Tickets** — support tickets not resolved/closed
4. **Documents** — shared document count

### Active Projects
- List of in-progress projects with:
  - Title + description
  - Status badge (discovery, proposal, in_progress, review, completed, on_hold, cancelled)
  - Progress bar (0-100%)
- Links to project details

### Recent Support Tickets
- Last 5 tickets with status
- "New Ticket" button
- Status icons: CheckCircle (resolved), AlertCircle (urgent/high), Clock (pending)

## Data Access
- All queries scoped to authenticated client's ID
- Uses Convex `useQuery()` with client ID filtering
- No access to other clients' data

---

## Related
- [[Portal — Projects]]
- [[Portal — Documents]]
- [[Portal — Tickets]]
- [[Admin — Clients]]
