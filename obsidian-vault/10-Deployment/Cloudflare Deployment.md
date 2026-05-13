# Cloudflare Deployment

> Hosting and deployment infrastructure on Cloudflare Pages + Workers.

---

## Stack
| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages |
| Runtime | Cloudflare Workers (edge) |
| Adapter | OpenNext (`@opennextjs/cloudflare`) |
| Build Tool | Bun |
| DNS | Cloudflare DNS |

## OpenNext Configuration (`open-next.config.ts`)

```typescript
export default {
  default: {},
  middleware: {
    external: true,
  },
};
```

- Converts Next.js output to Cloudflare Workers-compatible format
- External middleware for subdomain proxy and CSP

## Wrangler Configuration (`wrangler.jsonc`)

```json
{
  "main": ".open-next/worker.js",
  "name": "erictomchik-website",
  "compatibility_date": "2024-12-30",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

### Key Settings
- **nodejs_compat** — enables Node.js APIs in Workers
- **Assets binding** — serves static files from Cloudflare CDN
- **KV namespaces** — for ISR cache (if configured)

## Build & Deploy Scripts (`package.json`)

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev --turbopack` | Local development (Turbopack) |
| `build` | `next build` | Standard Next.js build |
| `preview` | `opennextjs-cloudflare build && wrangler dev` | Preview on Workers |
| `deploy` | `opennextjs-cloudflare build && wrangler deploy` | Production deploy |
| `cf-typegen` | `wrangler types` | Generate CF Worker types |

## Deploy Flow
```
Code push → bun run deploy
  → opennextjs-cloudflare build (converts Next.js → Workers)
  → wrangler deploy (pushes to Cloudflare)
  → Live at erictomchik.com
```

## DNS
- `erictomchik.com` → Cloudflare Pages
- `*.erictomchik.com` → Same, with middleware routing to Viktor Spaces for portfolio subdomains

---

## Related
- [[Subdomain Proxy System]]
- [[Security — CSP & Auth]]
- [[Getting Started]]
