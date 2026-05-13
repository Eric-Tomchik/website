# Security — CSP & Auth

> Content Security Policy, authentication, and security measures.

---

## Content Security Policy (CSP)

### Implementation
- Generated per-request in `middleware.ts`
- Cryptographic nonce generated for each request
- Nonce passed via custom header to layout for inline scripts

### CSP Directives

| Directive | Allowed Sources |
|---|---|
| `default-src` | `'self'` |
| `script-src` | `'self'`, `'nonce-{random}'`, Stripe, PayPal, Google Tag Manager, Google Analytics, Facebook Connect |
| `style-src` | `'self'`, `'unsafe-inline'` (required for Tailwind) |
| `img-src` | `'self'`, `data:`, `blob:`, various CDNs |
| `connect-src` | `'self'`, Convex, Stripe API, PayPal, Google Analytics, Resend, Facebook |
| `frame-src` | `'self'`, Stripe, PayPal |
| `font-src` | `'self'`, Google Fonts CDN |

### Allowed External Domains
```
js.stripe.com, api.stripe.com
www.paypal.com
www.googletagmanager.com, www.google-analytics.com
connect.facebook.net, www.facebook.com
api.resend.com
*.convex.cloud (Convex deployment)
```

## Authentication

### Admin Auth
| Aspect | Implementation |
|---|---|
| Method | Password + TOTP 2FA |
| Password | Validated against `ADMIN_PASSWORD` env var |
| TOTP | `speakeasy` library, authenticator app |
| Session | JWT in `admin_session` cookie |
| Cookie flags | httpOnly, secure, sameSite: strict |
| Validation | `verifyAdminToken()` in `src/lib/adminAuth.ts` |

### Portal Auth
| Aspect | Implementation |
|---|---|
| Method | Email + Password |
| Password storage | bcrypt hash in `clients` table |
| Session | Random token in `client_sessions` table |
| Cookie | `portal_session` cookie |

### Route Protection
- Middleware checks for valid session cookies on:
  - `/admin/*` routes → redirect to `/admin/login`
  - `/portal/*` routes → redirect to `/portal/login`

## Other Security Measures
| Measure | Implementation |
|---|---|
| Rate limiting | Per-key counters in Convex `rate_limits` table |
| Honeypot fields | Hidden form fields to catch bots on contact form |
| Input sanitization | `escapeHtml()` in `src/lib/sanitize.ts` |
| Download tokens | Time-limited (72hr), usage-limited (5), unique per purchase |
| Stripe signature verification | `STRIPE_WEBHOOK_SECRET` for webhook validation |
| XSS prevention | CSP nonces + input escaping |

---

## Related
- [[Auth API]]
- [[Admin Dashboard Overview]]
- [[Client Portal Overview]]
- [[Cloudflare Deployment]]
