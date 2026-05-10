import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import ResourcesTabs from './_components/ResourcesTabs';
import CreditScoreContent from './_components/CreditScoreContent';
import AIGuideContent from './_components/AIGuideContent';
import CybersecurityContent from './_components/CybersecurityContent';
import POSGuideContent from './_components/POSGuideContent';
import { LeadMagnet } from '@/components/ui/LeadMagnet';

export const metadata: Metadata = {
  title: 'Book Resources — Eric Tomchik',
  description:
    'Live companion resources for books by Eric Tomchik. Updated directories, pricing tables, tool comparisons, and reference guides that keep each book accurate long after publication.',
  openGraph: {
    title: 'Book Resources — Eric Tomchik',
    description:
      'Live companion resources for books by Eric Tomchik — updated directories, pricing, and reference guides.',
    url: 'https://erictomchik.com/resources',
    type: 'website',
  },
  alternates: {
    canonical: 'https://erictomchik.com/resources',
  },
};

export default function ResourcesPage() {
  return (
    <div className="py-16">
      <div className="section-container space-y-12">
        {/* Hero */}
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <BookOpen className="w-4 h-4" />
            <span>Companion Resources</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="gradient-text">Book Resources</span>
          </h1>
          <p className="text-lg text-surface-300 leading-relaxed">
            Pricing changes. URLs break. Tools get replaced. These live companion pages
            keep the data in each book accurate and up-to-date — directories, comparison
            tables, legal references, and tool recommendations you can trust.
          </p>
        </div>

        {/* Tabbed Content */}
        <ResourcesTabs>
          <CreditScoreContent />
          <AIGuideContent />
          <CybersecurityContent />
          <POSGuideContent />
        </ResourcesTabs>

        {/* Free Downloads — Lead Magnets */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Free <span className="gradient-text">Downloads</span>
          </h2>
          <p className="text-surface-400 max-w-2xl">
            Grab these free reference guides — condensed checklists and cheat sheets from the full books.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <LeadMagnet
              title="Business Credit Starter Checklist"
              description="A step-by-step checklist to start building business credit with just an EIN — no personal guarantee required."
              downloadUrl="/downloads/business-credit-checklist.pdf"
              fileName="business-credit-checklist.pdf"
              previewItems={[
                'EIN setup & DUNS number registration',
                'First 5 net-30 vendor accounts to open',
                'Business credit monitoring services',
                'Timeline: 0–90 day action plan',
              ]}
            />
            <LeadMagnet
              title="Cybersecurity Quick-Reference Guide"
              description="Essential cybersecurity practices for small businesses — password policies, 2FA setup, and common attack prevention."
              downloadUrl="/downloads/cybersecurity-quick-reference.pdf"
              fileName="cybersecurity-quick-reference.pdf"
              previewItems={[
                'Password manager comparison chart',
                'Phishing red flags checklist',
                'Wi-Fi security audit steps',
                'Incident response template',
              ]}
            />
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center space-y-6 pt-4">
          <p className="text-surface-400 max-w-xl mx-auto">
            These companion pages are free and updated regularly.
            For the full step-by-step process, pick up the books.
          </p>
          <Link href="/books" className="btn-primary">
            <BookOpen className="w-4 h-4 mr-2" />
            Browse All Books
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </section>
      </div>
    </div>
  );
}
