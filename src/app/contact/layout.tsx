import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Eric Tomchik — questions, comments, errata reports, bulk orders, or media inquiries about ArcLight Press publications.',
};

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact — Eric Tomchik',
  description:
    'Contact Eric Tomchik for questions, errata reports, or inquiries about ArcLight Press books.',
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
