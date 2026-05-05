'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/books', label: 'ArcLight Press' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/links', label: 'Links' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-surface-800/50">
      <div className="section-container">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/et-monogram.png"
              alt="ET Logo"
              width={36}
              height={36}
              className="rounded-lg group-hover:brightness-110 transition-all"
            />
            <img
              src="/et-wordmark.png"
              alt="Eric Tomchik"
              className="h-6 sm:h-7 w-auto group-hover:brightness-110 transition-all"
            />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-surface-300
                           hover:text-white hover:bg-surface-800/60 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/books" className="btn-primary text-sm py-2 px-4">
              <BookOpen className="w-4 h-4 mr-2" />
              Shop Books
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-surface-300 hover:text-white
                       hover:bg-surface-800 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </div>

      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 border-t border-surface-800/50',
          mobileOpen ? 'max-h-96' : 'max-h-0 border-t-0'
        )}
      >
        <div className="section-container py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-surface-300 hover:text-white
                         hover:bg-surface-800/60 transition-all font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/books"
            onClick={() => setMobileOpen(false)}
            className="btn-primary w-full mt-3 text-sm"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Shop Books
          </Link>
        </div>
      </div>
    </header>
  );
}
