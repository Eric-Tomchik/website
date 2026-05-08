import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  DollarSign,
  Scale,
  BarChart3,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'POS Systems Guide Resources — Pricing, Features & Legal Reference',
  description:
    'Live companion resources for "The Complete POS Systems Guide 2026" by Eric Tomchik. Side-by-side pricing for 9 platforms, feature comparison matrix, and 50-state surcharge/cash discount legal reference.',
  openGraph: {
    title: 'POS Systems Guide Resources — Eric Tomchik',
    description:
      'POS pricing comparison, feature matrix, and 50-state surcharge/cash discount legal reference.',
    url: 'https://erictomchik.com/resources/pos-guide',
    type: 'website',
  },
};

const LAST_UPDATED = 'May 2026';

/* ------------------------------------------------------------------ */
/*  DATA — POS Pricing Comparison                                      */
/* ------------------------------------------------------------------ */

interface POSPlatform {
  name: string;
  url: string;
  monthlyFee: string;
  inPersonRate: string;
  contract: string;
  freePlan: boolean;
  freePlanNote: string;
}

const posPlatforms: POSPlatform[] = [
  { name: 'Clover', url: 'clover.com', monthlyFee: '$0–$245/mo', inPersonRate: '2.3–2.6% + 10¢', contract: 'Month-to-month (direct)', freePlan: true, freePlanNote: 'Yes' },
  { name: 'Toast', url: 'toasttab.com', monthlyFee: '$0–$69+/mo', inPersonRate: '2.49–3.69% + 15¢', contract: '2-year required', freePlan: true, freePlanNote: 'Starter Kit' },
  { name: 'Square', url: 'squareup.com', monthlyFee: '$0–$149/mo', inPersonRate: '2.4–2.6% + 15¢', contract: 'Month-to-month', freePlan: true, freePlanNote: 'Yes' },
  { name: 'Shift4 (SkyTab)', url: 'shift4.com', monthlyFee: '$29.99–$69.99/mo', inPersonRate: 'Varies', contract: 'Multi-year typical', freePlan: false, freePlanNote: '—' },
  { name: 'Lightspeed', url: 'lightspeedhq.com', monthlyFee: '$69–$399/mo', inPersonRate: '2.6% + 10¢', contract: 'Annual preferred', freePlan: false, freePlanNote: '—' },
  { name: 'Shopify POS', url: 'shopify.com/pos', monthlyFee: '$39–$399+/mo', inPersonRate: '2.4–2.7%', contract: 'Month-to-month', freePlan: false, freePlanNote: '—' },
  { name: 'Revel', url: 'revelsystems.com', monthlyFee: '$99/terminal/mo', inPersonRate: 'Third-party negotiated', contract: '3-year typical', freePlan: false, freePlanNote: '—' },
  { name: 'TouchBistro', url: 'touchbistro.com', monthlyFee: '$69+/mo', inPersonRate: 'Quote-based', contract: 'Annual typical', freePlan: false, freePlanNote: '—' },
  { name: 'SpotOn', url: 'spoton.com', monthlyFee: '$0–$135/mo', inPersonRate: '1.99–2.89% + 25¢', contract: 'Month-to-month', freePlan: true, freePlanNote: 'Quick Start' },
];

/* ------------------------------------------------------------------ */
/*  DATA — Feature Comparison                                          */
/* ------------------------------------------------------------------ */

type FeatureLevel = 'full' | 'partial' | 'double' | 'none';

interface FeatureRow {
  feature: string;
  clover: FeatureLevel;
  toast: FeatureLevel;
  square: FeatureLevel;
  shift4: FeatureLevel;
  lightspeed: FeatureLevel;
  shopify: FeatureLevel;
  spoton: FeatureLevel;
}

const featureRows: FeatureRow[] = [
  { feature: 'Restaurant features', clover: 'full', toast: 'double', square: 'full', shift4: 'full', lightspeed: 'full', shopify: 'partial', spoton: 'full' },
  { feature: 'Retail features', clover: 'full', toast: 'none', square: 'full', shift4: 'partial', lightspeed: 'full', shopify: 'full', spoton: 'full' },
  { feature: 'E-commerce', clover: 'partial', toast: 'partial', square: 'full', shift4: 'partial', lightspeed: 'full', shopify: 'double', spoton: 'full' },
  { feature: 'Cash discount', clover: 'double', toast: 'none', square: 'partial', shift4: 'full', lightspeed: 'none', shopify: 'none', spoton: 'full' },
  { feature: '3rd-party processors', clover: 'full', toast: 'none', square: 'none', shift4: 'none', lightspeed: 'none', shopify: 'none', spoton: 'none' },
  { feature: 'Offline mode', clover: 'full', toast: 'full', square: 'full', shift4: 'partial', lightspeed: 'partial', shopify: 'partial', spoton: 'full' },
  { feature: 'App marketplace', clover: 'double', toast: 'full', square: 'full', shift4: 'partial', lightspeed: 'partial', shopify: 'full', spoton: 'partial' },
  { feature: 'Open API', clover: 'full', toast: 'full', square: 'full', shift4: 'partial', lightspeed: 'full', shopify: 'full', spoton: 'partial' },
  { feature: 'Multi-location', clover: 'full', toast: 'full', square: 'full', shift4: 'full', lightspeed: 'full', shopify: 'full', spoton: 'full' },
];

function FeatureIcon({ level }: { level: FeatureLevel }) {
  switch (level) {
    case 'double':
      return <span className="text-green-400 font-bold text-sm">✓✓</span>;
    case 'full':
      return <span className="text-green-400 font-semibold text-sm">✓</span>;
    case 'partial':
      return <span className="text-yellow-400 text-sm">⚠</span>;
    case 'none':
      return <span className="text-surface-600 text-sm">✗</span>;
  }
}

/* ------------------------------------------------------------------ */
/*  DATA — 50-State Legal Reference                                    */
/* ------------------------------------------------------------------ */

type SurchargeStatus = 'yes' | 'restricted' | 'no';

interface StateRow {
  state: string;
  surcharge: SurchargeStatus;
  cashDiscount: boolean;
  notes: string;
}

const stateData: StateRow[] = [
  { state: 'Alabama', surcharge: 'yes', cashDiscount: true, notes: 'No specific surcharge restrictions beyond card network rules' },
  { state: 'Alaska', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban; no state sales tax' },
  { state: 'Arizona', surcharge: 'yes', cashDiscount: true, notes: 'Surcharges permitted; must comply with Visa/MC rules (max 3%)' },
  { state: 'Arkansas', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'California', surcharge: 'restricted', cashDiscount: true, notes: 'SB 478 (July 2024): all-inclusive pricing required. Cash discount allowed if presented as total price' },
  { state: 'Colorado', surcharge: 'restricted', cashDiscount: true, notes: 'Surcharges allowed but capped at 2% (lower than card network max of 3%)' },
  { state: 'Connecticut', surcharge: 'yes', cashDiscount: true, notes: 'Surcharge ban repealed in 2024; surcharges now permitted with disclosure' },
  { state: 'Delaware', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban; no state sales tax' },
  { state: 'Florida', surcharge: 'yes', cashDiscount: true, notes: 'Surcharges permitted; signage/disclosure requirements apply' },
  { state: 'Georgia', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Hawaii', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban' },
  { state: 'Idaho', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Illinois', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban; Chicago has local rules — verify' },
  { state: 'Indiana', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Iowa', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Kansas', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban' },
  { state: 'Kentucky', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Louisiana', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Maine', surcharge: 'yes', cashDiscount: true, notes: 'Surcharges permitted with disclosure requirements' },
  { state: 'Maryland', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Massachusetts', surcharge: 'no', cashDiscount: true, notes: 'Surcharges prohibited by state law — cash discounts are the legal alternative' },
  { state: 'Michigan', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Minnesota', surcharge: 'yes', cashDiscount: true, notes: 'Surcharges permitted with clear disclosure' },
  { state: 'Mississippi', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Missouri', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban' },
  { state: 'Montana', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban; no state sales tax' },
  { state: 'Nebraska', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Nevada', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'New Hampshire', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban; no state sales tax' },
  { state: 'New Jersey', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'New Mexico', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban' },
  { state: 'New York', surcharge: 'restricted', cashDiscount: true, notes: 'Surcharges allowed only if dual pricing is displayed (both prices shown). Must comply with state transparency rules' },
  { state: 'North Carolina', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'North Dakota', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban' },
  { state: 'Ohio', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Oklahoma', surcharge: 'yes', cashDiscount: true, notes: 'Surcharges permitted; recent legislative updates — verify current status' },
  { state: 'Oregon', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban; no state sales tax' },
  { state: 'Pennsylvania', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Rhode Island', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'South Carolina', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban' },
  { state: 'South Dakota', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban' },
  { state: 'Tennessee', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Texas', surcharge: 'yes', cashDiscount: true, notes: 'Surcharges permitted; signage requirements apply' },
  { state: 'Utah', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Vermont', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Virginia', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Washington', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban' },
  { state: 'Washington, D.C.', surcharge: 'yes', cashDiscount: true, notes: 'No surcharge prohibition' },
  { state: 'West Virginia', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
  { state: 'Wisconsin', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge ban' },
  { state: 'Wyoming', surcharge: 'yes', cashDiscount: true, notes: 'No state surcharge prohibition' },
];

function SurchargeLabel({ status }: { status: SurchargeStatus }) {
  switch (status) {
    case 'yes':
      return <span className="text-green-400 text-xs font-semibold">✓ Yes</span>;
    case 'restricted':
      return <span className="text-yellow-400 text-xs font-semibold">⚠ Restricted</span>;
    case 'no':
      return <span className="text-red-400 text-xs font-semibold">✗ No</span>;
  }
}

/* ------------------------------------------------------------------ */
/*  HELPER COMPONENTS                                                  */
/* ------------------------------------------------------------------ */

function SectionHeader({
  icon: Icon,
  title,
  description,
  id,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-amber-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h2>
      </div>
      <p className="text-surface-300 max-w-3xl">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function POSGuideResourcesPage() {
  return (
    <div className="py-16">
      <div className="section-container space-y-20">
        {/* Hero */}
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <BookOpen className="w-4 h-4" />
            <Link href="/resources" className="hover:text-brand-400 transition-colors">
              Book Resources
            </Link>
            <span>/</span>
            <span>POS Systems Guide</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="gradient-text">POS Systems Guide</span>
            <br />
            <span className="text-white text-2xl sm:text-3xl mt-2 block">2026 Companion Resources</span>
          </h1>
          <p className="text-lg text-surface-300 leading-relaxed">
            POS platforms change pricing, update processing rates, and modify contract
            terms regularly. State surcharge laws evolve too. This companion page keeps the
            comparison tables and legal reference from the book accurate and up-to-date.
          </p>
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Last verified: {LAST_UPDATED}</span>
          </div>
        </div>

        {/* Quick Nav */}
        <nav className="card p-6 space-y-4" aria-label="Page sections">
          <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">Jump to Section</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: 'pricing', label: 'Pricing Comparison', icon: DollarSign },
              { id: 'features', label: 'Feature Matrix', icon: BarChart3 },
              { id: 'legal', label: '50-State Legal Reference', icon: Scale },
              { id: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50 hover:border-surface-600 transition-all group"
              >
                <item.icon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-surface-200 group-hover:text-white transition-colors">{item.label}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* Section 1: Pricing Comparison */}
        <section className="space-y-8">
          <SectionHeader
            icon={DollarSign}
            title="POS Pricing Comparison"
            description="Side-by-side pricing for all 9 platforms reviewed in the book — monthly fees, in-person processing rates, contract terms, and free plan availability."
            id="pricing"
          />

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[850px]">
                <thead>
                  <tr className="border-b border-surface-700 bg-surface-900/40">
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Platform</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Monthly Fee</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">In-Person Rate</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Contract</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs text-center">Free Plan?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800">
                  {posPlatforms.map((p) => (
                    <tr key={p.name} className="hover:bg-surface-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <a
                          href={`https://${p.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-medium hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
                        >
                          {p.name}
                          <ExternalLink className="w-3 h-3 text-surface-500" />
                        </a>
                      </td>
                      <td className="py-3 px-4 text-surface-300 font-mono text-xs">{p.monthlyFee}</td>
                      <td className="py-3 px-4 text-surface-300 font-mono text-xs">{p.inPersonRate}</td>
                      <td className="py-3 px-4 text-surface-300">{p.contract}</td>
                      <td className="py-3 px-4 text-center">
                        {p.freePlan ? (
                          <span className="text-green-400 text-xs font-semibold">{p.freePlanNote}</span>
                        ) : (
                          <span className="text-surface-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key insight */}
          <div className="card p-5 border-amber-500/20 bg-amber-500/5">
            <p className="text-sm text-surface-300">
              <strong className="text-white">Key insight from the book:</strong> The cheapest monthly fee
              doesn&apos;t always mean the lowest total cost. Processing rates, contract terms, and
              hardware requirements matter more for most businesses. Chapter 23 covers total cost
              of ownership in detail.
            </p>
          </div>
        </section>

        {/* Section 2: Feature Matrix */}
        <section className="space-y-8">
          <SectionHeader
            icon={BarChart3}
            title="Feature Comparison Matrix"
            description="Feature-by-feature comparison across the 7 most commonly compared platforms. ✓✓ = industry-leading, ✓ = supported, ⚠ = partial/limited, ✗ = not available."
            id="features"
          />

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-surface-700 bg-surface-900/40">
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Feature</th>
                    <th className="py-3 px-3 text-surface-400 font-semibold uppercase tracking-wider text-xs text-center">Clover</th>
                    <th className="py-3 px-3 text-surface-400 font-semibold uppercase tracking-wider text-xs text-center">Toast</th>
                    <th className="py-3 px-3 text-surface-400 font-semibold uppercase tracking-wider text-xs text-center">Square</th>
                    <th className="py-3 px-3 text-surface-400 font-semibold uppercase tracking-wider text-xs text-center">Shift4</th>
                    <th className="py-3 px-3 text-surface-400 font-semibold uppercase tracking-wider text-xs text-center">Lightspeed</th>
                    <th className="py-3 px-3 text-surface-400 font-semibold uppercase tracking-wider text-xs text-center">Shopify</th>
                    <th className="py-3 px-3 text-surface-400 font-semibold uppercase tracking-wider text-xs text-center">SpotOn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800">
                  {featureRows.map((row) => (
                    <tr key={row.feature} className="hover:bg-surface-800/40 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{row.feature}</td>
                      <td className="py-3 px-3 text-center"><FeatureIcon level={row.clover} /></td>
                      <td className="py-3 px-3 text-center"><FeatureIcon level={row.toast} /></td>
                      <td className="py-3 px-3 text-center"><FeatureIcon level={row.square} /></td>
                      <td className="py-3 px-3 text-center"><FeatureIcon level={row.shift4} /></td>
                      <td className="py-3 px-3 text-center"><FeatureIcon level={row.lightspeed} /></td>
                      <td className="py-3 px-3 text-center"><FeatureIcon level={row.shopify} /></td>
                      <td className="py-3 px-3 text-center"><FeatureIcon level={row.spoton} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-surface-400">
            <span><span className="text-green-400 font-bold">✓✓</span> = Industry-leading</span>
            <span><span className="text-green-400 font-semibold">✓</span> = Supported</span>
            <span><span className="text-yellow-400">⚠</span> = Partial / Limited</span>
            <span><span className="text-surface-600">✗</span> = Not available</span>
          </div>
        </section>

        {/* Section 3: 50-State Legal Reference */}
        <section className="space-y-8">
          <SectionHeader
            icon={Scale}
            title="50-State Surcharge & Cash Discount Legal Reference"
            description="Surcharge and cash discount legality varies by state. Cash discounts are legal in all 50 states — surcharges have restrictions in some. Always consult a licensed attorney before implementing."
            id="legal"
          />

          {/* Key distinction callout */}
          <div className="card p-5 border-amber-500/20 bg-amber-500/5">
            <div className="space-y-2">
              <p className="text-sm text-white font-semibold">Cash Discount vs. Surcharge — The Key Distinction</p>
              <p className="text-sm text-surface-300">
                <strong className="text-green-400">Cash discounts</strong> (offering a lower price for cash) are
                legal in <em>all 50 states</em>. <strong className="text-yellow-400">Surcharges</strong> (adding
                a fee for card use) are banned or restricted in some states. This is why the book recommends
                dual pricing / cash discount over surcharging — same financial result, no legal risk.
              </p>
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[650px]">
                <thead>
                  <tr className="border-b border-surface-700 bg-surface-900/40">
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">State</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Surcharge Allowed?</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Cash Discount?</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Key Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800">
                  {stateData.map((row) => (
                    <tr key={row.state} className="hover:bg-surface-800/40 transition-colors">
                      <td className="py-2.5 px-4 text-white font-medium text-xs">{row.state}</td>
                      <td className="py-2.5 px-4"><SurchargeLabel status={row.surcharge} /></td>
                      <td className="py-2.5 px-4"><span className="text-green-400 text-xs font-semibold">✓ Yes</span></td>
                      <td className="py-2.5 px-4 text-surface-400 text-xs">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section id="disclaimer" className="scroll-mt-24">
          <div className="card p-6 border-yellow-500/20 bg-yellow-500/5">
            <div className="flex gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white">Important Disclaimer</h2>
                <div className="text-sm text-surface-300 space-y-2">
                  <p>
                    POS platform pricing, processing rates, features, and contract terms are subject to
                    change without notice. Prices shown were verified as of {LAST_UPDATED}. Always
                    confirm current pricing directly with the platform before signing any agreement.
                  </p>
                  <p>
                    State surcharge and cash discount laws change frequently. This table provides
                    general guidance based on publicly available legal information as of early 2026.
                    <strong className="text-white"> This is not legal advice.</strong> Always consult a licensed
                    attorney in your state before implementing surcharge or dual pricing programs.
                    Penalties for non-compliance can include fines, lawsuits, and card network violations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-extrabold text-white">
            Need help choosing the right POS?
          </h2>
          <p className="text-surface-300 max-w-xl mx-auto">
            This page covers the comparison data. The book covers the full decision
            framework — platform deep-dives, hardware evaluations, migration planning,
            negotiation strategies, and the decision flowcharts that guide you to the right choice.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/books" className="btn-primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Get the Book
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/resources" className="btn-secondary">
              ← All Book Resources
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
