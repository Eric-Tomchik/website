# Theme Toggle

> File: `src/components/layout/ThemeToggle.tsx`

---

## Description
Dark/light mode toggle button in the navbar.

## Implementation
- Uses `next-themes` package
- Toggles between `dark` and `light` themes
- Persisted in `localStorage`
- Respects `prefers-color-scheme` on first visit

## Icons
- Sun icon for light mode
- Moon icon for dark mode
- Smooth icon transition animation

## Tailwind Integration
- `dark:` prefix classes throughout codebase
- CSS custom properties for theme colors in `tailwind.config.ts`
- See [[Design System — Colors]]

---

## Related
- [[Navbar]]
- [[Design System — Colors]]
