# Getting Started

> How to set up the development environment and run the site locally.

---

## Prerequisites
| Tool | Version | Purpose |
|---|---|---|
| Bun | Latest | Package manager & runtime |
| Node.js | 18+ | Required by some dependencies |
| Wrangler | Latest | Cloudflare Workers CLI |
| Convex CLI | Latest | Database management |

## Setup Steps

### 1. Clone Repository
```bash
git clone https://github.com/Eric-Tomchik/website.git
cd website
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Environment Variables
```bash
cp .env.local.example .env.local
# Fill in all required variables (see [[Environment Variables]])
```

### 4. Convex Setup
```bash
npx convex dev    # Start Convex dev server
npx convex push   # Push schema to Convex
```

### 5. Start Development Server
```bash
bun dev    # Starts Next.js with Turbopack on localhost:3000
```

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `bun dev` | `next dev --turbopack` | Development server with Turbopack |
| `bun run build` | `next build` | Production build |
| `bun start` | `next start` | Start production server |
| `bun run lint` | `next lint` | ESLint check |
| `bun test` | `vitest` | Run tests |
| `bun run preview` | `opennextjs-cloudflare build && wrangler dev` | Preview on CF Workers |
| `bun run deploy` | `opennextjs-cloudflare build && wrangler deploy` | Deploy to production |
| `bun run cf-typegen` | `wrangler types` | Generate CF Worker types |

## Development Workflow
1. `bun dev` for local development
2. Make changes → hot reload via Turbopack
3. `bun run lint` to check for issues
4. `bun test` to run test suite
5. Commit & push
6. `bun run deploy` for production deployment

## Key Files to Know
| File | Purpose |
|---|---|
| `src/app/layout.tsx` | Root layout (fonts, providers, analytics) |
| `src/middleware.ts` | Request pipeline (subdomain proxy, CSP, auth) |
| `convex/schema.ts` | Database schema |
| `tailwind.config.ts` | Design system configuration |
| `next.config.js` | Next.js settings |
| `.env.local` | Environment variables (not committed) |

---

## Related
- [[Tech Stack]]
- [[Environment Variables]]
- [[Project Structure]]
- [[Cloudflare Deployment]]
