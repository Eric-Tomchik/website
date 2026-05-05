import { Metadata } from 'next';
import Image from 'next/image';
import { Facebook, Linkedin, Instagram, Twitter, ExternalLink, BookOpen, Code2, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Links',
  description: 'Find Eric Tomchik across the web. All social media profiles and links in one place.',
};

const socialLinks = [
  {
    platform: 'Facebook',
    url: '#', // Replace with actual URL
    icon: Facebook,
    color: 'hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40',
    description: 'Follow for updates and behind-the-scenes content',
  },
  {
    platform: 'LinkedIn',
    url: '#',
    icon: Linkedin,
    color: 'hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/40',
    description: 'Connect professionally',
  },
  {
    platform: 'Instagram',
    url: '#',
    icon: Instagram,
    color: 'hover:bg-[#E4405F]/20 hover:border-[#E4405F]/40',
    description: 'Photos, stories, and reels',
  },
  {
    platform: 'TikTok',
    url: '#',
    icon: null, // Custom SVG below
    color: 'hover:bg-[#00f2ea]/20 hover:border-[#00f2ea]/40',
    description: 'Short-form video content',
  },
  {
    platform: 'X (Twitter)',
    url: '#',
    icon: Twitter,
    color: 'hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/40',
    description: 'Thoughts, threads, and tech takes',
  },
];

const siteLinks = [
  {
    label: 'Browse My Books',
    href: '/books',
    icon: BookOpen,
    description: 'Digital & physical copies available',
  },
  {
    label: 'Web Dev Services',
    href: '/services',
    icon: Code2,
    description: 'Custom websites & applications',
  },
  {
    label: 'Get In Touch',
    href: '/contact',
    icon: Mail,
    description: 'Let\'s work together',
  },
];

export default function LinksPage() {
  return (
    <div className="py-16">
      <div className="max-w-lg mx-auto px-4">
        {/* Profile */}
        <div className="text-center space-y-4 mb-10">
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-brand-500 shadow-lg shadow-brand-600/20">
            <Image
              src="/images/eric-profile.png"
              alt="Eric Tomchik"
              fill
              className="object-cover object-top"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Eric Tomchik</h1>
            <p className="text-surface-400 text-sm">Author · Web Developer · Creator</p>
          </div>
        </div>

        {/* Site links */}
        <div className="space-y-3 mb-8">
          {siteLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="card flex items-center gap-4 p-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-600/10 border border-brand-600/20
                              flex items-center justify-center flex-shrink-0
                              group-hover:bg-brand-600/20 transition-colors">
                <link.icon className="w-5 h-5 text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors">
                  {link.label}
                </div>
                <div className="text-xs text-surface-400">{link.description}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-surface-500 group-hover:text-brand-400 transition-colors" />
            </a>
          ))}
        </div>

        {/* Social links */}
        <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4 text-center">
          Follow Me
        </h2>
        <div className="space-y-3">
          {socialLinks.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`card flex items-center gap-4 p-4 group transition-all duration-300 ${social.color}`}
            >
              <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0">
                {social.icon ? (
                  <social.icon className="w-5 h-5 text-surface-300" />
                ) : (
                  <svg className="w-5 h-5 text-surface-300" fill="currentColor" viewBox="0 0 24 24">
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

        <p className="text-center text-xs text-surface-500 mt-10">
          © {new Date().getFullYear()} Eric Tomchik
        </p>
      </div>
    </div>
  );
}
