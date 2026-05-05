import { Metadata } from 'next';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { Code2, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type { ServicePlan } from '@/types';

export const metadata: Metadata = {
  title: 'Web Development Services',
  description: 'Professional web development services by Eric Tomchik. Custom websites, e-commerce, and web applications.',
};

const servicePlans: ServicePlan[] = [
  {
    id: '1',
    name: 'Starter Site',
    slug: 'starter',
    description: 'Perfect for personal brands and small businesses that need a professional online presence.',
    features: [
      'Up to 5 pages',
      'Mobile responsive design',
      'Contact form',
      'SEO optimization',
      'Social media integration',
      '1 round of revisions',
      '30-day post-launch support',
    ],
    price_cents: 150000,
    price_type: 'starting_at',
    is_popular: false,
    is_active: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Business Pro',
    slug: 'business-pro',
    description: 'For growing businesses that need a feature-rich website with advanced functionality.',
    features: [
      'Up to 15 pages',
      'Custom design & branding',
      'CMS / Blog integration',
      'E-commerce (up to 50 products)',
      'Analytics & tracking setup',
      'Email integration',
      '3 rounds of revisions',
      '60-day post-launch support',
    ],
    price_cents: 350000,
    price_type: 'starting_at',
    is_popular: true,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Custom Application',
    slug: 'custom-app',
    description: 'Full-stack web applications built to your exact specifications with ongoing support.',
    features: [
      'Unlimited pages',
      'Custom full-stack development',
      'Database design & integration',
      'User authentication & roles',
      'Third-party API integrations',
      'Payment processing',
      'Unlimited revisions during build',
      '90-day post-launch support',
      'Hosting setup & deployment',
    ],
    price_cents: 750000,
    price_type: 'starting_at',
    is_popular: false,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
];

export default function ServicesPage() {
  return (
    <div className="py-16">
      <div className="section-container">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400">
            <Code2 className="w-4 h-4" />
            Web Development
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            Professional <span className="gradient-text">Web Services</span>
          </h1>
          <p className="text-surface-400 max-w-2xl mx-auto">
            From simple landing pages to complex web applications — I build modern,
            fast, and beautiful websites tailored to your needs.
          </p>
        </div>

        {/* Service plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {servicePlans.map((plan) => (
            <ServiceCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Why work with me */}
        <div className="glass rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Why Work With Me
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Modern tech stack (React, Next.js, Node.js)',
              'Mobile-first responsive design',
              'SEO optimized from the ground up',
              'Fast load times & performance focused',
              'Clean, maintainable code you own',
              'Transparent pricing, no hidden fees',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
                <span className="text-surface-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-surface-400">
            Not sure which plan is right for you? Let&apos;s talk about your project.
          </p>
          <Link href="/contact" className="btn-primary inline-flex">
            Request a Free Quote
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
