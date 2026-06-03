'use client';

import { useEffect } from 'react';

/**
 * Full-viewport iframe that loads the Linux Essentials companion app.
 * Hides the site navbar/footer so the companion takes over the entire screen,
 * while keeping the URL as erictomchik.com/companions/linux-essentials.
 */
export function CompanionFrame() {
  useEffect(() => {
    // Prevent scrolling behind the iframe
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* Hide site chrome so the companion is fully immersive */}
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
        src="https://manuscriptcompanion-7cf60ec5.viktor.space"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          border: 'none',
          zIndex: 50,
        }}
        title="Linux Essentials Online Companion"
        allow="clipboard-write"
      />
    </>
  );
}
