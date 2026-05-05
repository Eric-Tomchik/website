import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Code2, Globe, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/50 via-surface-950 to-surface-950" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-800/10 rounded-full blur-3xl" />

        <div className="relative section-container py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400">
                <Sparkles className="w-4 h-4" />
                Author · Web Developer · Creator
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                Hi, I&apos;m{' '}
                <span className="gradient-text">Eric Tomchik</span>
              </h1>

              <p className="text-lg text-surface-300 leading-relaxed max-w-xl">
                I write books that captivate and build websites that convert.
                Whether you&apos;re here to grab a copy of my latest work or need a
                professional web presence — you&apos;re in the right place.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/books" className="btn-primary">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse My Books
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link href="/services" className="btn-secondary">
                  <Code2 className="w-5 h-5 mr-2" />
                  Web Dev Services
                </Link>
              </div>
            </div>

            {/* Profile image */}
            <div className="flex justify-center lg:justify-end animate-slide-up">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl blur-lg opacity-40" />
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden border-2 border-surface-800">
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

      {/* ─── WHAT I DO ─── */}
      <section className="py-24 border-t border-surface-800/50">
        <div className="section-container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              What I <span className="gradient-text">Do</span>
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              From the written word to the digital world — here&apos;s how I can help you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Published Author',
                description:
                  'Explore my collection of books available in both digital and physical formats. Ship directly from the author or download instantly.',
                href: '/books',
                cta: 'Shop Books',
              },
              {
                icon: Code2,
                title: 'Web Development',
                description:
                  'Custom websites, e-commerce stores, and web applications built with modern technology. Professional solutions at competitive rates.',
                href: '/services',
                cta: 'View Services',
              },
              {
                icon: Globe,
                title: 'Digital Presence',
                description:
                  'Follow my journey across platforms. From coding tutorials to behind-the-scenes content — I share it all.',
                href: '/links',
                cta: 'Find Me Online',
              },
            ].map((item) => (
              <Link key={item.title} href={item.href} className="card p-8 group">
                <div className="w-12 h-12 rounded-xl bg-brand-600/10 border border-brand-600/20
                                flex items-center justify-center mb-6
                                group-hover:bg-brand-600/20 transition-colors">
                  <item.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-surface-400 mb-6 leading-relaxed">{item.description}</p>
                <span className="inline-flex items-center text-sm font-medium text-brand-400
                                 group-hover:text-brand-300 transition-colors">
                  {item.cta}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 border-t border-surface-800/50">
        <div className="section-container">
          <div className="relative overflow-hidden rounded-2xl glass p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 to-brand-800/10" />
            <div className="relative space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Ready to <span className="gradient-text">Work Together</span>?
              </h2>
              <p className="text-surface-300 max-w-xl mx-auto">
                Whether you need a stunning website or want to check out my latest book,
                I&apos;m here to help.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="btn-primary">
                  Get In Touch
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link href="/portfolio" className="btn-secondary">
                  View My Work
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
