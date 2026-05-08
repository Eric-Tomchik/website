import { Metadata } from 'next';
import { CreditChecklist } from './_components/CreditChecklist';
import { ClipboardCheck } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Free Business Credit Checklist — Is Your Business Credit-Ready?',
  description:
    'Take the free interactive checklist to see how ready your business is to build credit with just an EIN. Get personalized tips and a downloadable action plan.',
  openGraph: {
    title: 'Free Business Credit Checklist',
    description: 'Find out if your business is ready to build credit — in under 2 minutes.',
    url: 'https://erictomchik.com/credit-checklist',
  },
};

export default function CreditChecklistPage() {
  return (
    <div className="py-16">
      <div className="section-container max-w-3xl">
        {/* Header */}
        <ScrollReveal animation="fade-up">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-emerald-400">
            <ClipboardCheck className="w-4 h-4" />
            Free Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Is Your Business{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-brand-400 bg-clip-text text-transparent">
              Credit-Ready?
            </span>
          </h1>
          <p className="text-surface-400 max-w-xl mx-auto text-lg">
            Answer these questions to discover how prepared your business is to
            build credit with just an EIN — no personal credit needed.
          </p>
        </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={150}>
          <CreditChecklist />
        </ScrollReveal>
      </div>
    </div>
  );
}
