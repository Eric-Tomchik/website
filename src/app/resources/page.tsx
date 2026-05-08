import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  CreditCard,
  Cpu,
  Shield,
  Monitor,
} from 'lucide-react';

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
};

const bookResources = [
  {
    slug: 'credit-score',
    title: 'Credit Without a Credit Score',
    subtitle: 'Business Credit Building Guide',
    description:
      'Net-30 vendor directory, EIN-only credit cards, business credit score ranges, credit bureau contacts, and government resources.',
    icon: CreditCard,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    sections: [
      'Net-30 Vendor Directory',
      'EIN-Only Credit Cards',
      'Score Ranges & Bureaus',
      'Government Resources',
    ],
  },
  {
    slug: 'ai-guide',
    title: 'The Complete AI Platform Guide',
    subtitle: '2026 Edition',
    description:
      '153-platform directory with live URLs, pricing matrix, recommended stacks by budget, and category comparison charts.',
    icon: Cpu,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    sections: [
      '153 Platform URLs',
      'Pricing Matrix',
      'Recommended Stacks',
      'Category Comparisons',
    ],
  },
  {
    slug: 'cybersecurity',
    title: 'The Complete Cybersecurity Guide',
    subtitle: 'For Small Business',
    description:
      'Security tools directory with current pricing, budget planners at every tier, government resources, annual report links, and free training courses.',
    icon: Shield,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    sections: [
      'Security Tools Directory',
      'Budget Planners',
      'Government Resources',
      'Training & Reports',
    ],
  },
  {
    slug: 'pos-guide',
    title: 'The Complete POS Systems Guide',
    subtitle: '2026 Edition',
    description:
      'Side-by-side POS pricing comparison, feature matrix for 9 platforms, and a 50-state surcharge & cash discount legal reference.',
    icon: Monitor,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    sections: [
      'POS Pricing Comparison',
      'Feature Matrix',
      '50-State Legal Reference',
      'Platform Links',
    ],
  },
];

export default function ResourcesHubPage() {
  return (
    <div className="py-16">
      <div className="section-container space-y-16">
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

        {/* Book Resource Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {bookResources.map((book) => (
            <Link
              key={book.slug}
              href={`/resources/${book.slug}`}
              className="card p-6 sm:p-8 group relative overflow-hidden"
            >
              {/* Gradient accent line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${book.color} opacity-60 group-hover:opacity-100 transition-opacity`}
              />

              <div className="space-y-5">
                {/* Icon + Title */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${book.bgColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <book.icon className={`w-6 h-6 ${book.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors leading-tight">
                      {book.title}
                    </h2>
                    <p className="text-sm text-surface-400 mt-0.5">{book.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-surface-300 text-sm leading-relaxed">
                  {book.description}
                </p>

                {/* Section pills */}
                <div className="flex flex-wrap gap-2">
                  {book.sections.map((section) => (
                    <span
                      key={section}
                      className="text-xs px-2.5 py-1 rounded-full bg-surface-800/60 text-surface-300 border border-surface-700/50"
                    >
                      {section}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-sm text-brand-400 font-medium pt-1">
                  <span>View Resources</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

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
