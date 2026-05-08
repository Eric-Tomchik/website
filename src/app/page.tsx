import Link from 'next/link';
import Image from 'next/image';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../convex/_generated/api';
import { BookCard } from '@/components/ui/BookCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ArrowRight, BookOpen, Code2, Sparkles, Link2, Globe, Coffee, ClipboardCheck } from 'lucide-react';

// Revalidate every 60s — pages are cached and served instantly from edge
export const revalidate = 60;

export default async function HomePage() {
  const books = await fetchQuery(api.books.list, { activeOnly: true });
  const featuredBooks = books?.filter((b) => b.is_featured).slice(0, 4) || [];
  const displayBooks = featuredBooks.length > 0 ? featuredBooks : (books || []).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl animate-hero-glow" />

        <div className="section-container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                Author · Web Developer · Creator
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
                Hi, I&apos;m{' '}
                <span className="gradient-text">Eric Tomchik</span>
              </h1>

              <p className="text-lg sm:text-xl text-surface-300 leading-relaxed max-w-xl animate-slide-up">
                I write the guides business owners actually need — from
                cybersecurity to business credit to AI — and I build the
                websites that grow their companies.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/books" className="btn-primary text-lg py-4 px-8">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse My Books
                </Link>
                <Link href="/services" className="btn-secondary text-lg py-4 px-8">
                  <Code2 className="w-5 h-5 mr-2" />
                  Hire Me
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 to-brand-700/20 rounded-2xl blur-2xl transition-all duration-700 group-hover:from-brand-500/30 group-hover:to-brand-700/30" />
                <div className="relative w-80 h-96 rounded-2xl overflow-hidden border-2 border-surface-800 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                  <Image
                    src="/images/eric-profile.png"
                    alt="Eric Tomchik — Author and Web Developer"
                    fill
                    sizes="320px"
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility bar */}
      <ScrollReveal animation="fade" duration={800}>
      <section className="border-t border-b border-surface-800/50 bg-surface-900/30">
        <div className="section-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: BookOpen,
                stat: `${(books || []).length || '4'}+`,
                label: 'Books Published',
              },
              {
                icon: Globe,
                stat: '9',
                label: 'Websites Built',
              },
              {
                icon: Code2,
                stat: '100%',
                label: 'Custom Code',
              },
              {
                icon: Coffee,
                stat: '∞',
                label: 'Cups of Coffee',
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 rounded-lg bg-brand-600/10 border border-brand-600/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{item.stat}</div>
                  <div className="text-xs text-surface-400">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Featured books */}
      {displayBooks.length > 0 && (
        <ScrollReveal animation="fade-up">
        <section className="py-20">
          <div className="section-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-brand-400 mb-3">
                  <BookOpen className="w-3.5 h-3.5" />
                  ArcLight Press
                </div>
                <h2 className="text-3xl font-bold text-white">
                  Latest from <span className="gradient-text">ArcLight Press</span>
                </h2>
              </div>
              <Link
                href="/books"
                className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {displayBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          </div>
        </section>
        </ScrollReveal>
      )}

      {/* Quick links */}
      <ScrollReveal animation="fade-up" delay={100}>
      <section className="py-20 border-t border-surface-800/50">
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'ArcLight Press',
                description: 'Premium hardcover business & tech books by Eric Tomchik.',
                href: '/books',
              },
              {
                icon: Code2,
                title: 'Web Services',
                description: 'Custom websites and apps built with modern tech.',
                href: '/services',
              },
              {
                icon: ClipboardCheck,
                title: 'Credit Checklist',
                description: 'Free tool: Is your business ready to build credit?',
                href: '/credit-checklist',
              },
              {
                icon: Link2,
                title: 'Connect',
                description: 'Find me on social media and get in touch.',
                href: '/contact',
              },
            ].map((item) => (
              <Link key={item.title} href={item.href} className="card p-8 group">
                <div className="w-12 h-12 rounded-lg bg-brand-600/10 border border-brand-600/20
                                flex items-center justify-center mb-4
                                group-hover:bg-brand-600/20 transition-colors">
                  <item.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-surface-400">{item.description}</p>
                <span className="inline-flex items-center gap-1 text-brand-400 text-sm font-medium mt-4">
                  Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>
    </>
  );
}
