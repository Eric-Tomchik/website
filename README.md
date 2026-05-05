# erictomchik.com

Personal website, book store, and web development portfolio for Eric Tomchik.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (dark theme, blue/gray palette)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe Checkout
- **Hosting**: Vercel (recommended)
- **Language**: TypeScript

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, what I do, CTA |
| `/books` | Book store — browse, filter by format |
| `/books/success` | Order confirmation page |
| `/services` | Web development service plans & pricing |
| `/portfolio` | Web project portfolio gallery |
| `/about` | About page with bio, skills, stats |
| `/links` | Social media link aggregator (like Linktree) |
| `/contact` | Contact form with service interest selector |
| `/admin` | Dashboard — stats, recent orders |
| `/admin/books` | Manage books (CRUD) |
| `/admin/portfolio` | Manage portfolio projects |
| `/admin/orders` | View and manage orders |
| `/admin/login` | Admin authentication |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/webhook` | POST | Stripe webhook handler |
| `/api/contact` | POST | Submit contact form |

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd erictomchik-site
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/migrations/001_initial_schema.sql`
3. Create storage buckets:
   - `book-covers` (public)
   - `portfolio-images` (public)
   - `digital-books` (private)
4. In Authentication → Settings, create your admin user

### 3. Set Up Stripe

1. Create products/prices in your Stripe dashboard (or they'll be created dynamically via checkout)
2. Set up a webhook endpoint pointing to `https://erictomchik.com/api/webhook`
3. Subscribe to events: `checkout.session.completed`, `charge.refunded`

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add all env vars from `.env.local`
4. Deploy!

### Connect Domain

1. In Vercel → Settings → Domains, add `erictomchik.com`
2. In GoDaddy DNS:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`
3. SSL is automatic — no certificate purchase needed

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (checkout, webhook, contact)
│   ├── admin/         # Admin dashboard (protected)
│   ├── books/         # Book store pages
│   ├── services/      # Service plans page
│   ├── portfolio/     # Portfolio gallery
│   ├── links/         # Social media links
│   ├── about/         # About page
│   ├── contact/       # Contact form
│   ├── layout.tsx     # Root layout (navbar + footer)
│   ├── page.tsx       # Home page
│   └── globals.css    # Global styles + Tailwind
├── components/
│   ├── layout/        # Navbar, Footer
│   └── ui/            # BookCard, PortfolioCard, ServiceCard
├── lib/
│   ├── supabase/      # Supabase client (browser + server)
│   ├── stripe.ts      # Stripe server instance
│   └── utils.ts       # Utility functions
├── types/
│   └── index.ts       # TypeScript interfaces
└── ...
supabase/
└── migrations/        # Database schema SQL
```

## Customization

- **Colors**: Edit `tailwind.config.ts` → `brand` and `surface` palettes
- **Content**: Update placeholder text in page files
- **Social links**: Edit URLs in `Footer.tsx` and `links/page.tsx`
- **Service plans**: Edit the `servicePlans` array in `services/page.tsx` (or manage via Supabase)
- **Profile photo**: Replace `public/images/eric-profile.png`

## License

Private — all rights reserved.
