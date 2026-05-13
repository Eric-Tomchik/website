# Footer Component

> File: `src/components/layout/Footer.tsx`

---

## Description
Full-width site footer with newsletter signup, link columns, and social media icons.

## Layout (4 columns on desktop)

### Column 1: Newsletter
- "Stay in the Loop" heading
- Email input + "Subscribe" button
- `NewsletterForm` component → calls `POST /api/newsletter`

### Column 2: Quick Links
| Link | Route |
|---|---|
| About | `/about` |
| Blog | `/blog` |
| Books | `/books` |
| Services | `/services` |

### Column 3: Resources
| Link | Route |
|---|---|
| Book Resources | `/resources` |
| Portfolio | `/portfolio` |
| FAQ | `/faq` |
| Contact | `/contact` |

### Column 4: Legal
| Link | Route |
|---|---|
| Privacy Policy | `/privacy` |
| Terms of Service | `/terms` |

## Bottom Bar
- Copyright: `© {year} Eric Tomchik. All rights reserved.`
- Social media icons: Facebook, LinkedIn, Instagram, TikTok, X
- Social URLs → see [[Home]]

## Responsive
- 4 columns on desktop → stacked on mobile
- Newsletter form always visible

---

## Related
- [[Navbar]]
- [[Newsletter API]]
