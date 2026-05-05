import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Code2, ArrowRight, Coffee, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Eric Tomchik — author, web developer, and creator.',
};

export default function AboutPage() {
  return (
    <div className="py-16">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Image */}
          <div className="flex justify-center lg:sticky lg:top-24">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl blur-lg opacity-30" />
              <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden border-2 border-surface-800">
                <img
                  src="/images/eric-profile.png"
                  alt="Eric Tomchik"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold">
                About <span className="gradient-text">Me</span>
              </h1>
              <p className="text-lg text-surface-300 leading-relaxed">
                I&apos;m Eric Tomchik — a published author, founder of{' '}
                <Link href="/books" className="text-brand-400 hover:text-brand-300 transition-colors">
                  ArcLight Press
                </Link>
                , and professional web developer with a passion for creating things that matter.
                Whether it&apos;s a book that keeps you up at night or a website that drives
                your business forward, I put the same level of craft and care into everything I build.
              </p>
            </div>

            <div className="space-y-4 text-surface-300 leading-relaxed">
              <p>
                My journey started with a love for storytelling and technology. Over the
                years, I&apos;ve merged those passions into a career that lets me help
                others bring their visions to life — both on the page and on the screen.
              </p>
              <p>
                When I&apos;m not writing or coding, you can find me exploring new
                technologies, mentoring aspiring developers, and sharing what I learn
                across my social media channels.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: BookOpen, label: 'Published Books', value: '4' },
                { icon: Globe, label: 'Websites Built', value: '—' },
                { icon: Coffee, label: 'Cups of Coffee', value: '∞' },
              ].map((stat) => (
                <div key={stat.label} className="card p-4 text-center">
                  <stat.icon className="w-5 h-5 text-brand-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-surface-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
                  'Python', 'HTML/CSS', 'Tailwind CSS', 'Convex', 'Stripe',
                  'Git', 'Netlify', 'AWS',
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700
                               text-sm text-surface-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/contact" className="btn-primary">
                Work With Me
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="/books" className="btn-secondary">
                <BookOpen className="w-4 h-4 mr-2" />
                Read My Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
