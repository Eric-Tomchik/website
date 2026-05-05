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
