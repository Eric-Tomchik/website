import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  Globe,
  Mail,
  Briefcase,
  PenLine,
  Instagram,
  Linkedin,
  Facebook,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Links — Eric Tomchik',
  description:
    "All of Eric Tomchik's important links in one place — books, portfolio, blog, services, and social media.",
};

const links = [
  {
    label: 'Browse My Books',
    href: '/books',
    icon: BookOpen,
    description: '6+ books on business credit, cybersecurity & tech',
  },
  {
    label: 'View Portfolio',
    href: '/portfolio',
    icon: Globe,
    description: '9+ live websites on the Mississippi Gulf Coast',
  },
  {
    label: 'Read the Blog',
    href: '/blog',
    icon: PenLine,
    description: 'Insights on credit, cybersecurity & web dev',
  },
  {
    label: 'Hire Me',
    href: '/services',
    icon: Briefcase,
    description: 'Web development, consulting & tech services',
  },
  {
    label: 'Subscribe to Newsletter',
    href: '/about#newsletter',
    icon: Mail,
    description: 'Tips, new releases & exclusive content',
  },
];

const socials = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/cyb3ron3/',
    icon: Instagram,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/eric-tomchik-jr/',
    icon: Linkedin,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61589407526718',
    icon: Facebook,
  },
];

export default function LinksPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Profile */}
        <div className="mb-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white">
            ET
          </div>
          <h1 className="text-2xl font-extrabold text-white">Eric Tomchik</h1>
          <p className="text-surface-400 mt-1">
            Author · Web Developer · Creator
          </p>
        </div>

        {/* Main Links */}
        <div className="space-y-3 mb-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 w-full p-4 rounded-xl border border-surface-700 bg-surface-900/60 hover:bg-surface-800 hover:border-brand-500/50 transition-all group"
            >
              <link.icon className="w-5 h-5 text-brand-400 shrink-0" />
              <div className="text-left">
                <div className="text-white font-semibold group-hover:text-brand-300 transition-colors">
                  {link.label}
                </div>
                <div className="text-surface-500 text-sm">{link.description}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-4">
          {socials.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-surface-700 bg-surface-900/60 hover:bg-surface-800 hover:border-brand-500/50 flex items-center justify-center transition-all"
              aria-label={social.label}
            >
              <social.icon className="w-5 h-5 text-surface-400 hover:text-brand-400" />
            </a>
          ))}
        </div>

        {/* Footer */}
        <p className="text-surface-600 text-xs mt-10">
          © {new Date().getFullYear()} Eric Tomchik · erictomchik.com
        </p>
      </div>
    </div>
  );
}
