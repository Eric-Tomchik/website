import Link from 'next/link';
import { Facebook, Linkedin, Instagram, Twitter } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61589407526718', label: 'Facebook' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/eric-tomchik-jr/', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://www.instagram.com/cyb3ron3/', label: 'Instagram' },
  { icon: Twitter, href: 'https://x.com/EricTomchikJr', label: 'X (Twitter)' },
];

const footerLinks = [
  {
    title: 'ArcLight Press',
    links: [
      { label: 'All Books', href: '/books' },
      { label: 'Resources', href: '/resources' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Web Development', href: '/services' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Client Portal', href: '/portal' },
      { label: 'Get a Quote', href: '/contact' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'About Me', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-surface-800/50 bg-surface-950/80 dark:bg-surface-950/80">
      {/* Newsletter section */}
      <div className="border-b border-surface-800/50">
        <div className="section-container py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-white dark:text-white">
                Stay in the loop
              </h3>
              <p className="text-sm text-surface-400 mt-1">
                Get notified when new books drop and receive occasional insights on
                business credit, tech, and web development.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">
              Eric <span className="text-brand-400">Tomchik</span>
            </h3>
            <p className="text-sm text-surface-400 leading-relaxed">
              Author, founder of ArcLight Press, and web developer. Building digital
              experiences and publishing books that matter.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-surface-800 hover:bg-brand-600
                             flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-surface-300 hover:text-white" />
                </a>
              ))}
              <a
                href="https://www.tiktok.com/@c3rt1f13dg33k"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-surface-800 hover:bg-brand-600
                           flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4 text-surface-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.44 6.21 6.21 0 001.82-4.44V8.84a8.18 8.18 0 004.76 1.52V6.88a4.84 4.84 0 01-1-.19z" />
                </svg>
              </a>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-400 hover:text-brand-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-surface-800/50 flex flex-col sm:flex-row
                        items-center justify-between gap-4">
          <p className="text-sm text-surface-500">
            © {new Date().getFullYear()} Eric Tomchik. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-surface-500">
            <Link href="/privacy" className="hover:text-surface-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-surface-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
