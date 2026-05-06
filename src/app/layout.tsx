import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ConvexClientProvider from './ConvexClientProvider';
import { CheckoutProvider } from '@/components/checkout/CheckoutContext';
import { CheckoutDrawer } from '@/components/checkout/CheckoutDrawer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',         // Don't block render for this font
  preload: false,           // Only load when font-mono class is used
});

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Eric Tomchik — Author, Web Developer, Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eric Tomchik',
    description: 'Author, Web Developer, Creator',
    images: ['/og-image.png'],
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

// Organization JSON-LD for site-wide rich results
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Eric Tomchik',
  url: 'https://erictomchik.com',
  logo: 'https://erictomchik.com/et-monogram.png',
  sameAs: [
    'https://www.linkedin.com/in/eric-tomchik-jr/',
    'https://www.facebook.com/profile.php?id=61589407526718',
    'https://www.instagram.com/cyb3ron3/',
  ],
  founder: {
    '@type': 'Person',
    name: 'Eric Tomchik',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ConvexClientProvider>
          <CheckoutProvider>
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            <CheckoutDrawer />
          </CheckoutProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
