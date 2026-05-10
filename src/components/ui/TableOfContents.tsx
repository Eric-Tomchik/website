'use client';

import { useEffect, useState, useCallback } from 'react';
import { List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);

  // Parse headings from markdown content
  useEffect(() => {
    const parsed: TocItem[] = [];
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^(#{2,4})\s+(.+)/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        parsed.push({ id, text, level });
      }
    }
    setHeadings(parsed);
  }, [content]);

  // Track active heading on scroll via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  if (headings.length < 3) return null; // Only show TOC for posts with 3+ headings

  return (
    <nav
      aria-label="Table of contents"
      className="card p-4 mb-8"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-semibold text-white">Table of Contents</span>
        </div>
        <span className="text-xs text-surface-500">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <ul className="mt-3 space-y-1 border-l border-surface-700 ml-2">
          {headings.map((h) => (
            <li key={h.id}>
              <button
                onClick={() => handleClick(h.id)}
                className={`block w-full text-left text-sm py-1 transition-colors
                  ${h.level === 2 ? 'pl-4' : h.level === 3 ? 'pl-7' : 'pl-10'}
                  ${activeId === h.id
                    ? 'text-brand-400 border-l-2 border-brand-400 -ml-[1px]'
                    : 'text-surface-400 hover:text-surface-200'
                  }`}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
