# Design System — Typography

> Font configuration from `src/app/layout.tsx` and `tailwind.config.ts`

---

## Font Stack

### Primary: Inter
- Usage: Body text, UI elements
- Source: Google Fonts (`next/font/google`)
- Variable: `--font-inter`
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Secondary: Playfair Display
- Usage: Headings, hero text, book titles
- Source: Google Fonts
- Variable: `--font-playfair`
- Weights: 700 (bold), 900 (black)
- Style: Serif, editorial feel

## Typography Scale

| Element | Font | Size Class | Weight |
|---|---|---|---|
| Hero H1 | Playfair | `text-5xl` / `text-6xl` | Bold/Black |
| Page H1 | Playfair | `text-4xl` | Bold |
| Section H2 | Inter | `text-3xl` | Semibold |
| Card H3 | Inter | `text-xl` | Semibold |
| Body | Inter | `text-base` | Regular |
| Small/Meta | Inter | `text-sm` | Medium |
| Caption | Inter | `text-xs` | Regular |

## Blog Typography
- Uses Tailwind `prose` classes for long-form content
- `prose-lg` for comfortable reading
- Code blocks with syntax highlighting

---

## Related
- [[Design System — Colors]]
- [[Design System — Animations]]
