'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, BookOpen, Globe, ArrowRight } from 'lucide-react';

interface SearchItem {
  title: string;
  description: string;
  href: string;
  type: 'blog' | 'book' | 'portfolio';
}

interface SearchModalProps {
  items: SearchItem[];
}

export function SearchModal({ items }: SearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter items
  const results = query.trim().length < 2
    ? []
    : items.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }).slice(0, 10);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index on results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  const navigate = useCallback((href: string) => {
    setIsOpen(false);
    router.push(href);
  }, [router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex].href);
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="w-4 h-4 text-brand-400" />;
      case 'book': return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'portfolio': return <Globe className="w-4 h-4 text-violet-400" />;
      default: return <FileText className="w-4 h-4 text-surface-400" />;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'blog': return 'Article';
      case 'book': return 'Book';
      case 'portfolio': return 'Project';
      default: return type;
    }
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-400
                   hover:text-white hover:bg-surface-800/60 transition-all
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        aria-label="Search site"
      >
        <Search className="w-4 h-4" />
        <span className="hidden xl:inline">Search</span>
        <kbd className="hidden xl:inline text-[10px] px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700 text-surface-500 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Modal backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal */}
          <div
            className="w-full max-w-xl mx-4 bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-surface-800">
              <Search className="w-5 h-5 text-surface-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search articles, books, projects…"
                className="flex-1 bg-transparent py-4 text-white placeholder:text-surface-500
                           focus:outline-none text-base"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-surface-800 transition-colors"
              >
                <X className="w-4 h-4 text-surface-500" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {query.trim().length < 2 ? (
                <div className="px-4 py-8 text-center text-sm text-surface-500">
                  Start typing to search across articles, books, and projects…
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-surface-500">
                  No results found for &quot;{query}&quot;
                </div>
              ) : (
                <ul className="py-2">
                  {results.map((item, i) => (
                    <li key={item.href}>
                      <button
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
                          ${i === selectedIndex ? 'bg-surface-800/80' : 'hover:bg-surface-800/40'}`}
                      >
                        <div className="mt-0.5 flex-shrink-0">{typeIcon(item.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{item.title}</div>
                          <div className="text-xs text-surface-400 truncate mt-0.5">{item.description}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                          <span className="text-[10px] text-surface-500 uppercase tracking-wider">{typeLabel(item.type)}</span>
                          <ArrowRight className="w-3 h-3 text-surface-600" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-surface-800 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-surface-500">
                <span><kbd className="font-mono bg-surface-800 px-1 py-0.5 rounded border border-surface-700">↑↓</kbd> Navigate</span>
                <span><kbd className="font-mono bg-surface-800 px-1 py-0.5 rounded border border-surface-700">↵</kbd> Open</span>
                <span><kbd className="font-mono bg-surface-800 px-1 py-0.5 rounded border border-surface-700">esc</kbd> Close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
