'use client';

import { useEffect, useState } from 'react';
import { SearchModal } from './SearchModal';

interface SearchItem {
  title: string;
  description: string;
  href: string;
  type: 'blog' | 'book';
}

/**
 * Fetches search index from /api/search-index and provides it to SearchModal.
 * Data is loaded lazily when the component mounts (not blocking page render).
 */
export function SearchProvider() {
  const [items, setItems] = useState<SearchItem[]>([]);

  useEffect(() => {
    fetch('/api/search-index')
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch(() => {});
  }, []);

  return <SearchModal items={items} />;
}
