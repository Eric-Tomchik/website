# Search Provider

> File: `src/components/ui/SearchProvider.tsx`

---

## Description
Site-wide search modal. Triggered by the search icon in the navbar. Searches across all site content.

## Features
- **Keyboard shortcut:** `Cmd+K` / `Ctrl+K` to open
- **Real-time search:** Types and filters as you go
- **Results include:** pages, blog posts, books, FAQ items
- **Search index:** Built via `/api/search-index` endpoint
- **Client-side filtering:** Fast in-browser search after index load

## UI
- Overlay modal with large search input
- Results grouped by type (Pages, Books, Blog, FAQ)
- Keyboard navigation (arrow keys + Enter)
- Click or Enter to navigate to result

---

## Related
- [[Navbar]]
