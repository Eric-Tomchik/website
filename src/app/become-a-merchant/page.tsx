import { Metadata } from 'next';
import DeferredCalBooking from '@/components/DeferredCalBooking';
import MerchantSignupForm from '@/components/MerchantSignupForm';
import ReferralForm from '@/components/ReferralForm';
import ProcessingSavingsCalculator from '@/components/ProcessingSavingsCalculator';
import {
  ArrowRight,
  BadgeDollarSign,
  Banknote,
  CheckCircle,
  ClipboardCheck,
  CreditCard,
  FileSearch,
  Fuel,
  Gift,
  Handshake,
  Headphones,
  Heart,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageSquare,
  MessageSquareQuote,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Users,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Free Credit Card Processing Analysis for Gulf Coast Businesses — Charity Swipes',
  description:
    'How much is your business paying to accept credit cards? Get a free 15-minute processing statement review from a local Gulf Coast account executive — and see whether the Charity Swipes Cash Discount Program with Clover POS is a fit. No obligation.',
  keywords: [
    'credit card processing analysis',
    'merchant statement review',
    'cash discount program',
    'Clover POS',
    'credit card processing Gulfport MS',
    'credit card processing Biloxi',
    'zero fee credit card processing',
    'Charity Swipes merchant',
  ],
  openGraph: {
    title: 'How Much Is Your Business Paying to Accept Credit Cards?',
    description:
      'Free 15-minute processing statement review for Gulf Coast businesses. See what you are actually paying — and whether there is a better option.',
    url: 'https://erictomchik.com/become-a-merchant',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Free credit card processing analysis — Charity Swipes',
      },
    ],
  },
  alternates: {
    canonical: 'https://erictomchik.com/become-a-merchant',
  },
};

const auditOutputs = [
  'Your current monthly processing expense, in dollars',
  'Your true effective rate — not the teaser rate you were quoted',
  'What that adds up to over a full year',
  'Which line items are fees, assessments, and add-ons',
  'Whether the Cash Discount Program is a fit for your business',
  'Your options, in plain English — with no obligation to switch',
];

const steps = [
  {
    step: '1',
    icon: FileSearch,
    title: 'Send Your Statement',
    desc: 'Request the free analysis below and upload your most recent processing statement right on the form — that one document holds every number we need.',
  },
  {
    step: '2',
    icon: Phone,
    title: '15-Minute Review',
    desc: 'Eric walks you through what you are actually paying today, line by line, and where the money is going. Just the numbers.',
  },
  {
    step: '3',
    icon: Truck,
    title: 'Decide, Then Set Up',
    desc: 'If it makes sense, choose your Clover terminal (leased — cost depends on the equipment) and Charity Swipes helps you get configured and live.',
  },
  {
    step: '4',
    icon: Heart,
    title: 'Every Swipe Gives Back',
    desc: 'From then on, a portion of program proceeds from your transactions supports charitable causes in your community.',
  },
];

const perks = [
  {
    icon: BadgeDollarSign,
    title: 'Cash Discount Program',
    description:
      'Card-paying customers cover the transaction fee, so you keep the full listed price on the sale. We confirm eligibility and disclosures for your business before anything changes.',
  },
  {
    icon: Heart,
    title: 'Give Back Automatically',
    description:
      'Charity Swipes directs a portion of program proceeds to charitable causes — built into how you already take payments.',
  },
  {
    icon: LayoutDashboard,
    title: 'Modern Clover Hardware',
    description:
      'Tap-to-pay terminals, cloud dashboard, inventory, loyalty, and 300+ Clover apps. Equipment is leased, with packages starting at $99/mo — see the pricing below.',
  },
  {
    icon: MapPin,
    title: 'A Local Account Executive',
    description:
      'Eric lives and works on the Gulf Coast. You get a real person who shows up — not a call center in another time zone.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent & Disclosed',
    description:
      'Cash discount pricing is disclosed to your customers at the point of sale, with the required signage and program rules confirmed up front.',
  },
  {
    icon: Headphones,
    title: '24/7/365 Support',
    description:
      'Clover support is available any hour of any day for the hardware and software — and Eric is a local phone call for everything else.',
  },
  {
    icon: Store,
    title: 'No Pressure to Switch',
    description:
      'The analysis is free and standalone. Plenty of owners just want to know their real number — that is a perfectly good outcome.',
  },
];

const targetIndustries = [
  'Restaurants & bars',
  'Salons & barbershops',
  'Auto repair & automotive',
  'HVAC, plumbing & electrical',
  'Roofing & landscaping',
  'Dental & medical practices',
  'Veterinary clinics',
  'Gyms & fitness studios',
  'Retail shops & boutiques',
  'Convenience stores',
  'Florists',
  'Cleaning services',
  'Professional services',
  'Tourist & marine businesses',
];

// Clover equipment packages. Prices are the published monthly lease rates —
// naming a starting number removes the biggest unanswered question on the page.
const packages = [
  {
    name: 'Keep-It-Simple',
    price: '$99',
    period: '/mo',
    best: 'Single register, straightforward checkout',
    features: [
      '6" touchscreen terminal',
      'Tap-to-pay, chip & swipe',
      'Print, email, or text receipts',
      'Clover App Store access',
    ],
    accent: false,
  },
  {
    name: 'Professional',
    price: '$199',
    period: '/mo',
    best: 'Repeat customers and inventory to track',
    features: [
      '8" touchscreen terminal',
      'Loyalty programs',
      'Gift card management',
      'Inventory management',
      'Everything in Keep-It-Simple',
    ],
    accent: true,
  },
  {
    name: 'Full Service',
    price: '$349',
    period: '/mo',
    best: 'Restaurants, bars, and multi-station floors',
    features: [
      '14" touchscreen + 8" customer display',
      'Full inventory & employee management',
      'Online ordering integration',
      'Damage & theft insurance',
      'Everything in Professional',
    ],
    accent: false,
  },
];

const feeExamples = [
  { volume: '$10,000', fees: '$200–$400' },
  { volume: '$25,000', fees: '$500–$1,000' },
  { volume: '$50,000', fees: '$1,000–$2,000' },
];

const reviews = [
  {
    name: 'Eli Burke',
    role: 'Business Owner',
    rating: 5,
    text: 'The setup process was effortless, and the results have been flawless. It\'s rare for a product to work this well from day one. Every transaction is instant and secure. The design is clean and intuitive. It\'s a top-tier service.',
  },
  {
    name: 'Renee VanHeel',
    role: 'President, Processing Forward',
    rating: 5,
    text: 'We are excited to put our customers first and have the opportunity to make a difference in our communities by donating back to charity. Every swipe benefits charity!',
  },
];

const referralSteps = [
  {
    step: '1',
    icon: Users,
    title: 'Identify a Business',
    desc: 'Know an owner who is tired of processing fees? They could be your next referral.',
  },
  {
    step: '2',
    icon: Mail,
    title: 'Submit the Referral',
    desc: 'Fill out the form below with their details and your contact info. It takes a minute.',
  },
  {
    step: '3',
    icon: Banknote,
    title: 'Get Paid',
    desc: 'Once the business qualifies and signs up through Charity Swipes, you receive your fee.',
  },
];

const faqs = [
  {
    question: 'What exactly is the free processing analysis?',
    answer:
      'You send your most recent credit card processing statement and Eric reviews it with you in about 15 minutes. You get your current monthly cost, your true effective rate, the annualized figure, and a breakdown of the fees on your statement. There is no cost and no obligation to switch — many owners simply want to know their real number.',
  },
  {
    question: 'Is it safe to send you my processing statement?',
    answer:
      'Yes. The upload goes over an encrypted connection into private storage — it is never publicly reachable, never posted anywhere, and never sold or shared for marketing. Only Eric opens it, and it is deleted the moment you ask. If you would rather not upload anything, a redacted copy or even a phone photo of the fee summary page is enough to run the numbers.',
  },
  {
    question: 'Will my customers be upset about a card fee?',
    answer:
      'This is the most common question, and it deserves a straight answer. Under a cash discount program, the pricing difference between cash and card is disclosed clearly at the point of sale with the required signage, the same way it works at gas stations most people already use. Eric will walk you through exactly how it is presented in your store, and what other local merchants have experienced, before you decide.',
  },
  {
    question: 'Is a cash discount program legal in Mississippi?',
    answer:
      'Cash discounting is a widely used, disclosed pricing practice, and the rules around it — including required signage and how the discount is presented — are specific. Eric confirms the current program rules, card-brand requirements, and disclosures that apply to your business type before anything is implemented, rather than relying on a blanket claim.',
  },
  {
    question: 'What does the Clover equipment cost?',
    answer:
      'Clover terminals are leased monthly, and packages start at $99/mo for a single-register setup, $199/mo with loyalty and inventory, and $349/mo for a full multi-station restaurant floor. Eric confirms the exact configuration and cost for your business during the review, before you sign anything, so it is part of the math rather than a surprise afterward.',
  },
  {
    question: 'Am I locked into a long-term contract?',
    answer:
      'Terms, length, and any early termination conditions are shown to you in writing before you sign, and Eric will walk through them with you line by line. If a term does not work for your business, say so during the review.',
  },
  {
    question: 'How fast do I get my money?',
    answer:
      'Funding timelines depend on your account setup and batch times. Eric will confirm the exact deposit schedule for your account during the review so you can plan cash flow around it.',
  },
  {
    question: 'I already have a POS. How hard is switching?',
    answer:
      'Most switches are straightforward: the terminal is configured before it reaches you, and Eric helps get it live and your staff comfortable. If you have integrations or inventory that need to carry over, bring that up during the review so it is planned rather than improvised.',
  },
  {
    question: 'What does Charity Swipes actually do with the charitable portion?',
    answer:
      'A portion of program proceeds from merchant transactions is directed to charitable causes. Eric can walk you through which causes are currently supported and how the giving is structured, so you can talk about it accurately with your own customers.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Free Merchant Credit Card Processing Analysis',
  serviceType: 'Merchant services and payment processing consultation',
  description:
    'Free review of a business\u2019s current credit card processing statement, including effective rate, monthly and annual cost, and available pricing options such as the Charity Swipes Cash Discount Program with Clover POS.',
  provider: {
    '@type': 'Person',
    name: 'Eric Tomchik',
    jobTitle: 'Senior Account Executive',
    email: 'eric@charityswipes.com',
    telephone: '+1-228-344-5724',
    worksFor: { '@type': 'Organization', name: 'Charity Swipes' },
  },
  areaServed: [
    'Bay St. Louis, MS',
    'Pass Christian, MS',
    'Long Beach, MS',
    'Gulfport, MS',
    'Biloxi, MS',
    'Ocean Springs, MS',
  ].map((name) => ({ '@type': 'City', name })),
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free 15-minute processing statement review, no obligation.',
  },
  url: 'https://erictomchik.com/become-a-merchant',
};

export default function BecomeAMerchantPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      {/* ── Hero: lead with the owner's expense, not the pitch ───────────────── */}
      <section className="relative overflow-hidden pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />

        <div className="section-container relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400">
                <MapPin className="w-4 h-4" />
                Free Merchant Savings Analysis — Gulf Coast
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
                How Much Is Your Business Paying to{' '}
                <span className="gradient-text">Accept Credit Cards?</span>
              </h1>

              <p className="text-base sm:text-xl text-surface-300 leading-relaxed">
                Find out in 15 minutes — free. Send your most recent processing statement and
                I&apos;ll show you exactly what you&apos;re paying today.
                <span className="hidden sm:inline">
                  {' '}
                  Then we&apos;ll look at whether the Charity Swipes Cash Discount Program with
                  Clover POS could reduce your out-of-pocket processing expense — while helping
                  support charitable causes.
                </span>
              </p>

              <p className="hidden sm:block text-surface-400">
                You may be handing thousands of dollars a year to a processor without ever seeing
                the real number. Let&apos;s find out what it actually is.
              </p>

              <div className="flex flex-wrap gap-4 pt-1">
                <a href="#analysis" className="btn-primary text-lg py-4 px-8">
                  <ClipboardCheck className="w-5 h-5 mr-2" />
                  Get My Free Processing Analysis
                </a>
                <a
                  href="tel:2283445724"
                  className="btn-secondary text-lg py-4 px-8"
                  aria-label="Call or text Eric at (228) 344-5724"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Call or Text (228) 344-5724
                </a>
              </div>

              <div className="pt-1">
                <a
                  href="#referral-program"
                  className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                >
                  <Gift className="w-4 h-4" />
                  Not a business owner? Earn up to $300 per referral →
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-3 text-sm">
                <div className="flex items-center gap-2">
                  {/* TODO: link this to the Google Business profile and add the review count. */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-white font-bold">4.8</span>
                  <span className="text-surface-400">on Google</span>
                </div>
                <span className="flex items-center gap-1.5 text-surface-400">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  Authorized Clover dealer
                </span>
                <span className="flex items-center gap-1.5 text-surface-400">
                  <Handshake className="w-4 h-4 text-brand-400" />
                  No obligation
                </span>
              </div>
            </div>

            <ProcessingSavingsCalculator />
          </div>
        </div>
      </section>

      {/* ── The problem ─────────────────────────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-red-400 mb-4">
                <CreditCard className="w-3.5 h-3.5" />
                Most owners have never checked
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Processing fees are the expense nobody{' '}
                <span className="gradient-text">audits</span>
              </h2>
              <p className="text-surface-400 leading-relaxed">
                You renegotiate rent. You shop insurance. You watch food and labor costs weekly. But
                the fee that comes off every single card sale usually gets set once, years ago, and
                never looked at again — while rates, assessments, and monthly add-ons quietly drift
                upward. A statement review costs you 15 minutes and tells you where you actually
                stand.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-10">
              {feeExamples.map((item) => (
                <div
                  key={item.volume}
                  className="text-center p-5 rounded-lg bg-surface-800/40 border border-surface-700/50"
                >
                  <div className="text-lg font-bold text-white">{item.volume}</div>
                  <div className="text-xs text-surface-400">in monthly card sales</div>
                  <div className="text-red-400 font-semibold mt-2">{item.fees}/mo in fees</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-surface-500 text-center max-w-2xl mx-auto mt-4">
              Based on a typical 2–4% effective rate. Your actual number is on your statement — that
              is what the analysis reads.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* ── How the cash discount program works (gas station analogy) ───────── */}
      <ScrollReveal animation="fade-up">
        <section id="how-it-works" className="py-16 border-t border-surface-800/50 scroll-mt-24">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-brand-400 mb-4">
                  <Fuel className="w-3.5 h-3.5" />
                  Think of it like a gas station
                </div>
                <h2 className="text-3xl font-bold text-white">
                  How the <span className="gradient-text">Cash Discount Program</span> Works
                </h2>
              </div>

              <div className="card p-8 space-y-4 text-surface-300 leading-relaxed">
                <p>
                  Gas stations have posted{' '}
                  <span className="text-white font-semibold">two prices</span> for years — one for
                  cash, one for card. Pay cash, pay the listed price. Choose the convenience of a
                  card and a small difference applies. Nobody blinks at the pump, because it is
                  posted plainly before you pump.
                </p>
                <p>
                  A cash discount program works the same way for your business. Your{' '}
                  <span className="text-white font-semibold">listed prices are the cash prices</span>
                  . When a customer pays by card, the transaction fee is applied at checkout
                  instead of coming out of your margin. Either way{' '}
                  <span className="text-white font-semibold">
                    you keep the full listed price on the sale
                  </span>
                  .
                </p>
                <p>
                  Clover handles the pricing, signage prompts, and receipt language automatically at
                  the register — no manual math and no awkward conversations for your staff. The
                  specific program rules, disclosures, and signage requirements that apply to your
                  business type are confirmed with you before anything changes.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div className="p-6 rounded-lg bg-red-900/10 border border-red-500/20 text-center">
                    <div className="text-sm text-red-400 font-semibold mb-2">
                      Standard Processing
                    </div>
                    <div className="text-2xl font-bold text-white">$100 sale</div>
                    <div className="text-red-400 mt-1">→ $96–$98 deposited</div>
                    <div className="text-xs text-surface-400 mt-2">
                      You absorb the fee on every transaction
                    </div>
                  </div>
                  <div className="p-6 rounded-lg bg-green-900/10 border border-green-500/20 text-center">
                    <div className="text-sm text-green-400 font-semibold mb-2">
                      Cash Discount Program
                    </div>
                    <div className="text-2xl font-bold text-white">$100 listed price</div>
                    <div className="text-green-400 mt-1">→ $100 deposited</div>
                    <div className="text-xs text-surface-400 mt-2">
                      Card fee applied at checkout, not to your margin
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <a href="#analysis" className="btn-primary py-3.5 px-8">
                  Get My Free Processing Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── What the free analysis gives you ────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-green-400 mb-4">
                <Search className="w-3.5 h-3.5" />
                Free · 15 minutes · No obligation
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                What Your Free Analysis <span className="gradient-text">Tells You</span>
              </h2>
              <p className="text-surface-400">
                One document — your most recent processing statement — is all it takes.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {auditOutputs.map((item) => (
                <div key={item} className="card p-5 flex items-start gap-3">
                  <ClipboardCheck className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-surface-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-surface-500 text-center max-w-2xl mx-auto mt-6 leading-relaxed">
              All projections are estimates. Actual pricing and eligibility depend on your business
              type, card mix, and current program rules, which are confirmed before any savings
              figure is presented as final.
            </p>

            <div className="text-center mt-8">
              <a href="#analysis" className="btn-primary py-3.5 px-8">
                Get My Free Processing Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                From Statement to <span className="gradient-text">First Swipe for Charity</span>
              </h2>
              <p className="text-surface-400">Four steps. You can stop after step two.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {steps.map((item) => (
                <div key={item.step} className="card p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-brand-400 font-bold">{item.step}</span>
                  </div>
                  <item.icon className="w-6 h-6 text-brand-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Why merchants switch ───────────────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Why Gulf Coast Businesses Work With{' '}
                <span className="gradient-text">Charity Swipes</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {perks.map((item) => (
                <div key={item.title} className="card p-6 group">
                  <div
                    className="w-12 h-12 rounded-lg bg-brand-600/10 border border-brand-600/20
                               flex items-center justify-center mb-4
                               group-hover:bg-brand-600/20 transition-colors"
                  >
                    <item.icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Equipment pricing ─────────────────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section id="pricing" className="py-16 border-t border-surface-800/50 scroll-mt-24">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-brand-400 mb-4">
                <CreditCard className="w-3.5 h-3.5" />
                Equipment, priced up front
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                What the <span className="gradient-text">Clover Hardware</span> Costs
              </h2>
              <p className="text-surface-400">
                Terminals are leased monthly. Here is what each package includes so you can do the
                math yourself before you ever talk to anyone.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`card p-8 flex flex-col ${
                    pkg.accent ? 'border-brand-500/40 ring-1 ring-brand-500/20' : ''
                  }`}
                >
                  {pkg.accent && (
                    <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-3xl font-extrabold text-white">{pkg.price}</span>
                    <span className="text-surface-400">{pkg.period}</span>
                  </div>
                  <p className="text-xs text-surface-500 mt-2 mb-6">Best for: {pkg.best}</p>
                  <ul className="space-y-3 flex-1">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-surface-300">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#analysis"
                    className={`mt-6 text-center py-3 rounded-lg font-medium transition-all w-full ${
                      pkg.accent ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    Get My Free Analysis
                  </a>
                </div>
              ))}
            </div>

            <p className="text-xs text-surface-500 text-center max-w-2xl mx-auto mt-6 leading-relaxed">
              Monthly lease rates for the equipment package. Final pricing, term length, and any
              additional fees are confirmed in writing for your specific setup before you sign
              anything.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Proof ─────────────────────────────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-yellow-400 mb-4">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                4.8-star Google rating
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Trusted by <span className="gradient-text">Business Owners</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {reviews.map((review) => (
                <div key={review.name} className="card p-8 relative">
                  <MessageSquareQuote className="w-10 h-10 text-brand-600/20 absolute top-6 right-6" />
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-surface-300 leading-relaxed mb-6 relative z-10">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div>
                    <div className="font-semibold text-white">{review.name}</div>
                    <div className="text-sm text-surface-400">{review.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── The giving difference ──────────────────────────────────────────────
           TODO (needs real data from Eric before this converts at full strength):
             1. Names/logos of the causes currently supported.
             2. A dollars-given-to-date figure to replace the generic claim.
             3. Merchant marketing kit assets (window decal, counter card, social
                graphics) to link or preview here.
      ─────────────────────────────────────────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-brand-400">
                <Heart className="w-3.5 h-3.5" />
                The part no other processor can copy
              </div>
              <h2 className="text-3xl font-bold text-white">
                Your Payments Already Move Money.{' '}
                <span className="gradient-text">Point Some of It Somewhere Good.</span>
              </h2>
              <p className="text-surface-300 leading-relaxed">
                Every processor sells rates. Charity Swipes turns the transactions you&apos;re
                already running into charitable support — and gives you something real to tell your
                customers. It&apos;s good for the causes, and it&apos;s good for how your business
                is seen in town.
              </p>
              <div className="card p-6 text-left max-w-xl mx-auto">
                <div className="text-sm font-bold text-white mb-2">
                  Ask about the merchant marketing kit
                </div>
                <p className="text-sm text-surface-400 leading-relaxed">
                  Signage and social graphics that let your customers know their card purchase here
                  helps support charitable causes — local goodwill you don&apos;t have to create
                  from scratch.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Who this is for ───────────────────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Best Fit For <span className="gradient-text">Card-Heavy Businesses</span>
              </h2>
              <p className="text-surface-400">
                If a meaningful share of your sales come in on plastic, the numbers are worth
                checking. Serving Bay St. Louis, Pass Christian, Long Beach, Gulfport, Biloxi, and
                Ocean Springs.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
              {targetIndustries.map((industry) => (
                <span
                  key={industry}
                  className="px-4 py-2 rounded-full glass text-sm text-surface-300 border border-surface-700/50"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── FAQ / objection handling ──────────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section id="faq" className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Straight Answers to the <span className="gradient-text">Real Questions</span>
                </h2>
                <p className="text-surface-400">
                  The things business owners actually ask before they&apos;ll send a statement.
                </p>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <details key={i} className="group card p-0 overflow-hidden">
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
          </div>
        </section>
      </ScrollReveal>

      {/* ── Primary conversion point ─────────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section id="analysis" className="py-16 border-t border-surface-800/50 scroll-mt-24">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-green-400 mb-4">
                  <FileSearch className="w-3.5 h-3.5" />
                  Free Processing Analysis
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Find Out What You&apos;re <span className="gradient-text">Actually Paying</span>
                </h2>
                <p className="text-surface-400 max-w-xl mx-auto">
                  Four quick fields. Eric follows up within 24 hours to review your statement with
                  you — no cost, no obligation, just your numbers.
                </p>
              </div>
              <div className="card p-6 sm:p-8">
                <MerchantSignupForm />
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Secondary: book a call (embed loads on click only) ──────────────── */}
      <ScrollReveal animation="fade-up">
        <section id="book-consultation" className="py-16 border-t border-surface-800/50 scroll-mt-24">
          <div className="section-container">
            <div className="max-w-2xl mx-auto text-center space-y-5">
              <h2 className="text-2xl font-bold text-white">
                Rather Just Grab a Time? <span className="gradient-text">Book 15 Minutes</span>
              </h2>
              <p className="text-surface-400">
                Same review, on your calendar. Free and no obligation.
              </p>
              <DeferredCalBooking
                calLink="eric-tomchik-tayrwz/15min"
                label="Show available times"
              />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Referral program (moved here from the retired /clover page) ─────── */}
      <ScrollReveal animation="fade-up">
        <section
          id="referral-program"
          className="py-16 border-t border-surface-800/50 scroll-mt-24"
        >
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-green-400 mb-4">
                  <Gift className="w-3.5 h-3.5" />
                  Not a business owner? Still worth your time.
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Earn Up to <span className="gradient-text">$300 Per Referral</span>
                </h2>
                <p className="text-surface-400">
                  Know an owner who is tired of processing fees? Send them over. Eric does all the
                  follow-up, and you earn a referral fee for every account that qualifies and signs
                  up.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                <div className="card p-6 border-green-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-600/10 border border-green-600/20 flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-green-400 font-semibold">Qualified Referral</div>
                      <div className="text-2xl font-extrabold text-white">$100 — $300</div>
                    </div>
                  </div>
                  <p className="text-sm text-surface-400 leading-relaxed">
                    For any account that qualifies and signs up with the Clover Cash Discount
                    Program via Charity Swipes. Amount depends on qualification and equipment type.
                  </p>
                </div>
                <div className="card p-6 border-yellow-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center">
                      <Handshake className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-sm text-yellow-400 font-semibold">Partial Qualification</div>
                      <div className="text-2xl font-extrabold text-white">$50 — $150</div>
                    </div>
                  </div>
                  <p className="text-sm text-surface-400 leading-relaxed">
                    Accounts that sign up but do not fully qualify receive 50% of the standard
                    referral fee, based on qualification and equipment acquired.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 mb-10">
                {referralSteps.map((item) => (
                  <div key={item.step} className="card p-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center mx-auto mb-4">
                      <span className="text-brand-400 font-bold">{item.step}</span>
                    </div>
                    <item.icon className="w-6 h-6 text-brand-400 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-surface-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="card p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white mb-2 text-center">Submit a Referral</h3>
                <p className="text-sm text-surface-400 text-center mb-8">
                  Please get the owner&apos;s permission before sharing their details. Referral fees
                  are paid once the account signs up.
                </p>
                <ReferralForm />
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Contact / trust close ─────────────────────────────────────────── */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-2xl font-bold text-white">Questions Before You Send Anything?</h2>
              <p className="text-surface-300 leading-relaxed">
                Call or text me directly. I&apos;m happy to explain how the Cash Discount Program
                works, what Clover equipment runs, or how the giving model is structured — before you
                share a single document.
              </p>

              <div className="card p-8 space-y-4">
                <div className="text-lg font-bold text-white">Eric Tomchik</div>
                <div className="text-sm text-brand-400">
                  Senior Account Executive — Charity Swipes
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <a
                    href="tel:2283445724"
                    className="flex items-center gap-2 text-surface-300 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4 text-brand-400" />
                    (228) 344-5724
                  </a>
                  <a
                    href="mailto:eric@charityswipes.com"
                    className="flex items-center gap-2 text-surface-300 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4 text-brand-400" />
                    eric@charityswipes.com
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <a href="#analysis" className="btn-primary py-3.5 px-8">
                  Get My Free Processing Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm">
                <a href="#how-it-works" className="text-brand-400 hover:text-brand-300">
                  How the Cash Discount Program works
                </a>
                <a
                  href="https://charityswipes.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:text-brand-300"
                >
                  Visit Charity Swipes
                </a>
              </div>

              <p className="text-xs text-surface-500 pt-2">
                Charity Swipes is an authorized dealer of{' '}
                <a
                  href="https://www.clover.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:text-brand-300"
                >
                  Clover
                </a>
                , the world&apos;s leading all-in-one point-of-sale system. Estimates shown on this
                page are illustrative and not a guarantee of savings.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
