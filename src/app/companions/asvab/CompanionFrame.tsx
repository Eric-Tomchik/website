'use client';

import { useEffect } from 'react';

/**
 * Full-viewport iframe that loads the ASVAB Study Guide companion app.
 * Hides the site navbar/footer so the companion takes over the entire screen,
 * while keeping the URL as erictomchik.com/companions/asvab.
 */
export function CompanionFrame() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            nav, footer, [class*="AnnouncementBanner"], [class*="announcement"] {
              display: none !important;
            }
            #main-content {
              padding: 0 !important;
              margin: 0 !important;
            }
          `,
        }}
      />
      <iframe
        src="https://eric-tomchik.github.io/asvab-companion/"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          border: 'none',
          zIndex: 50,
        }}
        title="ASVAB Study Guide Online Companion"
        allow="clipboard-write"
      />
    </>
  );
}
