import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, BookOpen, Code2, Mail, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about Eric Tomchik\'s books, web development services, ArcLight Press, and more.',
  openGraph: {
    title: 'FAQ — Eric Tomchik',
    description:
      'Answers to common questions about books, web development services, and ArcLight Press.',
    url: 'https://erictomchik.com/faq',
  },
};

interface FAQItem {
  question: string;
  answer: string;
}

const bookFaqs: FAQItem[] = [
  {
    question: 'Where can I buy your books?',
    answer:
      'All books are available directly through erictomchik.com with hardcover, paperback, and digital options. Select titles are also available on Amazon. Shopping direct means you get the best price and fastest fulfillment.',
  },
  {
    question: 'Do you offer digital versions of your books?',
    answer:
      'Yes! Most titles are available as digital downloads (PDF and/or ePub) in addition to physical editions. Digital purchases include instant download access after payment.',
  },
  {
    question: 'What is ArcLight Press?',
    answer:
      'ArcLight Press is my independent publishing imprint. Every book is written, designed, and published by me — from the content to the cover design. This lets me maintain quality control and deliver premium editions at fair prices.',
  },
  {
    question: 'Do your books come with companion resources?',
    answer:
      'Yes! Each book has a companion resources page at erictomchik.com/resources with up-to-date links, vendor directories, and tools referenced in the text. These resources are free and publicly accessible.',
  },
  {
    question: 'How often do you publish new books?',
    answer:
      'I aim to publish 2–4 titles per year across business, technology, and finance topics. Subscribe to the newsletter at the bottom of any page to get notified when new books drop.',
  },
  {
    question: 'Can I request a bulk order or custom edition?',
    answer:
      'Absolutely. For bulk orders (10+ copies), custom covers, or corporate editions, reach out through the contact page and I\'ll put together a custom quote.',
  },
];

const serviceFaqs: FAQItem[] = [
  {
    question: 'What types of websites do you build?',
    answer:
      'I build everything from personal brand sites and small business websites to full-stack web applications with databases, user authentication, and payment processing. All projects use modern frameworks like Next.js, React, and Tailwind CSS.',
  },
  {
    question: 'How much does a website cost?',
    answer:
      'Starter sites begin at $1,500, Business Pro sites at $3,500, and Custom Applications at $7,500. Every project is scoped individually — the final price depends on your specific needs, number of pages, and feature complexity.',
  },
  {
    question: 'How long does a project typically take?',
    answer:
      'Starter sites are usually completed within 2–3 weeks. Business Pro projects take 4–6 weeks. Custom applications vary based on scope but typically run 6–12 weeks. I provide a detailed timeline before work begins.',
  },
  {
    question: 'Do you provide hosting and maintenance?',
    answer:
      'Yes. All projects include deployment to production hosting (typically Cloudflare or Vercel) and post-launch support ranging from 30–90 days depending on the plan. Ongoing maintenance packages are also available.',
  },
  {
    question: 'Do you work with clients outside the Gulf Coast?',
    answer:
      'Absolutely. While many of my clients are on the Mississippi Gulf Coast, I work with businesses nationwide. All communication and project management happens online.',
  },
  {
    question: 'What does the Client Portal include?',
    answer:
      'The Client Portal at erictomchik.com/portal gives you access to project milestones, document sharing, support tickets, and real-time project updates. It\'s included with every Business Pro and Custom Application project.',
  },
];

const generalFaqs: FAQItem[] = [
  {
    question: 'How can I get in touch?',
    answer:
      'The best way is through the contact form at erictomchik.com/contact. I respond within 24 hours. You can also reach me via email at info@erictomchik.com or connect on social media.',
  },
  {
    question: 'Are you available for consulting or speaking?',
    answer:
      'Yes — I\'m available for one-on-one consulting on web development, business technology, and business credit topics. For speaking inquiries, please use the contact form with details about your event.',
  },
];

// Combine all FAQs for schema
const allFaqs = [...bookFaqs, ...serviceFaqs, ...generalFaqs];

// FAQ structured data for Google rich results
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

function FAQSection({
  title,
  icon: Icon,
  faqs,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  faqs: FAQItem[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-brand-600/10 border border-brand-600/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand-400" />
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group card p-0 overflow-hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium hover:bg-surface-800/40 transition-colors list-none">
              <span className="pr-4">{faq.question}</span>
              <span className="text-surface-500 group-open:rotate-45 transition-transform duration-200 text-xl flex-shrink-0">
                +
              </span>
            </summary>
            <div className="px-6 pb-5 text-surface-300 text-sm leading-relaxed border-t border-surface-800/50 pt-4">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="section-container">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400 mb-6">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-surface-400 max-w-2xl mx-auto">
            Everything you need to know about my books, web development services, and how
            to work together.
          </p>
        </div>

        {/* FAQ sections */}
        <div className="max-w-3xl mx-auto space-y-12">
          <FAQSection title="Books & ArcLight Press" icon={BookOpen} faqs={bookFaqs} />
          <FAQSection title="Web Development Services" icon={Code2} faqs={serviceFaqs} />
          <FAQSection title="General" icon={Mail} faqs={generalFaqs} />
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="card inline-block p-8 text-center">
            <h3 className="text-lg font-bold text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-surface-400 text-sm mb-4">
              I&apos;d love to hear from you. Get in touch and I&apos;ll respond within 24 hours.
            </p>
            <Link href="/contact" className="btn-primary text-sm">
              Contact Me <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
