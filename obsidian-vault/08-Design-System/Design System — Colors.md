# Design System — Colors

> Color palette defined in `tailwind.config.ts`

---

## Color System
The site uses a custom color palette with semantic naming for light and dark mode support.

## Brand Colors
| Token | Purpose |
|---|---|
| `brand-50` through `brand-950` | Primary brand color scale |
| `brand-500` | Default brand accent (links, CTAs, active states) |
| `brand-600` | Hover states |
| `brand-700` | Pressed/active states |

## Surface Colors
| Token | Purpose |
|---|---|
| `surface-50` through `surface-950` | Background and card surfaces |
| `surface-900` | Primary dark background |
| `surface-800` | Card/elevated surface |
| `surface-700` | Borders on dark |

## Semantic Usage
| Use Case | Light Mode | Dark Mode |
|---|---|---|
| Page background | `surface-50` | `surface-950` |
| Card background | `white` | `surface-900` |
| Card border | `surface-200` | `surface-700` |
| Primary text | `surface-900` | `surface-50` |
| Secondary text | `surface-600` | `surface-400` |
| Brand accent | `brand-500` | `brand-400` |
| CTA buttons | `brand-500` bg | `brand-500` bg |

## Dark Mode
- Implemented via `next-themes` + Tailwind `dark:` prefixes
- Toggle: see [[Theme Toggle]]
- Default: system preference

---

## Related
- [[Design System — Typography]]
- [[Design System — Animations]]
- [[Theme Toggle]]
