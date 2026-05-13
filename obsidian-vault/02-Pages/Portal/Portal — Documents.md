# Portal — Documents

> Route: `/portal/documents`

---

## Purpose
Shared document access for clients — contracts, invoices, proposals, and other project-related files.

## Features
- View all documents shared with the client
- Document types: `contract`, `invoice`, `proposal`, `other`
- Download shared files
- Digital signature workflow for contracts
- Signature at `/sign/[token]` — dedicated signing page

## Document Signing Flow
1. Admin creates document at `/admin/contracts`
2. Sends signature request email to client
3. Client receives email with signing link
4. Client opens `/sign/[token]` — views document + signs
5. Signature status updates: `pending` → `sent` → `viewed` → `signed`
6. Admin sees signed document in admin panel

## Data
- Table: `client_documents`
- Fields: client ID, type, title, file URL, signature status, signed at, signer name/email

---

## Related
- [[Client Portal Overview]]
- [[Admin — Clients]]
