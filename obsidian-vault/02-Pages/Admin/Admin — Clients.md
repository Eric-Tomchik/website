# Admin — Clients

> Admin sections for CRM, contracts, project management, tickets, and messages.

---

## Clients CRM (`/admin/clients`)
- Client database for freelance/agency work
- Fields: name, email, company, phone, address, notes
- Links to: projects, invoices, documents, tickets
- Client portal access management

## Contracts (`/admin/contracts`)
- Document signing workflow
- Create contracts, proposals, and other documents
- Document types: `contract`, `invoice`, `proposal`, `other`
- Digital signature workflow:
  1. Admin creates document → uploads/generates it
  2. Sends signature request email via Resend
  3. Client signs at `/sign/[token]`
  4. Signature captured and stored
- Signature statuses: `pending`, `sent`, `viewed`, `signed`, `declined`

## Project Board / Kanban (`/admin/kanban`)
- Drag-and-drop project management board
- Project statuses: `discovery`, `proposal`, `in_progress`, `review`, `completed`, `on_hold`, `cancelled`
- Each project has: title, description, client link, status, progress %, milestones, start/end dates, budget
- Milestone tracking with `project_milestones` table

## Tickets (`/admin/tickets`)
- Client support ticket management
- Ticket fields: subject, description, category, priority, status, client ID
- Categories: varies by client need
- Priority levels: `low`, `normal`, `high`, `urgent`
- Statuses: `open`, `in_progress`, `waiting_on_client`, `resolved`, `closed`
- Threaded messages via `ticket_messages` table
- Badge: shows open ticket count

## Messages (`/admin/messages`)
- Contact form submission inbox
- Fields: name, email, subject, message, service interest, read/unread status
- Actions: mark read/unread, delete, reply (via email)
- Badge: shows unread count

---

## Related
- [[Client Portal Overview]]
- [[CRM Tables]]
- [[Contact Page]]
