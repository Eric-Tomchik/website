import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Code2, ArrowRight, Coffee, Globe, Facebook, Linkedin, Instagram, Twitter, ExternalLink, Mail, Award } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../convex/_generated/api';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Eric Tomchik — published author, web developer, and creator. 6+ books through ArcLight Press, custom web development services, and tech insights.',
  openGraph: {
    title: 'About Eric Tomchik — Author & Web Developer',
    description: 'Published author, web developer, and creator. 6+ books through ArcLight Press and custom web development services.',
    url: 'https://erictomchik.com/about',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'About Eric Tomchik' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Eric Tomchik — Author & Web Developer',
    description: 'Published author with 6+ books. Custom web development services.',
    images: ['/og-image.png'],
  },
};

export const revalidate = 3600; // ISR: revalidate every hour

const socialLinks = [
  {
    platform: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=122097131439313584',
    icon: Facebook,
    color: 'hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40',
    description: 'Follow for updates and behind-the-scenes content',
  },
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/eric-tomchik-jr/',
    icon: Linkedin,
    color: 'hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/40',
    description: 'Connect professionally',
  },
  {
    platform: 'Instagram',
    url: 'https://www.instagram.com/cyb3ron3/',
    icon: Instagram,
    color: 'hover:bg-[#E4405F]/20 hover:border-[#E4405F]/40',
    description: 'Photos, stories, and reels',
  },
  {
    platform: 'TikTok',
    url: 'https://www.tiktok.com/@c3rt1f13dg33k',
    icon: null,
    color: 'hover:bg-[#00f2ea]/20 hover:border-[#00f2ea]/40',
    description: 'Short-form video content',
  },
  {
    platform: 'X (Twitter)',
    url: 'https://x.com/EricTomchikJr',
    icon: Twitter,
    color: 'hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/40',
    description: 'Thoughts, threads, and tech takes',
  },
];

// Person JSON-LD for About page
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Eric Tomchik',
  url: 'https://erictomchik.com',
  image: 'https://erictomchik.com/images/eric-profile.png',
  jobTitle: 'Author & Web Developer',
  worksFor: {
    '@type': 'Organization',
    name: 'ArcLight Press',
  },
  sameAs: [
    'https://www.facebook.com/profile.php?id=61589407526718',
    'https://www.linkedin.com/in/eric-tomchik-jr/',
    'https://www.instagram.com/cyb3ron3/',
    'https://www.tiktok.com/@c3rt1f13dg33k',
    'https://x.com/EricTomchikJr',
  ],
};

export default async function AboutPage() {
  const client = getConvexClient();
  const books = await client.query(api.books.list, {});
  const bookCount = books.length.toString();
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Image & Certifications */}
          <div className="flex flex-col items-center lg:sticky lg:top-24 gap-8">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl blur-lg opacity-30" />
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-surface-800">
                <Image
                  src="/images/eric-profile.png"
                  alt="Eric Tomchik — Author and Web Developer, wearing a suit and cap"
                  fill
                  sizes="(max-width: 768px) 100vw, 448px"
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>

            {/* Certifications */}
            <div className="w-full max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-bold text-white">Certifications</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { src: '/images/certs/comptia-cios.png', alt: 'CompTIA CIOS — IT Operations Specialist' },
                  { src: '/images/certs/comptia-network-plus.png', alt: 'CompTIA Network+ Certified' },
                  { src: '/images/certs/comptia-a-plus.png', alt: 'CompTIA A+ Certified' },
                  { src: '/images/certs/ms-azure-fundamentals.png', alt: 'Microsoft Certified: Azure Fundamentals' },
                  { src: '/images/certs/ms-security-fundamentals.png', alt: 'Microsoft Certified: Security, Compliance, and Identity Fundamentals' },
                  { src: '/images/certs/linux-essentials.png', alt: 'Linux Professional Institute: Linux Essentials' },
                ].map((cert) => (
                  <div
                    key={cert.alt}
                    className="card p-3 flex items-center justify-center group hover:border-brand-500/40 transition-all duration-300"
                    title={cert.alt}
                  >
                    <Image
                      src={cert.src}
                      alt={cert.alt}
                      width={80}
                      height={80}
                      className="w-full h-auto max-w-[80px]"
                    />
                  </div>
                ))}
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
                technologies and sharing what I learn across my social media channels.
              </p>
            </div>

            {/* Stats */}
            <ScrollReveal animation="fade-up">
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: BookOpen, label: 'Published Books', value: bookCount },
                { icon: Globe, label: 'Websites Built', value: '9' },
                { icon: Coffee, label: 'Cups of Coffee', value: '∞' },
              ].map((stat) => (
                <div key={stat.label} className="card p-4 text-center">
                  <stat.icon className="w-5 h-5 text-brand-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-surface-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            </ScrollReveal>

            {/* Tech Stack */}
            <ScrollReveal animation="fade-up" delay={100}>
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
                  'Python', 'HTML/CSS', 'Tailwind CSS', 'Convex', 'Stripe',
                  'Git', 'Cloudflare', 'AWS',
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

            </ScrollReveal>

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

            {/* Follow Me — Social Links */}
            <ScrollReveal animation="fade-up">
            <div className="pt-4 border-t border-surface-800">
              <h2 className="text-xl font-bold text-white mb-4">Follow Me</h2>
              <div className="space-y-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`card flex items-center gap-4 p-4 group transition-all duration-300 ${social.color}
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0">
                      {social.icon ? (
                        <social.icon className="w-5 h-5 text-surface-300" />
                      ) : (
                        <svg className="w-5 h-5 text-surface-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.44 6.21 6.21 0 001.82-4.44V8.84a8.18 8.18 0 004.76 1.52V6.88a4.84 4.84 0 01-1-.19z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{social.platform}</div>
                      <div className="text-xs text-surface-400">{social.description}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-surface-500" />
                  </a>
                ))}
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
