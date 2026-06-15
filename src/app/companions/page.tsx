import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight, Monitor, Terminal, Shield, CreditCard, Brain, ShoppingCart, Target } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Online Companions — Interactive Book Labs',
  description:
    'Virtual labs and interactive companions for books by Eric Tomchik. Practice Linux commands, run cybersecurity audits, build business credit step-by-step, and more — right in your browser.',
  openGraph: {
    title: 'Online Companions — Interactive Book Labs | Eric Tomchik',
    description:
      'Virtual labs and interactive tools that bring each book to life. Practice in your browser.',
    url: 'https://erictomchik.com/companions',
    type: 'website',
  },
  alternates: {
    canonical: 'https://erictomchik.com/companions',
  },
};

interface CompanionCard {
  title: string;
  bookTitle: string;
  description: string;
  icon: typeof Terminal;
  features: string[];
  status: 'live' | 'coming-soon';
  href?: string;
}

const companions: CompanionCard[] = [
  {
    title: 'Linux Virtual Terminal',
    bookTitle: 'Linux Essentials Certification Study Guide',
    description:
      'Practice real Linux commands in a browser-based terminal. Follow along with each chapter, run exercises, and build confidence before your certification exam.',
    icon: Terminal,
    features: [
      'Browser-based Linux terminal',
      'Chapter-by-chapter exercises',
      'Command reference & cheat sheets',
      'Practice exam simulations',
    ],
    status: 'live',
    href: '/companions/linux-essentials',
  },
  {
    title: 'ASVAB Exam Simulator',
    bookTitle: 'The Ultimate ASVAB Study Guide 2026-2027',
    description:
      '430+ practice questions, full timed exam simulator, CAT-ASVAB adaptive testing, flashcards, searchable cheat sheets, and score tracking with branch eligibility.',
    icon: Target,
    features: [
      '430+ questions across all 10 subtests',
      'Full CAT-ASVAB adaptive simulator',
      'Timed exam mode with per-subtest timers',
      'Flashcards, cheat sheets & score dashboard',
    ],
    status: 'live',
    href: '/companions/asvab',
  },
  {
    title: 'Cybersecurity Lab',
    bookTitle: 'The Complete Cybersecurity Guide for Small Business',
    description:
      'Interactive security audit tools, phishing detection exercises, and step-by-step guides for securing your business infrastructure.',
    icon: Shield,
    features: [
      'Security audit checklist tool',
      'Phishing detection practice',
      'Password strength analyzer',
      'Incident response simulator',
    ],
    status: 'coming-soon',
  },
  {
    title: 'Business Credit Builder',
    bookTitle: 'Credit Without a Credit Score',
    description:
      'Track your progress through the EIN-only credit building process. Interactive checklists, vendor trackers, and milestone monitoring.',
    icon: CreditCard,
    features: [
      'Step-by-step progress tracker',
      'Vendor account directory',
      'Credit milestone checklist',
      'Timeline planning tool',
    ],
    status: 'coming-soon',
  },
  {
    title: 'AI Platform Explorer',
    bookTitle: 'The Complete AI Platform Guide 2026',
    description:
      'Live, updated comparisons of AI platforms with interactive decision tools to help you choose the right solution for your business.',
    icon: Brain,
    features: [
      'Platform comparison tool',
      'Use-case matcher',
      'Live pricing updates',
      'Integration guides',
    ],
    status: 'coming-soon',
  },
  {
    title: 'POS System Selector',
    bookTitle: 'The Complete POS Systems Guide',
    description:
      'Interactive tool to compare POS systems side-by-side, calculate total cost of ownership, and find the best fit for your business type.',
    icon: ShoppingCart,
    features: [
      'Side-by-side comparisons',
      'Cost calculator',
      'Feature match quiz',
      'Industry-specific recommendations',
    ],
    status: 'coming-soon',
  },
];

export default function CompanionsPage() {
  const liveCompanions = companions.filter((c) => c.status === 'live');
  const comingSoon = companions.filter((c) => c.status === 'coming-soon');

  return (
    <div className="py-16">
      <div className="section-container space-y-16">
        {/* Hero */}
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <Monitor className="w-4 h-4" />
            <span>Online Companions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="gradient-text">Online Companions</span>
          </h1>
          <p className="text-lg text-surface-300 leading-relaxed">
            Each book comes with an interactive web companion — virtual terminals,
            labs, tools, and trackers that let you practice what you read. Learn by
            doing, right in your browser.
          </p>
        </div>

        {/* Live companions */}
        {liveCompanions.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-white">
              <span className="gradient-text">Available Now</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {liveCompanions.map((companion) => (
                <CompanionCardComponent key={companion.title} companion={companion} />
              ))}
            </div>
          </section>
        )}

        {/* Coming soon */}
        {comingSoon.length > 0 && (
          <ScrollReveal animation="fade-up">
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-white">
              {liveCompanions.length > 0 ? 'Coming Soon' : <span className="gradient-text">Coming Soon</span>}
            </h2>
            <p className="text-surface-400 max-w-2xl">
              These interactive companions are currently in development. Subscribe to the
              newsletter to get notified when they launch.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {comingSoon.map((companion) => (
                <CompanionCardComponent key={companion.title} companion={companion} />
              ))}
            </div>
          </section>
          </ScrollReveal>
        )}

        {/* Bottom CTA */}
        <section className="text-center space-y-6 pt-4">
          <p className="text-surface-400 max-w-xl mx-auto">
            Online companions are free for book owners. Pick up a book to unlock
            its interactive lab.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/books" className="btn-primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse All Books
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/resources" className="btn-secondary">
              Free Resources
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function CompanionCardComponent({ companion }: { companion: CompanionCard }) {
  const isLive = companion.status === 'live';

  const cardContent = (
    <div className={`card p-6 sm:p-8 group flex flex-col h-full ${isLive ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-brand-600/10 border border-brand-600/20
                        flex items-center justify-center flex-shrink-0
                        group-hover:bg-brand-600/20 transition-colors">
          <companion.icon className="w-6 h-6 text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors truncate">
              {companion.title}
            </h3>
            {isLive ? (
              <span className="px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 text-xs font-semibold flex-shrink-0">
                Live
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-surface-700/50 text-surface-400 text-xs font-semibold flex-shrink-0">
                Coming Soon
              </span>
            )}
          </div>
          <p className="text-xs text-brand-400/80 font-medium">
            Companion for: {companion.bookTitle}
          </p>
        </div>
      </div>

      <p className="text-sm text-surface-400 mb-4 flex-1">
        {companion.description}
      </p>

      <ul className="space-y-2 mb-4">
        {companion.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-surface-300">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {isLive && (
        <span className="inline-flex items-center gap-1 text-brand-400 text-sm font-medium mt-auto">
          Launch Lab <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      )}
    </div>
  );

  if (isLive && companion.href) {
    return (
      <a href={companion.href} target="_blank" rel="noopener noreferrer">
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
