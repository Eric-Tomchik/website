# Environment Variables

> All required and optional environment variables for running the site.

---

## Required Variables

### Convex
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL (e.g., `https://your-project.convex.cloud`) |
| `CONVEX_DEPLOY_KEY` | Production deploy key (e.g., `prod:your-deploy-key`) |
| `CONVEX_AUTH_SECRET` | Secret used for admin API key validation |

### Admin Auth
| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Admin login password (used with TOTP 2FA) |

### Stripe
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature secret (`whsec_...`) |

### PayPal
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID for checkout buttons |

### Email
| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key for transactional email (`re_...`) |

### Google Analytics
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID (`G-XXXXXXXXXX`) |
| `GOOGLE_SA_CREDENTIALS` | JSON service account credentials for GA4 Data API |

---

## Optional Variables

### Google Search Console
| Variable | Description |
|---|---|
| `GSC_SITE_URL` | Site URL in GSC (defaults to `https://erictomchik.com`) |

### Social Media Publishing
| Variable | Description |
|---|---|
| `FB_PAGE_ID` | Facebook Page ID for auto-posting |
| `FB_PAGE_ACCESS_TOKEN` | Facebook Page access token |

### Site
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Site base URL (defaults to `https://erictomchik.com`) |

---

## Setup Instructions

1. Copy `.env.local.example` → `.env.local`
2. Fill in all required variables
3. For admin setup: configure `ADMIN_PASSWORD` and `CONVEX_AUTH_SECRET`
4. For Stripe: create webhook endpoint at `https://yourdomain.com/api/webhook`
5. For GA4: create a service account with Analytics Data API access

---

## Related
- [[Tech Stack]]
- [[Cloudflare Deployment]]
- [[Stripe Integration]]
