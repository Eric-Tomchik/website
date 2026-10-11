import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import PhishingAwarenessContent, {
  PHISHING_LAST_UPDATED,
} from '../_components/PhishingAwarenessContent';

export const metadata: Metadata = {
  title: 'Phishing Awareness: How to Spot AI-Powered Scams — Eric Tomchik',
  description:
    'Learn to spot phishing emails, scam texts, AI voice-clone calls, and malicious QR codes. Annotated examples, a 5-second safety check, what to do if you clicked, and where to report phishing.',
  openGraph: {
    title: 'Phishing Awareness: How to Spot AI-Powered Scams',
    description:
      'Annotated phishing examples, a 5-second safety check, and what to do if you clicked a scam link.',
    url: 'https://erictomchik.com/resources/phishing-awareness',
    type: 'article',
    images: [
      {
        url: 'https://erictomchik.com/images/resources/phishing-email-red-flags.webp',
        width: 1400,
        height: 830,
        alt: 'Anatomy of a phishing email: 6 red flags',
      },
    ],
  },
  alternates: {
    canonical: 'https://erictomchik.com/resources/phishing-awareness',
  },
};

export default function PhishingAwarenessPage() {
  return (
    <div className="py-16">
      <div className="section-container space-y-16">
        {/* Hero */}
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <BookOpen className="w-4 h-4" />
            <Link href="/resources" className="hover:text-brand-400 transition-colors">
              Book Resources
            </Link>
            <span>/</span>
            <span>Phishing Awareness</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="gradient-text">Phishing Awareness</span>
            <br />
            <span className="text-white text-2xl sm:text-3xl mt-2 block">
              How to Spot (and Stop) AI-Powered Scams
            </span>
          </h1>
          <p className="text-lg text-surface-300 leading-relaxed">
            One click is often all it takes. Share this page with parents, grandparents, kids,
            and coworkers. It could save someone&apos;s savings, identity, or business.
          </p>
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Last updated: {PHISHING_LAST_UPDATED}</span>
          </div>
        </div>

        <PhishingAwarenessContent showTitle={false} />

        {/* CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-extrabold text-white">Protect your business, too</h2>
          <p className="text-surface-300 max-w-xl mx-auto">
            Phishing is the #1 way attackers break into small businesses. The Cybersecurity Guide
            companion covers training, tools, and budgets to stop it, step by step.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/resources/cybersecurity" className="btn-primary">
              <ShieldAlert className="w-4 h-4 mr-2" />
              Cybersecurity Guide Resources
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/resources" className="btn-secondary">
              ← All Book Resources
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
