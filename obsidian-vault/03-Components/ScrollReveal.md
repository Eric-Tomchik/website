# ScrollReveal

> File: `src/components/ui/ScrollReveal.tsx`

---

## Description
Scroll-triggered animation wrapper using Framer Motion. Elements fade/slide in as they enter the viewport.

## Usage
```tsx
<ScrollReveal>
  <SomeContent />
</ScrollReveal>
```

## Animation
- Uses `IntersectionObserver` (via Framer Motion's `whileInView`)
- Default: fade up from below with slight Y offset
- Triggers once per element (no re-animation on scroll back)
- Stagger support for lists

## Used On
- Homepage sections
- Book catalog cards
- Service plan cards
- About page sections

---

## Related
- [[Design System — Animations]]
