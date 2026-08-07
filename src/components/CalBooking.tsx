'use client';

import { useEffect, useRef } from 'react';

interface CalBookingProps {
  /** Cal.com event type slug, e.g. "15min" */
  calLink: string;
  /** Height of the inline embed */
  height?: number;
}

// Minimal, dependency-free Cal.com inline embed.
// Loads the official Cal.com embed snippet once per page and renders
// the booking calendar inline, styled to blend with the site's dark theme.
declare global {
  interface Window {
    Cal?: {
      (...args: unknown[]): void;
      ns?: Record<string, (...args: unknown[]) => void>;
      loaded?: boolean;
      q?: unknown[];
    };
  }
}

function initCalEmbedScript() {
  if (typeof window === 'undefined' || window.Cal) return;

  (function (C: Window, A: string, L: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = function (a: any, ar: any) {
      a.q.push(ar);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = C.document as any;
    C.Cal =
      C.Cal ||
      function () {
        // eslint-disable-next-line prefer-rest-params
        const cal = C.Cal!;
        const ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api: any = function () {
            p(api, arguments);
          };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === 'string') {
            cal.ns![namespace] = cal.ns![namespace] || api;
            p(cal.ns![namespace], ar);
            p(cal, ['initNamespace', namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');
}

export default function CalBooking({ calLink, height = 700 }: CalBookingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initCalEmbedScript();
    const Cal = window.Cal!;
    Cal('init', { origin: 'https://cal.com' });

    Cal('inline', {
      elementOrSelector: `#cal-inline-${calLink.replace(/[^a-zA-Z0-9]/g, '-')}`,
      calLink,
      layout: 'month_view',
    });

    Cal('ui', {
      theme: 'dark',
      cssVarsPerTheme: {
        dark: { 'cal-brand': '#2563eb' },
        light: { 'cal-brand': '#2563eb' },
      },
      hideEventTypeDetails: false,
      layout: 'month_view',
    });
  }, [calLink]);

  return (
    <div
      ref={containerRef}
      id={`cal-inline-${calLink.replace(/[^a-zA-Z0-9]/g, '-')}`}
      style={{ width: '100%', height, overflow: 'auto' }}
      className="rounded-xl"
    />
  );
}
