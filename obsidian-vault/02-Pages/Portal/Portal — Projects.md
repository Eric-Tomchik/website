# Portal — Projects

> Route: `/portal/projects`

---

## Purpose
Client view of their web development projects with status, milestones, and progress tracking.

## Features
- View all projects assigned to the client
- Project status with color-coded badges
- Progress percentage with visual bar
- Project milestones timeline
- Description and notes

## Project Statuses
| Status | Color | Description |
|---|---|---|
| `discovery` | Blue | Initial requirements gathering |
| `proposal` | Purple | Proposal/quote sent |
| `in_progress` | Yellow | Active development |
| `review` | Orange | Client review period |
| `completed` | Green | Project delivered |
| `on_hold` | Gray | Paused |
| `cancelled` | Red | Cancelled |

## Data
- Table: `projects`
- Related: `project_milestones`
- Scoped to authenticated client ID

---

## Related
- [[Client Portal Overview]]
- [[Admin — Clients]]
- [[CRM Tables]]
