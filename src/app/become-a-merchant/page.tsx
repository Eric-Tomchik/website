import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CalBooking from '@/components/CalBooking';
import MerchantSignupForm from '@/components/MerchantSignupForm';
import {
  ArrowRight,
  BadgeDollarSign,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  Handshake,
  Heart,
  LayoutDashboard,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Zap,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Become a Charity Swipes Merchant Partner — Free Clover POS + Cash Discount Program',
  description:
    'Sign up as a Charity Swipes merchant and get Clover POS equipment with the Cash Discount Program — eliminate processing fees while every swipe supports charity. Free 15-minute consultation.',
  openGraph: {
    title: 'Become a Charity Swipes Merchant Partner',
    description:
      'Eliminate processing fees with Clover\'s Cash Discount Program and support charity with every swipe. Apply free in minutes.',
    url: 'https://erictomchik.com/become-a-merchant',
    images: [{ url: '/og-image.webp', width: 1200, height: 630, alt: 'Become a Charity Swipes Merchant Partner' }],
  },
  alternates: {
    canonical: 'https://erictomchik.com/become-a-merchant',
  },
};

const steps = [
  {
    step: '1',
    icon: ClipboardCheck,
    title: 'Apply in Minutes',
    desc: 'Fill out the short application below with a few basic details about your business.',
  },
  {
    step: '2',
    icon: Phone,
    title: 'Free 15-Minute Consultation',
    desc: 'Eric walks you through your current processing costs and exactly how much the Cash Discount Program saves you.',
  },
  {
    step: '3',
    icon: Truck,
    title: 'Fast Equipment Setup',
    desc: 'Once approved, your Clover terminal ships and Charity Swipes helps you get it configured and live.',
  },
  {
    step: '4',
    icon: Heart,
    title: 'Start Swiping for Charity',
    desc: 'Keep 100% of every sale, and every transaction processed helps fund charitable giving in your community.',
  },
];

const perks = [
  {
    icon: DollarSign,
    title: 'Zero Processing Fees',
    description: 'Merchant partners keep 100% of every sale using Clover\'s Cash Discount Program.',
  },
  {
    icon: Heart,
    title: 'Give Back Automatically',
    description: 'Charity Swipes directs a portion of program proceeds to charitable causes — every swipe helps.',
  },
  {
    icon: Zap,
    title: 'Fast, Modern Clover Hardware',
    description: 'Tap-to-pay terminals, cloud dashboard, inventory, loyalty, and 300+ Clover apps.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dedicated Support',
    description: 'A real account executive (not a call center) who onboards you personally and stays reachable.',
  },
  {
    icon: ShieldCheck,
    title: 'Fully Compliant',
    description: 'Cash discount pricing is transparent, disclosed, and legal in all 50 states.',
  },
  {
    icon: BadgeDollarSign,
    title: 'No Long-Term Risk',
    description: 'Straightforward packages with no surprise contracts sprung on you after the fact.',
  },
];

export default function BecomeAMerchantPage() {
  return (
    <div className="py-16">
      {/* Hero */}
      <section className="relative overflow-hidden pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />

        <div className="section-container relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400">
              <Handshake className="w-4 h-4" />
              Become a Charity Swipes Merchant Partner
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Get Clover POS. <span className="gradient-text">Pay $0 in Fees.</span> Give Back
              Automatically.
            </h1>

            <p className="text-lg sm:text-xl text-surface-300 leading-relaxed max-w-2xl mx-auto">
              Sign up as a Charity Swipes merchant and put Clover&apos;s Cash Discount Program to
              work for your business — keep 100% of every sale, and every swipe helps fund
              charitable giving in your community.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <a href="#apply" className="btn-primary text-lg py-4 px-8">
                <ClipboardCheck className="w-5 h-5 mr-2" />
                Apply to Become a Merchant
              </a>
              <a href="#book-consultation" className="btn-secondary text-lg py-4 px-8">
                Book a Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-white font-bold text-lg">4.8</span>
              <span className="text-surface-400 text-sm">stars on Google</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why partner */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-red-400 mb-4">
                <CreditCard className="w-3.5 h-3.5" />
                Stop Losing 2–4% on Every Sale
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Why Businesses Are Switching to <span className="gradient-text">Charity Swipes</span>
              </h2>
              <p className="text-surface-400 max-w-2xl mx-auto">
                Most merchants hand thousands of dollars a year to processing companies. As a
                Charity Swipes merchant partner, you deploy Clover&apos;s Cash Discount Program so
                customers who pay by card cover the small transaction fee — you keep the full
                listed price on every sale, and a portion of program proceeds supports charity.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Perks */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {perks.map((item) => (
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

      {/* How it works */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                How to Become a <span className="gradient-text">Merchant Partner</span>
              </h2>
              <p className="text-surface-400">
                From application to your first swipe for charity — here&apos;s the whole process.
              </p>
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

      {/* Book a Free Consultation */}
      <ScrollReveal animation="fade-up">
        <section id="book-consultation" className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-brand-400 mb-4">
                <Phone className="w-3.5 h-3.5" />
                Free, No-Obligation, 15 Minutes
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Prefer to Talk It Through First? <span className="gradient-text">Book a Call</span>
              </h2>
              <p className="text-surface-400 max-w-xl mx-auto">
                Pick a time below and Eric will show you exactly how much your business could
                save — no pressure, no obligation.
              </p>
            </div>
            <div className="card p-2 sm:p-4 max-w-3xl mx-auto">
              <CalBooking calLink="eric-tomchik-tayrwz/15min" />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Application form */}
      <ScrollReveal animation="fade-up">
        <section id="apply" className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-green-400 mb-4">
                  <Store className="w-3.5 h-3.5" />
                  Merchant Application
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Apply to Become a <span className="gradient-text">Charity Swipes Merchant</span>
                </h2>
                <p className="text-surface-400 max-w-xl mx-auto">
                  Tell us a bit about your business and Eric will follow up within 24 hours to
                  confirm details and get your Clover equipment moving.
                </p>
              </div>
              <div className="card p-8">
                <MerchantSignupForm />
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA / Contact */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 border-t border-surface-800/50">
          <div className="section-container">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold text-white">Have Questions First?</h2>
              <p className="text-surface-300 leading-relaxed">
                Reach out directly — I&apos;m happy to answer questions about the Cash Discount
                Program, equipment options, or how the Charity Swipes giving model works before
                you apply.
              </p>

              <div className="card p-8 space-y-4">
                <div className="text-lg font-bold text-white">Eric Tomchik</div>
                <div className="text-sm text-brand-400">Senior Account Executive — Charity Swipes</div>
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

              <div className="pt-2">
                <Image
                  src="/images/charity-swipes-business-card.webp"
                  alt="Eric Tomchik — Senior Account Executive, Charity Swipes — Business Card"
                  width={1037}
                  height={1190}
                  className="mx-auto rounded-xl shadow-lg max-w-sm w-full"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link href="/clover" className="btn-secondary">
                  Learn About the Cash Discount Program
                  <ArrowRight className="w-4 h-4 ml-2" />
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
