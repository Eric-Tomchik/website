# Navbar

> File: `src/components/layout/Navbar.tsx`

---

## Description
Full-width responsive navigation bar. Fixed to top. Adapts between desktop horizontal nav and mobile hamburger menu.

## Navigation Links (8 items)
| Label | Route | Position |
|---|---|---|
| Home | `/` | Left |
| About | `/about` | Left |
| Books | `/books` | Left |
| Blog | `/blog` | Left |
| Services | `/services` | Left |
| Portfolio | `/portfolio` | Left |
| FAQ | `/faq` | Left |
| Contact | `/contact` | Left |

## Right-Side Actions
| Element | Behavior |
|---|---|
| Search Icon | Opens `SearchProvider` modal |
| Theme Toggle | Toggles dark/light mode (see [[Theme Toggle]]) |
| Client Portal link | Links to `/portal` |
| "Shop Books" CTA button | Links to `/books` (primary brand color) |

## Responsive Behavior
- **Desktop:** Horizontal link bar with right-side actions
- **Mobile:** Hamburger menu icon → slide-out drawer with all links + actions
- **Scroll:** Slight background blur/opacity change on scroll

## Active State
- Current page link highlighted with brand accent color/underline

---

## Related
- [[Footer Component]]
- [[Search Provider]]
- [[Theme Toggle]]
