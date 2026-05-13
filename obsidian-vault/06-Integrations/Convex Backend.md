# Convex Backend

> Real-time serverless database and backend functions.

---

## Overview
Convex provides the entire data layer for erictomchik.com — database, server functions, cron jobs, and real-time subscriptions.

## Connection
- URL: `NEXT_PUBLIC_CONVEX_URL`
- Deploy key: `CONVEX_DEPLOY_KEY`
- Client provider: `src/app/ConvexClientProvider.tsx`

## Usage Patterns

### Server Components (Public Pages)
```typescript
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../convex/_generated/api';

const books = await fetchQuery(api.books.list, { activeOnly: true });
```
- Direct server-side queries
- No real-time subscriptions needed
- Used with ISR (`revalidate = 60`)

### Client Components (Admin/Portal)
```typescript
import { useQuery } from 'convex/react';
const orders = useQuery(api.orders.list, {});
```
- Real-time subscriptions — data updates instantly
- Used in admin dashboard for live metrics

### Admin-Protected Queries
```typescript
import { useAdminQuery } from '@/hooks/useAdminAuth';
const data = useAdminQuery(api.orders.list, {});
```
- Wraps `useQuery` with admin key injection
- `assertAdmin()` validates the key server-side

### Mutations
```typescript
import { useMutation } from 'convex/react';
const create = useMutation(api.books.create);
await create({ adminKey, title, ... });
```

## Authentication Pattern
- Admin functions receive `adminKey` parameter
- `assertAdmin(adminKey)` in `convex/lib/auth.ts` validates against `CONVEX_AUTH_SECRET`
- Portal queries use `clientId` parameter scoped to authenticated client

## Cron Jobs
| Job | Schedule | Function |
|---|---|---|
| Rate limit cleanup | Every 1 hour | `internal.rateLimit.cleanup` |

## Schema
- 25+ tables defined in `convex/schema.ts`
- See [[Database Schema Overview]] for complete details

---

## Related
- [[Database Schema Overview]]
- [[Architecture Overview]]
- [[Tech Stack]]
