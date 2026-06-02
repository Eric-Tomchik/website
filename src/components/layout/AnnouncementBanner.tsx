'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Megaphone } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const DISMISS_KEY_PREFIX = 'announcement-banner-dismissed-';

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash

  const enabled = useQuery(api.siteSettings.get, { key: 'announcement_enabled' });
  const text = useQuery(api.siteSettings.get, { key: 'announcement_text' }) as string | null;
  const link = useQuery(api.siteSettings.get, { key: 'announcement_link' }) as string | null;
  const linkText = useQuery(api.siteSettings.get, { key: 'announcement_link_text' }) as string | null;

  // Generate a dismiss key based on the announcement text so new announcements re-appear
  const dismissKey = text ? `${DISMISS_KEY_PREFIX}${text.slice(0, 40).replace(/\s+/g, '-').toLowerCase()}` : null;

  useEffect(() => {
    if (dismissKey && !localStorage.getItem(dismissKey)) {
      setDismissed(false);
    }
  }, [dismissKey]);

  const dismiss = () => {
    setDismissed(true);
    if (dismissKey) {
      localStorage.setItem(dismissKey, 'true');
    }
  };

  // Don't render if disabled, dismissed, or still loading
  if (!enabled || !text || dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 text-white">
      <div className="section-container">
        <div className="flex items-center justify-center gap-3 py-2.5 pr-8 text-sm font-medium">
          <Megaphone className="w-4 h-4 flex-shrink-0 hidden sm:block" />
          {link ? (
            <>
              <Link
                href={link}
                className="underline underline-offset-2 decoration-brand-300 hover:decoration-white transition-colors text-center"
              >
                {text}
              </Link>
              {linkText && (
                <Link
                  href={link}
                  className="ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-xs font-semibold whitespace-nowrap"
                >
                  {linkText}
                </Link>
              )}
            </>
          ) : (
            <span className="text-center">{text}</span>
          )}
        </div>
      </div>
      <button
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
