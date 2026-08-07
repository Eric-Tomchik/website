'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, BookOpen, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { SearchProvider } from '@/components/ui/SearchProvider';

const bookLinks = [
  { href: '/books', label: 'All Books' },
  { href: '/resources', label: 'Resources' },
  { href: '/companions', label: 'Online Companions' },
];

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/clover', label: 'Clover Cash Discount' },
  { href: '/become-a-merchant', label: 'Become a Merchant' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

function DropdownMenu({ label, links }: { label: string; links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className="px-2.5 py-2 rounded-lg text-sm font-medium text-surface-300 whitespace-nowrap
                   hover:text-white hover:bg-surface-800/60 transition-all
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400
                   flex items-center gap-1"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 pt-1 z-50">
          <div className="py-1 min-w-[160px] rounded-lg glass border border-surface-800/50 shadow-xl">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-surface-300 hover:text-white hover:bg-surface-800/60 transition-all
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Skip-to-content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100]
                   focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-brand-400"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 glass border-b border-surface-800/50">
        <div className="section-container">
          <nav className="flex items-center justify-between h-16" aria-label="Main navigation">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <Image
                src="/et-monogram.webp"
                alt="Eric Tomchik logo"
                width={36}
                height={36}
                className="rounded-lg group-hover:brightness-110 transition-all"
              />
              <Image
                src="/et-wordmark.webp"
                alt="Eric Tomchik"
                width={140}
                height={28}
                className="h-6 sm:h-7 w-auto group-hover:brightness-110 transition-all"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-0.5">
              <Link
                href="/"
                className="px-2.5 py-2 rounded-lg text-sm font-medium text-surface-300 whitespace-nowrap
                           hover:text-white hover:bg-surface-800/60 transition-all
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Home
              </Link>
              <DropdownMenu label="Books" links={bookLinks} />
              {navLinks.filter(l => l.href !== '/').map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2.5 py-2 rounded-lg text-sm font-medium text-surface-300 whitespace-nowrap
                             hover:text-white hover:bg-surface-800/60 transition-all
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <SearchProvider />
              <ThemeToggle />
              <Link
                href="/books"
                className="btn-primary text-sm py-2 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Books
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-surface-300 hover:text-white
                         hover:bg-surface-800 transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-menu"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>

        <div
          id="mobile-nav-menu"
          role="navigation"
          aria-label="Mobile navigation"
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300 border-t border-surface-800/50',
            mobileOpen ? 'max-h-[600px]' : 'max-h-0 border-t-0'
          )}
        >
          <div className="section-container py-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-surface-300 hover:text-white
                         hover:bg-surface-800/60 transition-all font-medium
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              Home
            </Link>
            {/* Books group */}
            <div className="px-3 pt-3 pb-1 text-xs font-semibold text-brand-400 uppercase tracking-wider">Books</div>
            {bookLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 pl-6 rounded-lg text-surface-300 hover:text-white
                           hover:bg-surface-800/60 transition-all font-medium
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {link.label}
              </Link>
            ))}
            {/* Other links */}
            {navLinks.filter(l => l.href !== '/').map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-surface-300 hover:text-white
                           hover:bg-surface-800/60 transition-all font-medium
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <span className="text-sm text-surface-400">Toggle theme</span>
              </div>
              <SearchProvider />
            </div>
            <Link
              href="/books"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full mt-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Books
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
