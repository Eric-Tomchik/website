import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ServicePlan } from '@/types';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function ServiceCard({ plan }: { plan: ServicePlan }) {
  return (
    <div
      className={cn(
        'glass glass-hover rounded-xl flex flex-col p-6 relative transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-2xl hover:shadow-brand-600/10',
        plan.is_popular
          ? 'border-brand-500/50 shadow-lg shadow-brand-600/10'
          : 'hover:border-surface-500/40'
      )}
    >
      {plan.is_popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full
                        bg-brand-600 text-xs font-semibold text-white whitespace-nowrap z-10">
          Most Popular
        </div>
      )}

      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
        <p className="text-sm text-surface-400 leading-relaxed">{plan.description}</p>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-white">
            {formatPrice(plan.price_cents)}
          </span>
          {plan.price_type === 'starting_at' && (
            <span className="text-sm text-surface-400">starting</span>
          )}
        </div>
      </div>

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-surface-300">
            <CheckCircle2 className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
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
