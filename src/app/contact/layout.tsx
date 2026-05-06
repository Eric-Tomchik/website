import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Eric Tomchik for web development services, book inquiries, or collaboration opportunities on the Mississippi Gulf Coast.',
};

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact — Eric Tomchik',
  description:
    'Get in touch with Eric Tomchik for web development services, book inquiries, or collaboration.',
  url: 'https://erictomchik.com/contact',
  mainEntity: {
    '@type': 'Organization',
    name: 'ArcLight Press',
    url: 'https://erictomchik.com',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {children}
    </>
  );
}
