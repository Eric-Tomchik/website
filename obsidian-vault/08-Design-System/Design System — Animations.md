# Design System — Animations

> Motion design using Framer Motion.

---

## Library
- Package: `framer-motion` (v12.x)
- Used throughout for page transitions, scroll reveals, and micro-interactions

## Animation Patterns

### Scroll Reveal
- Component: [[ScrollReveal]]
- Fade up from below as elements enter viewport
- `whileInView` trigger, fires once
- Stagger delay for lists

### Page Transitions
- Subtle fade-in on route changes
- Used in main content area

### Hero Animations
- Gradient glow effect behind hero content
- Animated counter numbers (scrolling digits)
- Typewriter or fade-in text effects

### Card Hover Effects
- Slight scale up (`scale: 1.02`)
- Border color transition to brand accent
- Shadow increase on hover

### Drawer Animations
- Checkout drawer: slide in from right
- Mobile nav: slide in from left
- Overlay fade in

### Button Animations
- `whileHover`: slight scale
- `whileTap`: scale down (press effect)

### Banner
- Announcement banner: slide down entrance
- Dismiss: slide up + fade out

## Performance
- `will-change` hints for GPU acceleration
- `layout` animations avoided for complex content
- Reduced motion: respects `prefers-reduced-motion`

---

## Related
- [[Design System — Colors]]
- [[Design System — Typography]]
- [[ScrollReveal]]
