import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeDollarSign,
  Building2,
  CheckCircle,
  CreditCard,
  DollarSign,
  Fuel,
  Headphones,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  Phone,
  Scissors,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Wrench,
  Zap,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: "Clover's Cash Discount Program — Eliminate Credit Card Processing Fees",
  description:
    'Stop paying 2–4% on every credit card transaction. Charity Swipes helps small businesses eliminate processing fees with Clover\'s Cash Discount Program. Free consultation available.',
  openGraph: {
    title: "Clover's Cash Discount Program — Charity Swipes",
    description:
      'Eliminate credit card processing fees for your business. $100 in sales = $100 in your bank account.',
    url: 'https://erictomchik.com/clover',
    images: [{ url: '/og-image.webp', width: 1200, height: 630, alt: "Clover's Cash Discount Program" }],
  },
  alternates: {
    canonical: 'https://erictomchik.com/clover',
  },
};

const benefits = [
  {
    icon: DollarSign,
    title: 'Zero Processing Fees',
    description: '$100 in sales = $100 in your bank account. Stop handing 2–4% of every transaction to processing companies.',
  },
  {
    icon: Zap,
    title: 'Fast Funding',
    description: 'Your money hits your bank account fast — no more waiting days for your deposits to clear.',
  },
  {
    icon: Headphones,
    title: '24/7/365 Support',
    description: 'Help whenever you need it — day or night, weekday or holiday. Real support, real people.',
  },
  {
    icon: LayoutDashboard,
    title: 'Cloud-Based Dashboard',
    description: 'Monitor sales, inventory, and employees from anywhere — your phone, tablet, or computer.',
  },
  {
    icon: Store,
    title: '300–400+ Clover Apps',
    description: 'Online ordering, loyalty programs, gift cards, and more — all from the Clover App Store.',
  },
  {
    icon: Smartphone,
    title: 'Newest Clover Technology',
    description: 'Tap-to-pay, print/email/text receipts, barcode scanning, WiFi or 5G connectivity.',
  },
];

const packages = [
  {
    name: 'Keep-It-Simple',
    price: '$149',
    period: '/mo',
    features: [
      '6" touchscreen terminal',
      'Tap-to-pay',
      'Print/email/text receipts',
      'Access to Clover App Store',
    ],
    accent: false,
  },
  {
    name: 'Professional',
    price: '$199',
    period: '/mo',
    features: [
      '8" touchscreen terminal',
      'Loyalty programs',
      'Gift card management',
      'Inventory management',
      'All Keep-It-Simple features',
    ],
    accent: true,
  },
  {
    name: 'Full Service',
    price: '$349',
    period: '/mo',
    features: [
      '14" touchscreen + 8" customer display',
      'Full inventory & employee management',
      'Online ordering integration',
      'Damage & theft insurance',
      'All Professional features',
    ],
    accent: false,
  },
];

const serviceIndustries = [
  { icon: Scissors, label: 'Salons & Barber Shops' },
  { icon: Wrench, label: 'Auto Repair & Mechanics' },
  { icon: Building2, label: 'Medical & Dental Offices' },
  { icon: Sparkles, label: 'Cleaning Services' },
  { icon: Store, label: 'Restaurants & Cafés' },
  { icon: BadgeDollarSign, label: 'Professional Services' },
];

const customerReviews = [
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

export default function CloverPage() {
  return (
    <div className="py-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />

        <div className="section-container relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400">
              <ShieldCheck className="w-4 h-4" />
              Charity Swipes — Authorized Clover Dealer
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Stop Paying{' '}
              <span className="gradient-text">Processing Fees</span>
            </h1>

            <p className="text-lg sm:text-xl text-surface-300 leading-relaxed max-w-2xl mx-auto">
              Clover&apos;s Cash Discount Program lets your business keep 100% of every
              sale. No processing fees. No transaction fees. No hidden fees.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/contact?service=clover" className="btn-primary text-lg py-4 px-8">
                <Phone className="w-5 h-5 mr-2" />
                Schedule a Free Consultation
              </Link>
              <a href="#how-it-works" className="btn-secondary text-lg py-4 px-8">
                Learn How It Works
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>

            {/* Google Rating Badge */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < 5 ? 'text-yellow-400 fill-yellow-400' : 'text-surface-600'}`}
                  />
                ))}
              </div>
              <span className="text-white font-bold text-lg">4.8</span>
              <span className="text-surface-400 text-sm">stars on Google</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-red-400 mb-4">
                <CreditCard className="w-3.5 h-3.5" />
                The Problem Every Business Faces
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Credit Card Fees Are <span className="text-red-400">Eating Your Profits</span>
              </h2>
              <div className="card p-8 space-y-4 text-surface-300 leading-relaxed">
                <p>
                  If you&apos;re like most businesses, you&apos;re currently paying somewhere between{' '}
                  <span className="text-white font-semibold">2% and 4%</span> on every single credit
                  card transaction. That means for every $100 in card sales, you may only be depositing
                  $96 to $98 into your bank account.
                </p>
                <p>
                  Over the course of a month — and especially over a year — those fees quietly eat into
                  your margins. For a busy business, that can easily add up to{' '}
                  <span className="text-white font-semibold">thousands of dollars a year</span> just
                  handed over to processing companies.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 pt-4">
                  {[
                    { amount: '$10,000', fee: '$200–$400', label: 'Monthly sales' },
                    { amount: '$25,000', fee: '$500–$1,000', label: 'Monthly sales' },
                    { amount: '$50,000', fee: '$1,000–$2,000', label: 'Monthly sales' },
                  ].map((item) => (
                    <div key={item.amount} className="text-center p-4 rounded-lg bg-surface-800/40 border border-surface-700/50">
                      <div className="text-lg font-bold text-white">{item.amount}</div>
                      <div className="text-xs text-surface-400">{item.label}</div>
                      <div className="text-red-400 font-semibold mt-2">{item.fee}/mo in fees</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* How It Works — Gas Station Analogy */}
      <ScrollReveal animation="fade-up">
        <section id="how-it-works" className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-brand-400 mb-4">
                <Fuel className="w-3.5 h-3.5" />
                Think of It Like a Gas Station
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">
                How the <span className="gradient-text">Cash Discount Program</span> Works
              </h2>
              <div className="card p-8 space-y-4 text-surface-300 leading-relaxed">
                <p>
                  You&apos;ve probably noticed that gas stations have been doing something clever for
                  years: they post <span className="text-white font-semibold">two prices</span> — a
                  cash price and a credit price. Pay cash and you pay the listed price. Choose the
                  convenience of a card and a small fee is added. Nobody blinks an eye at the pump —
                  it&apos;s transparent, simple, and{' '}
                  <span className="text-white font-semibold">completely legal in all 50 states</span>.
                </p>
                <p>
                  Clover&apos;s Cash Discount Program works the exact same way for your business.
                  Your{' '}
                  <span className="text-white font-semibold">listed prices are the cash prices</span>.
                  When a customer chooses the convenience of paying with a credit card, a small
                  transaction fee is automatically added at checkout. Cash customers simply pay the
                  listed price — no fee at all. Either way,{' '}
                  <span className="text-white font-semibold">you keep 100% of your listed price</span>{' '}
                  on every single sale.
                </p>
                <p>
                  The Clover system handles all of this automatically at the register — no manual
                  calculations, no awkward conversations.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div className="p-6 rounded-lg bg-red-900/10 border border-red-500/20 text-center">
                    <div className="text-sm text-red-400 font-semibold mb-2">Standard Processing</div>
                    <div className="text-2xl font-bold text-white">$100 sale</div>
                    <div className="text-red-400 mt-1">→ $96–$98 deposited</div>
                    <div className="text-xs text-surface-400 mt-2">You absorb $2–$4 in fees every transaction</div>
                  </div>
                  <div className="p-6 rounded-lg bg-green-900/10 border border-green-500/20 text-center">
                    <div className="text-sm text-green-400 font-semibold mb-2">Cash Discount Program</div>
                    <div className="text-2xl font-bold text-white">$100 listed price</div>
                    <div className="text-green-400 mt-1">→ $100 deposited</div>
                    <div className="text-xs text-surface-400 mt-2">Card fee paid by customer, not you</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Benefits */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Why Switch to the <span className="gradient-text">Cash Discount Program</span>?
              </h2>
              <p className="text-surface-400 max-w-xl mx-auto">
                Beyond eliminating fees, Clover gives you a full business management platform.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map((item) => (
                <div key={item.title} className="card p-6 group">
                  <div className="w-12 h-12 rounded-lg bg-brand-600/10 border border-brand-600/20
                                  flex items-center justify-center mb-4
                                  group-hover:bg-brand-600/20 transition-colors">
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

      {/* Service Industries */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Perfect for <span className="gradient-text">Service-Based Businesses</span>
              </h2>
              <p className="text-surface-400">
                The Cash Discount Program is especially beneficial for service-related industries
                where margins matter most. If you accept credit cards, you can benefit.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {serviceIndustries.map((item) => (
                <div key={item.label} className="card p-5 flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-brand-600/10 border border-brand-600/20
                                  flex items-center justify-center flex-shrink-0
                                  group-hover:bg-brand-600/20 transition-colors">
                    <item.icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Customer Reviews */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-yellow-400 mb-4">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                4.8-Star Google Rating
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Trusted by <span className="gradient-text">Business Owners</span>
              </h2>
              <p className="text-surface-400 max-w-xl mx-auto">
                See what our clients have to say about Charity Swipes.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {customerReviews.map((review) => (
                <div key={review.name} className="card p-8 relative">
                  <MessageSquareQuote className="w-10 h-10 text-brand-600/20 absolute top-6 right-6" />
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-surface-600'
                        }`}
                      />
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

      {/* Pricing Packages */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Flexible <span className="gradient-text">Packages</span> to Fit Your Needs
              </h2>
              <p className="text-surface-400 max-w-xl mx-auto">
                Three packages tailored to different business sizes — all include zero processing fees.
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
                  <div className="flex items-baseline gap-1 mt-3 mb-6">
                    <span className="text-3xl font-extrabold text-white">{pkg.price}</span>
                    <span className="text-surface-400">{pkg.period}</span>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-surface-300">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact?service=clover"
                    className={`mt-6 text-center py-3 rounded-lg font-medium transition-all ${
                      pkg.accent
                        ? 'btn-primary w-full'
                        : 'btn-secondary w-full'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA / Contact */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Ready to Keep More of What You Earn?
              </h2>
              <p className="text-surface-300 leading-relaxed">
                I&apos;d love to sit down — in person or over the phone — and show you exactly how much
                your business could save by switching to the Cash Discount Program. There&apos;s no
                obligation, and I think you&apos;ll be surprised at how much of your hard-earned revenue
                you can keep.
              </p>

              <div className="card p-8 space-y-4">
                <div className="text-lg font-bold text-white">Eric Tomchik</div>
                <div className="text-sm text-brand-400">
                  Senior Account Executive — Charity Swipes
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <a
                    href="mailto:eric@charityswipes.com"
                    className="flex items-center gap-2 text-surface-300 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4 text-brand-400" />
                    eric@charityswipes.com
                  </a>
                  <a
                    href="tel:2283445724"
                    className="flex items-center gap-2 text-surface-300 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4 text-brand-400" />
                    (228) 344-5724
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link href="/contact?service=clover" className="btn-primary">
                  <Mail className="w-4 h-4 mr-2" />
                  Schedule a Free Consultation
                </Link>
                <a
                  href="https://charityswipes.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Visit Charity Swipes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>

              <p className="text-xs text-surface-500 pt-4">
                Charity Swipes is an authorized dealer of{' '}
                <a
                  href="https://www.clover.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:text-brand-300"
                >
                  Clover
                </a>
                , the world&apos;s leading all-in-one point-of-sale system.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
