import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, BookOpen, CreditCard, Handshake, Monitor, Mail, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    "Answers to common questions about the Clover Cash Discount Program through Charity Swipes, the referral program, Eric Tomchik's books and ArcLight Press, online companions, and orders.",
  openGraph: {
    title: 'FAQ — Eric Tomchik',
    description:
      'Common questions about eliminating card processing fees with Charity Swipes, the referral program, books, and online companions.',
    url: 'https://erictomchik.com/faq',
  },
  alternates: {
    canonical: 'https://erictomchik.com/faq',
  },
};

interface FAQItem {
  question: string;
  answer: string;
}

const cloverFaqs: FAQItem[] = [
  {
    question: 'What is Charity Swipes, and how are you involved?',
    answer:
      "Charity Swipes is a merchant services provider and authorized Clover dealer that helps small businesses cut or eliminate their credit card processing costs — and donates a portion of its own revenue from every account to charitable causes. I'm Eric Tomchik, a Senior Account Executive with Charity Swipes serving the Mississippi Gulf Coast. When you request an analysis on this site, you're working directly with me.",
  },
  {
    question: 'What is the Cash Discount Program, in plain English?',
    answer:
      "Most businesses quietly absorb 2–4% of every card sale in processing fees. With a cash discount program, your listed price reflects the card price, and customers who pay with cash receive a discount at the register. The processing cost is covered by the pricing structure instead of coming out of your margin, so a $100 card sale can deposit as $100. Clover handles the signage, receipt language, and register math automatically.",
  },
  {
    question: 'What is the free processing analysis, and what does it cost me?',
    answer:
      "It costs nothing and there is no obligation. You send your most recent processing statement, I break down what you are actually paying — your true effective rate, the fees buried in the statement, and what that adds up to over a year — and I show you what the same volume looks like under a cash discount program. Plenty of owners just want to know their real number, and that is a perfectly good outcome. Start at erictomchik.com/become-a-merchant.",
  },
  {
    question: 'What kinds of businesses is this a good fit for?',
    answer:
      "Any card-heavy business where processing fees are a real line item: restaurants, bars, and coffee shops; salons, barbershops, and spas; auto repair and detail shops; HVAC, plumbing, electrical, and roofing; landscaping and home services; dental, medical, and veterinary practices; gyms and fitness studios; retail, boutiques, and convenience stores. If you run more than a few thousand dollars a month in cards, the analysis is worth the 15 minutes.",
  },
  {
    question: 'What does the process look like from start to finish?',
    answer:
      "Four steps: (1) you request the free analysis and send your latest statement; (2) I review it and walk you through your real numbers, usually within 24 hours; (3) if the program makes sense, we complete a short application and I confirm the program rules and disclosures for your business type; (4) equipment arrives preconfigured, I help you go live, and you keep your existing customers and workflow.",
  },
  {
    question: 'Do I have to change my bank or my business processes?',
    answer:
      "No. Your deposits continue going to your existing business bank account. Day to day, your staff rings up sales the same way — the register handles the cash-versus-card pricing for them.",
  },
  {
    question: 'What Clover equipment is available?',
    answer:
      "The full current Clover lineup — from handheld and mobile readers up to countertop stations with cash drawers and kitchen printers — plus access to the Clover App Store for online ordering, loyalty, gift cards, and inventory. Equipment is leased rather than free, and the right setup depends on your business. I will quote your specific configuration during the analysis rather than guessing at it here.",
  },
  {
    question: 'What support do I get after I go live?',
    answer:
      "24/7/365 support from Clover for the hardware and software, plus me as your local account executive — a real phone number, (228) 344-5724, for a person who has already seen your account.",
  },
  {
    question: 'Do I need to be on the Mississippi Gulf Coast?',
    answer:
      "In-person visits are focused on Bay St. Louis, Pass Christian, Long Beach, Gulfport, Biloxi, and Ocean Springs. But the statement analysis and setup work perfectly well remotely, so businesses outside that area are welcome to request one.",
  },
  {
    question: 'How is Charity Swipes different from any other processor calling me?',
    answer:
      "Two things. First, a portion of Charity Swipes' revenue from your account goes to charitable causes, so the money you were already spending on processing does something beyond a processor's balance sheet. Second, you get a named local rep instead of a rotating call center — the same person who reviewed your statement is the one who answers when something goes wrong.",
  },
];

const referralFaqs: FAQItem[] = [
  {
    question: 'How does the referral program work?',
    answer:
      "If you know a business owner who is tired of processing fees, send them my way using the referral form at erictomchik.com/clover. You submit their business name and a good contact, I do all the follow-up, and you earn a referral fee for every account that qualifies and signs up.",
  },
  {
    question: 'How much can I earn per referral?',
    answer:
      "$100–$300 for any account that qualifies and signs up with the Clover Cash Discount Program through Charity Swipes, with the exact amount depending on qualification and the equipment acquired. Accounts that sign up but do not fully qualify earn 50% of the standard fee, or $50–$150.",
  },
  {
    question: 'Do I have to be a customer to refer someone?',
    answer:
      "No. Anyone can refer a business — you do not need to be a merchant yourself. You do need the owner to actually be expecting my call, so please give them a heads-up before submitting.",
  },
  {
    question: 'When do I get paid?',
    answer:
      "After the referred account qualifies, signs, and activates. I will keep you posted on where the referral stands so you are never guessing.",
  },
];

const bookFaqs: FAQItem[] = [
  {
    question: 'Where can I buy your books?',
    answer:
      'Books are sold through Amazon and Barnes & Noble. Each title on erictomchik.com/books links straight to the retailers carrying it, so you can pick whichever you already have an account with. Books are not sold directly through this site.',
  },
  {
    question: 'Are the books available as ebooks?',
    answer:
      'Availability depends on the title — some are print only, others offer a digital edition. The retailer listing for each book shows exactly which formats are in stock, and the format badges on erictomchik.com/books tell you what exists before you click through.',
  },
  {
    question: 'What is ArcLight Press?',
    answer:
      'ArcLight Press is my independent publishing imprint. Every book is written, designed, and published by me — from the content to the cover design. That keeps quality control in-house and the pricing fair.',
  },
  {
    question: 'What topics do the books cover?',
    answer:
      'Practical guides for business owners and tech professionals — business credit, cybersecurity, Linux and CompTIA certification prep, ASVAB preparation, and AI tooling. The full catalog is at erictomchik.com/books.',
  },
  {
    question: 'How often do you publish new books?',
    answer:
      'I aim to publish 2–4 titles per year across business, technology, and finance topics. Subscribe to the newsletter at the bottom of any page to get notified when new books drop.',
  },
  {
    question: 'Who handles orders, shipping, and returns?',
    answer:
      'Whichever retailer you bought from. Amazon and Barnes & Noble handle payment, delivery, order tracking, and returns under their own policies — I do not have access to your order. If your copy arrives damaged, start the return with the retailer.',
  },
  {
    question: 'Can I request a bulk order or custom edition?',
    answer:
      "Yes. Bulk orders (10+ copies), custom covers, and corporate editions go through me directly rather than the retailers. Reach out through erictomchik.com/contact and I'll put together a quote.",
  },
  {
    question: 'Do you use affiliate links?',
    answer:
      'Yes. As an Amazon Associate, I earn from qualifying purchases made through links on this site. It does not change what you pay.',
  },
];

const companionFaqs: FAQItem[] = [
  {
    question: 'What are the Online Companions?',
    answer:
      'Interactive labs and tools that bring each book to life in your browser — a Linux virtual terminal, an ASVAB exam simulator, a cybersecurity lab, a business credit builder, an AI platform explorer, and a POS system selector. Browse them at erictomchik.com/companions.',
  },
  {
    question: 'Do the companions cost extra?',
    answer:
      'No. Online companions are free for book owners — pick up the matching book and the companion is there to practice with.',
  },
  {
    question: 'What is on the Resources pages?',
    answer:
      'Each book has a companion resources page at erictomchik.com/resources with up-to-date links, vendor directories, and tools referenced in the text. Because things like vendor terms and pricing change faster than print, these pages are kept current and are free and publicly accessible.',
  },
  {
    question: 'Is there a free tool I can try right now?',
    answer:
      'Yes — the Business Credit Checklist at erictomchik.com/credit-checklist tells you whether your business is credit-ready in under two minutes, no purchase required.',
  },
];

const generalFaqs: FAQItem[] = [
  {
    question: 'How can I get in touch?',
    answer:
      'The best way is through the contact form at erictomchik.com/contact — I respond within 24 hours. You can also email info@erictomchik.com, or for anything merchant services related, call or text (228) 344-5724.',
  },
  {
    question: 'Are you available for consulting or speaking?',
    answer:
      "Yes — I'm available for one-on-one consulting on business credit and business technology topics, and for speaking engagements. Use the contact form with details about your event or what you're trying to solve.",
  },
  {
    question: 'Do you still build websites for clients?',
    answer:
      'No. I am no longer taking on web development or client website projects. My focus is Charity Swipes merchant services and ArcLight Press. For anything technology related, consulting is still available through the contact page.',
  },
];

// Combine all FAQs for schema
const allFaqs = [
  ...cloverFaqs,
  ...referralFaqs,
  ...bookFaqs,
  ...companionFaqs,
  ...generalFaqs,
];

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

const SECTIONS = [
  { id: 'clover', label: 'Clover & Charity Swipes' },
  { id: 'referrals', label: 'Referral Program' },
  { id: 'books', label: 'Books' },
  { id: 'companions', label: 'Companions' },
  { id: 'general', label: 'General' },
];

function FAQSection({
  id,
  title,
  icon: Icon,
  faqs,
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  faqs: FAQItem[];
}) {
  return (
    <div id={id} className="space-y-4 scroll-mt-24">
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
            Everything you need to know about eliminating your card processing fees with
            Charity Swipes, the referral program, and the books.
          </p>
        </div>

        {/* Section jump nav */}
        <div className="max-w-3xl mx-auto mb-12 flex flex-wrap justify-center gap-2">
          {SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-surface-300 bg-surface-800/50
                         border border-surface-700/50 hover:text-white hover:border-brand-500/40
                         transition-colors"
            >
              {sec.label}
            </a>
          ))}
        </div>

        {/* FAQ sections */}
        <div className="max-w-3xl mx-auto space-y-12">
          <FAQSection
            id="clover"
            title="Clover Cash Discount & Charity Swipes"
            icon={CreditCard}
            faqs={cloverFaqs}
          />
          <FAQSection id="referrals" title="Referral Program" icon={Handshake} faqs={referralFaqs} />
          <FAQSection id="books" title="Books & ArcLight Press" icon={BookOpen} faqs={bookFaqs} />
          <FAQSection
            id="companions"
            title="Online Companions & Resources"
            icon={Monitor}
            faqs={companionFaqs}
          />
          <FAQSection id="general" title="General" icon={Mail} faqs={generalFaqs} />
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="card inline-block p-8 text-center max-w-xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-surface-400 text-sm mb-5">
              Want to know what you&apos;re actually paying to accept cards? Send your latest
              statement and I&apos;ll break it down free, usually within 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/become-a-merchant" className="btn-primary text-sm">
                Get My Free Processing Analysis <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="/contact" className="btn-secondary text-sm">
                Contact Me
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
