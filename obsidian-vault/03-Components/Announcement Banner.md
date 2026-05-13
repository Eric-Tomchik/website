# Announcement Banner

> File: `src/components/layout/AnnouncementBanner.tsx`

---

## Description
Dismissible banner at the very top of the page (above navbar). Promotes the latest book or special offer.

## Current Content
- Promoting: "Credit Without a Credit Score"
- CTA: Links to `/books/credit-without-a-credit-score`

## Behavior
- **Dismissible:** X button hides the banner
- **Persistent:** Uses `localStorage` key to remember dismissal
- **Reappears:** When banner content changes (new `localStorage` key)
- **Mobile-friendly:** Single-line on mobile with wrapping text

## Styling
- Brand gradient background
- White text + CTA link
- Animated entrance (slide down)

---

## Related
- [[Homepage]]
- [[Books Page]]
