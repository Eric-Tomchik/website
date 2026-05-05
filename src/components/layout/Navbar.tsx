'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Code2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/books', label: 'Books' },
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
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center
                            group-hover:bg-brand-500 transition-colors">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Eric <span className="text-brand-400">Tomchik</span>
            </span>
          </Link>

          {/* Desktop nav */}
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

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/books" className="btn-primary text-sm py-2 px-4">
              <BookOpen className="w-4 h-4 mr-2" />
              Shop Books
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-surface-300 hover:text-white
                       hover:bg-surface-800 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
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
