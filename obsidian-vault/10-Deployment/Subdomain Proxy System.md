# Subdomain Proxy System

> Middleware-based reverse proxy for portfolio showcase sites.

---

## Overview
Portfolio client sites are hosted on Viktor Spaces but accessed via `{name}.erictomchik.com` subdomains. The middleware intercepts these requests and proxies them to the Viktor Space origins.

## Implementation
- File: `src/middleware.ts`
- Detects subdomain from `Host` header
- Looks up origin URL from mapping
- Rewrites request to origin, preserving path and query

## Subdomain Mapping

| Subdomain | Origin URL | Client |
|---|---|---|
| `boonies` | `boonies-bsl-b04f03d9.viktor.space` | Boonies BSL |
| `rickeys` | `rickeys-on-coleman-980a4959.viktor.space` | Rickey's on Coleman |
| `wickedpig` | `wicked-pig-bsl-d1b371ec.viktor.space` | Wicked Pig BSL |
| `henhouse` | `hen-house-bsl-c6861667.viktor.space` | Hen House BSL |
| `uglypirate` | `ugly-pirate-13a0ae30.viktor.space` | Ugly Pirate |
| `butcherblock` | `preview-butcher-block-site-2206c411.viktor.space` | Butcher Block |
| `danbs` | `preview-dan-bs-bsl-79b3a67f.viktor.space` | Dan B's BSL |
| `cosmos` | `preview-cosmos-bsl-7af4fc1f.viktor.space` | Cosmos BSL |
| `lemoines` | `preview-lemoines-landing-d7a7aff8.viktor.space` | Lemoine's |
| `sparkles` | `sparklestravelgroup.github.io/webcommunity/` | Sparkles Travel Group |

## How It Works
```
Request: boonies.erictomchik.com/menu
  → Middleware detects subdomain: "boonies"
  → Looks up origin: boonies-bsl-b04f03d9.viktor.space
  → Rewrites URL: https://boonies-bsl-b04f03d9.viktor.space/menu
  → Proxied response returned to browser
  → Browser URL stays: boonies.erictomchik.com/menu
```

## Benefits
- **URL masking** — clients see `{name}.erictomchik.com`, not Viktor Space URLs
- **Centralized** — all sites under one domain
- **SSL** — Cloudflare handles wildcard SSL
- **Portfolio showcase** — demonstrates Eric's work under his brand

## DNS Requirements
- Wildcard DNS record: `*.erictomchik.com → Cloudflare Pages`
- Cloudflare handles SSL for all subdomains

---

## Related
- [[Portfolio Page]]
- [[Cloudflare Deployment]]
- [[Portfolio Sites List]]
