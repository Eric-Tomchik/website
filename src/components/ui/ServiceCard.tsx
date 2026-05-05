'use client';

import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import type { ServicePlan } from '@/types';

interface ServiceCardProps {
  plan: ServicePlan;
}

export function ServiceCard({ plan }: ServiceCardProps) {
  const priceLabel = () => {
    const price = formatPrice(plan.price_cents);
    switch (plan.price_type) {
      case 'hourly':
        return `${price}/hr`;
      case 'monthly':
        return `${price}/mo`;
      case 'starting_at':
        return `From ${price}`;
      default:
        return price;
    }
  };

  return (
    <div
      className={cn(
        'card relative p-8 flex flex-col',
        plan.is_popular && 'border-brand-500/50 shadow-lg shadow-brand-600/10'
      )}
    >
      {plan.is_popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full
                        bg-brand-600 text-xs font-semibold text-white">
          Most Popular
        </div>
      )}

      <div className="space-y-4 mb-8">
        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
        <p className="text-sm text-surface-400">{plan.description}</p>
        <div className="text-3xl font-extrabold text-white">
          {priceLabel()}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-surface-300">
            <Check className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={`/contact?service=${plan.slug}`}
        className={cn(
          'w-full text-center',
          plan.is_popular ? 'btn-primary' : 'btn-secondary'
        )}
      >
        Get Started
        <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </div>
  );
}
