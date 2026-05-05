// ─── Book Types ───
export interface Book {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  price_cents: number;
  format: 'physical' | 'digital' | 'both';
  cover_image_url: string;
  amazon_url?: string;
  digital_file_url?: string;
  page_count?: number;
  isbn?: string;
  published_date?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Portfolio Types ───
export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  thumbnail_url: string;
  images: string[];
  live_url?: string;
  github_url?: string;
  technologies: string[];
  category: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Service Types ───
export interface ServicePlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  price_cents: number;
  price_type: 'fixed' | 'starting_at' | 'hourly' | 'monthly';
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// ─── Order Types ───
export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  stripe_session_id: string;
  stripe_payment_intent_id?: string;
  items: OrderItem[];
  total_cents: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded';
  shipping_address?: ShippingAddress;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  book_id: string;
  book_title: string;
  format: 'physical' | 'digital';
  quantity: number;
  price_cents: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// ─── Contact Types ───
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  service_interest?: string;
  is_read: boolean;
  created_at: string;
}

// ─── Social Links ───
export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  label: string;
}
