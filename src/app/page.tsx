import Link from 'next/link';
import Image from 'next/image';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../convex/_generated/api';
import { BookCard } from '@/components/ui/BookCard';
import { ArrowRight, BookOpen, Code2, Sparkles, Link2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const books = await fetchQuery(api.books.list, { activeOnly: true });
  const featuredBooks = books?.filter((b) => b.is_featured).slice(0, 4) || [];
  const displayBooks = featuredBooks.length > 0 ? featuredBooks : (books || []).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />

        <div className="section-container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400">
                <Sparkles className="w-4 h-4" />
                Author · Web Developer · Creator
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
                Hi, I&apos;m{' '}
                <span className="gradient-text">Eric Tomchik</span>
              </h1>

              <p className="text-lg sm:text-xl text-surface-300 leading-relaxed max-w-xl">
                I write books that help businesses leverage technology, and I build
                modern websites that turn visitors into customers.
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
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 to-brand-700/20 rounded-2xl blur-2xl" />
                <div className="relative w-80 h-96 rounded-2xl overflow-hidden border-2 border-surface-800 shadow-2xl">
                  <Image
                    src="/images/eric-profile.png"
                    alt="Eric Tomchik"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured books */}
      {displayBooks.length > 0 && (
        <section className="py-20 border-t border-surface-800/50">
          <div className="section-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-brand-400 mb-3">
                  <BookOpen className="w-3.5 h-3.5" />
                  Bookshop
                </div>
                <h2 className="text-3xl font-bold text-white">
                  Latest <span className="gradient-text">Books</span>
                </h2>
              </div>
              <Link
                href="/books"
                className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick links */}
      <section className="py-20 border-t border-surface-800/50">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'My Books',
                description: 'Business & tech books in digital and signed physical copies.',
                href: '/books',
              },
              {
                icon: Code2,
                title: 'Web Services',
                description: 'Custom websites and apps built with modern tech.',
                href: '/services',
              },
              {
                icon: Link2,
                title: 'Connect',
                description: 'Find me on social media and get in touch.',
                href: '/links',
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
    </>
  );
}
