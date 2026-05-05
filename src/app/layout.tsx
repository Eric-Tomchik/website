import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Eric Tomchik — Author, Web Developer, Creator',
    template: '%s | Eric Tomchik',
  },
  description:
    'Author, web developer, and creator. Browse my books, explore my web development services, and view my portfolio.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://erictomchik.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://erictomchik.com',
    siteName: 'Eric Tomchik',
    title: 'Eric Tomchik — Author, Web Developer, Creator',
    description:
      'Author, web developer, and creator. Browse my books, explore my web development services, and view my portfolio.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eric Tomchik',
    description: 'Author, Web Developer, Creator',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
