import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner';

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBanner />
      {children}
    </>
  );
}
