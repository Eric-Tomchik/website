import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  ExternalLink,
  Building2,
  CreditCard,
  Landmark,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Search,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Book Resources — Credit Without a Credit Score',
  description:
    'Companion resources for "Credit Without a Credit Score" by Eric Tomchik. Net-30 vendor directory, EIN-only credit cards, business credit score ranges, and government resources — updated and free to access.',
  openGraph: {
    title: 'Book Resources — Credit Without a Credit Score',
    description:
      'Free companion resources: Net-30 vendor directory, EIN-only credit cards, score ranges, and government resources.',
    url: 'https://erictomchik.com/resources/credit-score',
    type: 'website',
  },
  alternates: {
    canonical: 'https://erictomchik.com/resources/credit-score',
  },
};

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const LAST_UPDATED = 'May 2026';

interface Vendor {
  name: string;
  products: string;
  fee: string;
  approval: string;
}

const vendorsAllThree: Vendor[] = [
  { name: 'Crown Office Supplies', products: 'Office supplies, electronics', fee: '$99/yr', approval: 'Easy; no personal check' },
  { name: 'Creative Analytics', products: 'Digital marketing services', fee: '$79/yr', approval: 'Easy; no personal check' },
  { name: 'Shirtsy', products: 'Custom apparel, merchandise', fee: '$99/yr', approval: 'Easy; no personal check' },
  { name: 'The CEO Creative', products: 'Marketing materials, branding', fee: '$79/yr', approval: 'Easy; no personal check' },
  { name: 'Amazon Business (Pay by Invoice)', products: 'All product categories', fee: 'None', approval: 'Moderate; EIN + bank eval' },
  { name: 'HD Supply', products: 'MRO, facilities maintenance', fee: 'None', approval: 'Moderate; credit review' },
  { name: 'Home Depot Commercial', products: 'Building materials, tools', fee: 'None', approval: 'Moderate; business credit eval' },
];

const vendorsDnbExperian: Vendor[] = [
  { name: 'Uline', products: 'Shipping, packaging, industrial', fee: 'None', approval: 'Easy' },
  { name: 'Quill', products: 'Office supplies, cleaning, breakroom', fee: 'None', approval: 'Easy' },
  { name: 'Newegg Business', products: 'Electronics, IT hardware', fee: 'None', approval: 'Moderate' },
  { name: 'NAMYNOT', products: 'SEO, digital marketing', fee: 'None', approval: 'Easy' },
];

const vendorsDnbOnly: Vendor[] = [
  { name: 'Grainger', products: 'Industrial equipment, MRO', fee: 'None', approval: 'Moderate' },
  { name: 'Staples Business Advantage', products: 'Office supplies, technology', fee: 'None', approval: 'Easy' },
  { name: 'Office Depot / OfficeMax', products: 'Office supplies, furniture', fee: 'None', approval: 'Easy' },
  { name: 'Walmart Community Card', products: 'Wholesale products', fee: 'None', approval: 'Moderate' },
];

const vendorsExperianEquifax: Vendor[] = [
  { name: 'Wise Business Plans', products: 'Business plans, formation', fee: '$99/yr', approval: 'Easy; $164 min purchase' },
  { name: 'Growegy', products: 'Software, marketing tools', fee: '$55/mo', approval: 'Easy; subscription-based' },
];

interface CreditCard {
  name: string;
  fee: string;
  pg: string;
  personalCheck: string;
  requirements: string;
  rewards: string;
}

const einCreditCards: CreditCard[] = [
  { name: 'Ramp', fee: '$0', pg: 'No', personalCheck: 'No', requirements: '$25K+ U.S. bank balance', rewards: '1.5% cashback' },
  { name: 'Brex', fee: '$0', pg: 'No', personalCheck: 'No', requirements: 'Strong financials; $100K+ ideal', rewards: 'Points program' },
  { name: 'BILL Divvy', fee: '$0', pg: 'No', personalCheck: 'No', requirements: '$20K+ cash; charge card', rewards: 'Points' },
  { name: 'Nav Prime', fee: '$49.99/mo', pg: 'No', personalCheck: 'No', requirements: 'Nav subscription; no min revenue', rewards: 'Credit building' },
  { name: 'Coast Fleet Card', fee: '$0', pg: 'No', personalCheck: 'No', requirements: 'Active business; EIN', rewards: 'Fuel rebates' },
  { name: 'Stripe Corporate Card', fee: '$0', pg: 'No', personalCheck: 'No', requirements: 'Active Stripe processing', rewards: 'Cashback' },
  { name: 'Capital on Tap', fee: '$0', pg: 'Varies', personalCheck: 'Varies', requirements: '$2.5K/mo revenue; 6+ months', rewards: 'Cashback' },
  { name: 'Mercury IO', fee: '$0', pg: 'No', personalCheck: 'No', requirements: '$25K avg Mercury balance', rewards: 'Cashback' },
];

interface ScoreRange {
  score: string;
  range: string;
  good: string;
  measures: string;
}

const dnbScores: ScoreRange[] = [
  { score: 'PAYDEX', range: '1–100', good: '80+', measures: 'Payment speed; dollar-weighted. 80 = on time, 90 = 20 days early, 100 = 30+ days early' },
  { score: 'Delinquency Predictor', range: 'Class 1–5', good: '1–2', measures: 'Likelihood of late payments or bankruptcy within 12 months' },
  { score: 'Failure Score', range: '1,001–1,875', good: '1,400+', measures: 'Likelihood of business failure within 12 months' },
];

const experianScores: ScoreRange[] = [
  { score: 'Intelliscore Plus V2', range: '1–100', good: '76+', measures: 'Overall credit risk; 800+ data points: payment history, utilization, public records' },
  { score: 'Intelliscore Plus V3', range: '300–850', good: '700+', measures: 'Same model as V2 on a consumer-like scale' },
  { score: 'Financial Stability Risk', range: '300–850', good: '700+', measures: 'Likelihood of financial distress within 12 months' },
];

const equifaxScores: ScoreRange[] = [
  { score: 'Credit Risk Score', range: '101–992', good: '700+', measures: 'Likelihood of 90+ day delinquency within 12 months' },
  { score: 'Payment Index', range: '0–100', good: '90+', measures: '12-month rolling payment performance' },
  { score: 'Business Failure Score', range: '1,000–1,880', good: '1,570+', measures: 'Likelihood of bankruptcy within 12 months' },
];

const ficoSbss: ScoreRange[] = [
  { score: 'FICO SBSS', range: '0–300', good: '165+', measures: 'Blended personal + business credit; used by SBA and bank lenders for pre-screening' },
];

interface GovResource {
  name: string;
  url: string;
  urlLabel: string;
  purpose: string;
}

const governmentResources: GovResource[] = [
  { name: 'IRS EIN Application', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online', urlLabel: 'irs.gov/ein', purpose: 'Apply for a free EIN online' },
  { name: 'IRS Form SS-4', url: 'https://www.irs.gov/forms-pubs/about-form-ss-4', urlLabel: 'irs.gov (Form SS-4)', purpose: 'Paper/fax EIN application' },
  { name: 'IRS Business Tax Line', url: 'tel:+18008294933', urlLabel: '(800) 829-4933', purpose: 'EIN verification, 147C letters' },
  { name: 'SBA.gov', url: 'https://www.sba.gov', urlLabel: 'sba.gov', purpose: 'Loan programs, resources, local offices' },
  { name: 'SBA Lender Match', url: 'https://www.sba.gov/funding-programs/loans/lender-match', urlLabel: 'sba.gov/lendermatch', purpose: 'Connect with SBA lenders' },
  { name: 'SAM.gov', url: 'https://sam.gov', urlLabel: 'sam.gov', purpose: 'Federal contractor registration' },
  { name: 'FTC Report Fraud', url: 'https://reportfraud.ftc.gov', urlLabel: 'ReportFraud.ftc.gov', purpose: 'Report credit repair scams' },
  { name: 'IdentityTheft.gov', url: 'https://identitytheft.gov', urlLabel: 'identitytheft.gov', purpose: 'Report identity theft' },
  { name: 'SCORE', url: 'https://www.score.org', urlLabel: 'score.org', purpose: 'Free business mentoring' },
  { name: 'SBDCs', url: 'https://americassbdc.org', urlLabel: 'americassbdc.org', purpose: 'Small Business Development Centers' },
];

interface Bureau {
  name: string;
  url: string;
  urlLabel: string;
  functions: string;
}

const creditBureaus: Bureau[] = [
  { name: 'Dun & Bradstreet', url: 'https://www.dnb.com', urlLabel: 'dnb.com', functions: 'D-U-N-S registration, CreditSignal, reports, disputes via D-U-N-S Manager' },
  { name: 'Experian Business', url: 'https://www.experian.com/business', urlLabel: 'experian.com/business', functions: 'Reports, disputes: (888) 211-0728 or BusinessCreditFacts.com' },
  { name: 'Equifax Business', url: 'https://www.equifax.com/business', urlLabel: 'equifax.com/business', functions: 'Reports (~$49.95), disputes via small business portal' },
];

interface MonitoringService {
  name: string;
  cost: string;
  features: string;
}

const monitoringServices: MonitoringService[] = [
  { name: 'D&B CreditSignal (Free)', cost: 'Free', features: 'Score change alerts, inquiry alerts (no actual score values)' },
  { name: 'D&B CreditSignal Plus', cost: '$39–$199/mo', features: 'Full PAYDEX, detailed reports, comprehensive monitoring' },
  { name: 'Nav Free', cost: 'Free', features: 'Multi-bureau summary scores, basic alerts' },
  { name: 'Nav Prime', cost: '$49.99/mo', features: 'Detailed multi-bureau monitoring + credit-building card' },
];

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
        <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-brand-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h2>
      </div>
      <p className="text-surface-300 max-w-3xl">{description}</p>
    </div>
  );
}

function VendorTable({ vendors, bureaus }: { vendors: Vendor[]; bureaus: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white">{bureaus}</h3>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-surface-700">
              <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Vendor</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Products / Services</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Fee</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Approval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {vendors.map((v) => (
              <tr key={v.name} className="hover:bg-surface-800/40 transition-colors">
                <td className="py-3 px-4 text-white font-medium">{v.name}</td>
                <td className="py-3 px-4 text-surface-300">{v.products}</td>
                <td className="py-3 px-4 text-surface-300">{v.fee}</td>
                <td className="py-3 px-4 text-surface-300">{v.approval}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreTable({ scores, bureau }: { scores: ScoreRange[]; bureau: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white">{bureau}</h3>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-surface-700">
              <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Score</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Range</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Good</th>
              <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">What It Measures</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {scores.map((s) => (
              <tr key={s.score} className="hover:bg-surface-800/40 transition-colors">
                <td className="py-3 px-4 text-white font-medium">{s.score}</td>
                <td className="py-3 px-4 text-surface-300 font-mono text-xs">{s.range}</td>
                <td className="py-3 px-4">
                  <span className="text-green-400 font-semibold">{s.good}</span>
                </td>
                <td className="py-3 px-4 text-surface-300">{s.measures}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function ResourcesPage() {
  return (
    <div className="py-16">
      <div className="section-container space-y-20">
        {/* ── Hero ─────────────────────────────────────── */}
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <BookOpen className="w-4 h-4" />
            <span>Companion Resource Page</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="gradient-text">Credit Without a Credit Score</span>
            <br />
            <span className="text-white text-2xl sm:text-3xl mt-2 block">Book Resources</span>
          </h1>
          <p className="text-lg text-surface-300 leading-relaxed">
            This is the free companion page referenced throughout the book. Vendor reporting
            relationships, card requirements, and bureau thresholds change — this page is updated
            whenever significant changes are confirmed so the book stays accurate long after the
            ink dries.
          </p>
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Last verified: {LAST_UPDATED}</span>
          </div>
        </div>

        {/* ── Quick Nav ────────────────────────────────── */}
        <nav className="card p-6 space-y-4" aria-label="Page sections">
          <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">Jump to Section</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: 'vendors', label: 'Net-30 Vendor Directory', icon: Building2 },
              { id: 'credit-cards', label: 'EIN-Only Credit Cards', icon: CreditCard },
              { id: 'score-ranges', label: 'Business Credit Score Ranges', icon: BarChart3 },
              { id: 'government', label: 'Government Resources', icon: Landmark },
              { id: 'bureaus', label: 'Credit Bureaus & Monitoring', icon: Search },
              { id: 'disclaimer', label: 'Important Disclaimer', icon: AlertTriangle },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50 hover:border-surface-600 transition-all group"
              >
                <item.icon className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span className="text-sm text-surface-200 group-hover:text-white transition-colors">{item.label}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* ── Section 1: Net-30 Vendor Directory ───────── */}
        <section className="space-y-10">
          <SectionHeader
            icon={Building2}
            title="Net-30 Vendor Directory"
            description="Vendors offering Net-30 terms with credit bureau reporting. These are organized by which bureaus they report to, giving you strategic control over your credit-building sequence."
            id="vendors"
          />

          <div className="space-y-10">
            <div className="card p-6">
              <VendorTable vendors={vendorsAllThree} bureaus="All Three Bureaus (D&B + Experian + Equifax)" />
            </div>
            <div className="card p-6">
              <VendorTable vendors={vendorsDnbExperian} bureaus="D&B and Experian" />
            </div>
            <div className="card p-6">
              <VendorTable vendors={vendorsDnbOnly} bureaus="D&B Only" />
            </div>
            <div className="card p-6">
              <VendorTable vendors={vendorsExperianEquifax} bureaus="Experian and Equifax" />
            </div>
          </div>
        </section>

        {/* ── Section 2: EIN-Only Credit Cards ─────────── */}
        <section className="space-y-8">
          <SectionHeader
            icon={CreditCard}
            title="EIN-Only Business Credit Cards"
            description="Business credit cards available without a personal credit check or personal guarantee. Compare fees, requirements, and rewards to find the right fit for your business stage."
            id="credit-cards"
          />

          <div className="card p-6">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-surface-700">
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Card</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Fee</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">PG?</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Personal Check?</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Key Requirements</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Rewards</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800">
                  {einCreditCards.map((card) => (
                    <tr key={card.name} className="hover:bg-surface-800/40 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{card.name}</td>
                      <td className="py-3 px-4 text-surface-300">{card.fee}</td>
                      <td className="py-3 px-4">
                        <span className={card.pg === 'No' ? 'text-green-400' : 'text-yellow-400'}>
                          {card.pg}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={card.personalCheck === 'No' ? 'text-green-400' : 'text-yellow-400'}>
                          {card.personalCheck}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-surface-300">{card.requirements}</td>
                      <td className="py-3 px-4 text-surface-300">{card.rewards}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Section 3: Business Credit Score Ranges ──── */}
        <section className="space-y-8">
          <SectionHeader
            icon={BarChart3}
            title="Business Credit Score Ranges"
            description="Complete reference for understanding and interpreting every major business credit score from all three bureaus and FICO SBSS."
            id="score-ranges"
          />

          <div className="space-y-8">
            <div className="card p-6">
              <ScoreTable scores={dnbScores} bureau="Dun & Bradstreet" />
            </div>
            <div className="card p-6">
              <ScoreTable scores={experianScores} bureau="Experian Business" />
            </div>
            <div className="card p-6">
              <ScoreTable scores={equifaxScores} bureau="Equifax Business" />
            </div>
            <div className="card p-6">
              <ScoreTable scores={ficoSbss} bureau="FICO SBSS" />
            </div>
          </div>
        </section>

        {/* ── Section 4: Government Resources ──────────── */}
        <section className="space-y-8">
          <SectionHeader
            icon={Landmark}
            title="Government Resources"
            description="Essential government, SBA, and regulatory resources for building and managing business credit."
            id="government"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            {governmentResources.map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-5 group hover:border-brand-600/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <h3 className="text-white font-semibold group-hover:text-brand-400 transition-colors">
                      {resource.name}
                    </h3>
                    <p className="text-sm text-surface-400">{resource.purpose}</p>
                    <p className="text-xs text-brand-400/70 font-mono">{resource.urlLabel}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-surface-500 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Section 5: Credit Bureaus & Monitoring ────── */}
        <section className="space-y-8">
          <SectionHeader
            icon={Search}
            title="Credit Bureaus & Monitoring"
            description="The three business credit bureaus and recommended monitoring services to track your progress."
            id="bureaus"
          />

          <div className="space-y-8">
            {/* Bureaus */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">Business Credit Bureaus</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {creditBureaus.map((bureau) => (
                  <a
                    key={bureau.name}
                    href={bureau.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card p-5 group hover:border-brand-600/40 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold group-hover:text-brand-400 transition-colors">
                          {bureau.name}
                        </h4>
                        <ExternalLink className="w-3.5 h-3.5 text-surface-500 group-hover:text-brand-400 transition-colors" />
                      </div>
                      <p className="text-sm text-surface-400">{bureau.functions}</p>
                      <p className="text-xs text-brand-400/70 font-mono">{bureau.urlLabel}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Monitoring */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">Monitoring Services</h3>
              <div className="card p-6">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="border-b border-surface-700">
                        <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Service</th>
                        <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Cost</th>
                        <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Features</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-800">
                      {monitoringServices.map((svc) => (
                        <tr key={svc.name} className="hover:bg-surface-800/40 transition-colors">
                          <td className="py-3 px-4 text-white font-medium">{svc.name}</td>
                          <td className="py-3 px-4 text-surface-300">{svc.cost}</td>
                          <td className="py-3 px-4 text-surface-300">{svc.features}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Disclaimer ───────────────────────────────── */}
        <section id="disclaimer" className="scroll-mt-24">
          <div className="card p-6 border-yellow-500/20 bg-yellow-500/5">
            <div className="flex gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white">Important Disclaimer</h2>
                <div className="text-sm text-surface-300 space-y-2">
                  <p>
                    Bureau reporting relationships can change at any time. Vendors may add or discontinue
                    reporting to specific bureaus. Always verify current reporting status directly with
                    the vendor before opening an account.
                  </p>
                  <p>
                    Credit card terms, requirements, and rewards programs are subject to change without
                    notice. Verify all details directly with the issuer before applying.
                  </p>
                  <p>
                    This page is for informational and educational purposes only and does not constitute
                    legal, financial, or tax advice. Consult qualified professionals for advice specific
                    to your situation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────── */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-extrabold text-white">
            Don&apos;t have the book yet?
          </h2>
          <p className="text-surface-300 max-w-xl mx-auto">
            These resources are most effective when used alongside the step-by-step process
            in <em>Credit Without a Credit Score</em>.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/books" className="btn-primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse All Books
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/contact" className="btn-secondary">
              Questions? Get in Touch
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
