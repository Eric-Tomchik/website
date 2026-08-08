import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Info } from 'lucide-react';
import { RecommendedReadsGrid } from '@/components/ui/RecommendedReadsGrid';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { RECOMMENDED_READS, CATEGORY_LABELS } from '@/lib/recommendedReads';
import { amazonBookLink } from '@/lib/utils';

const TITLE = 'Recommended Reads — Business, IT & AI Books';
const DESCRIPTION =
  "Eric Tomchik's hand-picked reading list: bestselling business, computer/IT certification, and AI books worth your money — with a short note on why each one earns a spot.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://erictomchik.com/books/recommended',
    images: [{ url: '/og-image.webp', width: 1200, height: 630, alt: 'Recommended Reads' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.webp'],
  },
  alternates: { canonical: 'https://erictomchik.com/books/recommended' },
};

export default function RecommendedReadsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Recommended Reads — Business, IT & AI',
    description: DESCRIPTION,
    url: 'https://erictomchik.com/books/recommended',
    numberOfItems: RECOMMENDED_READS.length,
    itemListElement: RECOMMENDED_READS.map((read, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Book',
        name: read.title,
        author: { '@type': 'Person', name: read.author },
        genre: CATEGORY_LABELS[read.category],
        url: amazonBookLink(read.title, read.author, read.asin),
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="py-16">
        <div className="section-container">
          {/* Header */}
          <div className="text-center space-y-5 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/60 text-surface-300 text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              {RECOMMENDED_READS.length} books · updated regularly
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold">
              <span className="gradient-text">Recommended Reads</span>
            </h1>
            <p className="text-surface-400 max-w-2xl mx-auto">
              The business, IT, and AI books I actually recommend — the ones that changed how I run a
              business, study for certifications, or think about where this is all going. Each pick
              includes a one-line reason it made the list.
            </p>
            <p className="text-sm text-surface-500">
              Looking for my own titles instead?{' '}
              <Link href="/books" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">
                Browse ArcLight Press books
              </Link>
              .
            </p>
          </div>

          {/* Affiliate disclosure — FTC + Amazon Associates requirement */}
          <div className="max-w-3xl mx-auto mb-10 flex gap-3 items-start rounded-xl border border-surface-800 bg-surface-900/60 p-4">
            <Info className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
            <p className="text-xs sm:text-sm text-surface-400">
              <strong className="text-surface-300">Affiliate disclosure:</strong> As an Amazon
              Associate, I earn from qualifying purchases. Links on this page are affiliate links, so
              I may receive a small commission at no extra cost to you. Prices and availability are
              shown on Amazon and can change at any time.
            </p>
          </div>

          <ScrollReveal animation="fade-up">
            <RecommendedReadsGrid />
          </ScrollReveal>

          {/* Footer CTA */}
          <div className="mt-16 card p-6 sm:p-8 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Have one I should add?</h2>
            <p className="text-surface-400 mb-5">
              If a book earned a permanent spot on your shelf, send it over — I read the
              recommendations and update this list.
            </p>
            <Link href="/contact" className="btn-primary inline-flex">
              Send a recommendation
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
