'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, BookOpen, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/books', label: 'ArcLight Press' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

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
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/et-monogram.png"
                alt="Eric Tomchik logo"
                width={36}
                height={36}
                className="rounded-lg group-hover:brightness-110 transition-all"
              />
              <Image
                src="/et-wordmark.png"
                alt="Eric Tomchik"
                width={140}
                height={28}
                className="h-6 sm:h-7 w-auto group-hover:brightness-110 transition-all"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-surface-300
                             hover:text-white hover:bg-surface-800/60 transition-all
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/portal"
                className="px-3 py-2 rounded-lg text-sm font-medium text-surface-400
                           hover:text-white hover:bg-surface-800/60 transition-all flex items-center gap-1.5
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <LogIn className="w-3.5 h-3.5" />
                Client Portal
              </Link>
              <Link
                href="/books"
                className="btn-primary text-sm py-2 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Shop Books
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
            mobileOpen ? 'max-h-[500px]' : 'max-h-0 border-t-0'
          )}
        >
          <div className="section-container py-4 space-y-1">
            {navLinks.map((link) => (
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
            <Link
              href="/portal"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-surface-300 hover:text-white
                         hover:bg-surface-800/60 transition-all font-medium flex items-center gap-2
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <LogIn className="w-4 h-4" />
              Client Portal
            </Link>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <ThemeToggle />
              <span className="text-sm text-surface-400">Toggle theme</span>
            </div>
            <Link
              href="/books"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full mt-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Shop Books
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
