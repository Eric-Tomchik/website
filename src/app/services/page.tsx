import { Metadata } from 'next';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Code2, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../convex/_generated/api';

export const metadata: Metadata = {
  title: 'Web Development Services',
  description: 'Professional web development services by Eric Tomchik. Custom websites, e-commerce, and web applications built with React, Next.js, and modern tech.',
  openGraph: {
    title: 'Web Development Services — Eric Tomchik',
    description: 'Custom websites, e-commerce, and web applications built with React, Next.js, and modern tech. Starting at $1,000.',
    url: 'https://erictomchik.com/services',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Eric Tomchik Web Development Services' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Development Services — Eric Tomchik',
    description: 'Custom websites, e-commerce, and web applications. Starting at $1,000.',
    images: ['/og-image.png'],
  },
};

export const revalidate = 3600; // ISR: revalidate every hour

export default async function ServicesPage() {
  const client = getConvexClient();
  const plans = await client.query(api.servicePlans.listActive, {});

  // Map Convex docs to ServicePlan type
  const servicePlans = plans.map((p) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    features: p.features,
    price_cents: p.price_cents,
    price_type: p.price_type,
    is_popular: p.is_popular,
    is_active: p.is_active,
    sort_order: p.sort_order,
    created_at: new Date(p._creationTime).toISOString(),
  }));

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
        <ScrollReveal animation="fade-up">
        <div className="grid md:grid-cols-3 gap-6 pt-4 mb-20 overflow-visible">
          {servicePlans.map((plan) => (
            <ServiceCard key={plan.id} plan={plan} />
          ))}
        </div>
        </ScrollReveal>

        {/* Why work with me */}
        <ScrollReveal animation="fade-up" delay={100}>
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

        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal animation="fade-up">
        <div className="text-center mt-16 space-y-4">
          <p className="text-surface-400">
            Not sure which plan is right for you? Let&apos;s talk about your project.
          </p>
          <Link href="/contact" className="btn-primary inline-flex">
            Request a Free Quote
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
