-- =============================================
-- Eric Tomchik Website — Database Schema
-- =============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── BOOKS ───
create table public.books (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text not null,
  long_description text,
  price_cents integer not null default 0,
  book_format text not null default 'both' check (book_format in ('physical', 'digital', 'both')),
  cover_image_url text,
  amazon_url text,
  digital_file_url text,
  page_count integer,
  isbn text,
  published_date date,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── PORTFOLIO PROJECTS ───
create table public.portfolio_projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text not null,
  long_description text,
  thumbnail_url text,
  images text[] default '{}',
  live_url text,
  github_url text,
  technologies text[] default '{}',
  category text not null default 'web',
  is_featured boolean default false,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── SERVICE PLANS ───
create table public.service_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text not null,
  features text[] default '{}',
  price_cents integer not null default 0,
  price_type text not null default 'fixed' check (price_type in ('fixed', 'starting_at', 'hourly', 'monthly')),
  is_popular boolean default false,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── ORDERS ───
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_email text not null,
  customer_name text not null,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  items jsonb not null default '[]',
  total_cents integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'refunded')),
  shipping_address jsonb,
  tracking_number text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── CONTACT MESSAGES ───
create table public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  service_interest text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ─── ROW-LEVEL SECURITY ───

-- Books: public read, admin write
alter table public.books enable row level security;
create policy "Books are viewable by everyone" on public.books
  for select using (is_active = true);

-- Portfolio: public read, admin write
alter table public.portfolio_projects enable row level security;
create policy "Portfolio projects are viewable by everyone" on public.portfolio_projects
  for select using (is_active = true);

-- Services: public read, admin write
alter table public.service_plans enable row level security;
create policy "Service plans are viewable by everyone" on public.service_plans
  for select using (is_active = true);

-- Orders: admin only
alter table public.orders enable row level security;

-- Contact messages: insert for everyone, read for admin
alter table public.contact_messages enable row level security;
create policy "Anyone can submit a contact message" on public.contact_messages
  for insert with check (true);

-- ─── STORAGE BUCKETS ───
-- Run these in Supabase dashboard or via API:
-- 1. Create bucket "book-covers" (public)
-- 2. Create bucket "portfolio-images" (public)
-- 3. Create bucket "digital-books" (private — authenticated download only)

-- ─── INDEXES ───
create index idx_books_slug on public.books(slug);
create index idx_books_featured on public.books(is_featured) where is_active = true;
create index idx_portfolio_slug on public.portfolio_projects(slug);
create index idx_portfolio_featured on public.portfolio_projects(is_featured) where is_active = true;
create index idx_orders_email on public.orders(customer_email);
create index idx_orders_status on public.orders(status);
create index idx_orders_created on public.orders(created_at desc);

-- ─── UPDATED_AT TRIGGER ───
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger books_updated_at before update on public.books
  for each row execute function update_updated_at();

create trigger portfolio_updated_at before update on public.portfolio_projects
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on public.orders
  for each row execute function update_updated_at();
