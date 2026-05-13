# Portfolio Page

> Route: `/portfolio` — File: `src/app/portfolio/page.tsx`

---

## Purpose
Showcase of completed web development projects. Features 10+ live sites primarily for restaurants/bars on the Mississippi Gulf Coast plus a travel site.

## Metadata
| Field | Value |
|---|---|
| **Title** | Portfolio — Eric Tomchik |
| **Description** | View my portfolio of web development projects. |
| **Canonical** | `https://erictomchik.com/portfolio` |

## Featured Projects

### Live Client Sites (Gulf Coast Restaurants/Bars)
| Project | Subdomain | Viktor Space Origin |
|---|---|---|
| Boonies BSL | `boonies.erictomchik.com` | `boonies-bsl-b04f03d9.viktor.space` |
| Rickey's on Coleman | `rickeys.erictomchik.com` | `rickeys-on-coleman-980a4959.viktor.space` |
| Wicked Pig BSL | `wickedpig.erictomchik.com` | `wicked-pig-bsl-d1b371ec.viktor.space` |
| Hen House BSL | `henhouse.erictomchik.com` | `hen-house-bsl-c6861667.viktor.space` |
| Ugly Pirate | `uglypirate.erictomchik.com` | `ugly-pirate-13a0ae30.viktor.space` |
| Butcher Block | `butcherblock.erictomchik.com` | `preview-butcher-block-site-2206c411.viktor.space` |
| Dan B's BSL | `danbs.erictomchik.com` | `preview-dan-bs-bsl-79b3a67f.viktor.space` |
| Cosmos BSL | `cosmos.erictomchik.com` | `preview-cosmos-bsl-7af4fc1f.viktor.space` |
| Lemoine's | `lemoines.erictomchik.com` | `preview-lemoines-landing-d7a7aff8.viktor.space` |

### Other Projects
| Project | URL |
|---|---|
| Sparkles Travel Group | `sparkles.erictomchik.com` → `sparklestravelgroup.github.io/webcommunity/` |

### Concept Projects
- Additional concept/demo projects in the portfolio showcase

## Subdomain Proxy
All portfolio sites use subdomain proxy via middleware:
- Request to `{subdomain}.erictomchik.com` → rewritten to Viktor Space origin
- URL masking — visitors see the erictomchik.com subdomain
- See [[Subdomain Proxy System]] for full technical details

## Admin Management
- Portfolio projects managed at `/admin/portfolio`
- Can toggle visibility, update descriptions, reorder

---

## Related
- [[Subdomain Proxy System]]
- [[Services Page]]
- [[Portfolio Sites List]]
