import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner';
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
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
        url: '/og-image.webp',
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
    images: ['/og-image.webp'],
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed',
    },
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
  logo: 'https://erictomchik.com/et-monogram.webp',
  sameAs: [
    'https://www.linkedin.com/in/eric-tomchik-jr/',
    'https://www.facebook.com/profile.php?id=122097131439313584',
    'https://www.instagram.com/cyb3ron3/',
  ],
  founder: {
    '@type': 'Person',
    name: 'Eric Tomchik',
  },
};

// Inline script to apply theme before paint — prevents flash
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
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
            <AnnouncementBanner />
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
