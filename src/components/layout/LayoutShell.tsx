'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AnnouncementBanner } from './AnnouncementBanner';

/**
 * Conditionally renders the Navbar, AnnouncementBanner, and Footer.
 * Hidden on /admin/* and /portal/* routes where dedicated layouts exist.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith('/admin') || pathname.startsWith('/portal');

  return (
    <>
      {!hideChrome && <Navbar />}
      {!hideChrome && <AnnouncementBanner />}
      <main id="main-content" className="flex-1">{children}</main>
      {!hideChrome && <Footer />}
    </>
  );
}
