import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Shield,
  DollarSign,
  GraduationCap,
  Landmark,
  Newspaper,
  Users,
  Wrench,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cybersecurity Guide Resources — Tools, Budgets & Training',
  description:
    'Live companion resources for "The Complete Cybersecurity Guide for Small Business" by Eric Tomchik. Security tools with pricing, budget planners, government resources, annual reports, and free training.',
  openGraph: {
    title: 'Cybersecurity Guide Resources — Eric Tomchik',
    description:
      'Security tools directory, budget planners, government resources, and free training for small businesses.',
    url: 'https://erictomchik.com/resources/cybersecurity',
    type: 'website',
  },
};

const LAST_UPDATED = 'May 2026';

/* ------------------------------------------------------------------ */
/*  DATA — Free & Low-Cost Security Tools                              */
/* ------------------------------------------------------------------ */

interface SecurityTool {
  category: string;
  freeOptions: string;
  lowCostOptions: string;
}

const securityTools: SecurityTool[] = [
  { category: 'Password Manager', freeOptions: 'Bitwarden (free tier)', lowCostOptions: 'Bitwarden Business ($4/user/mo), 1Password ($7.99/user/mo)' },
  { category: 'MFA', freeOptions: 'Google Authenticator, Microsoft Authenticator', lowCostOptions: 'YubiKey hardware keys ($25–$55 each)' },
  { category: 'Endpoint Protection', freeOptions: 'Windows Security (built-in)', lowCostOptions: 'SentinelOne, Bitdefender ($3–$5/device/mo)' },
  { category: 'Email Security', freeOptions: 'Built-in M365/Google protections', lowCostOptions: 'Avanan, Abnormal ($3–$6/user/mo)' },
  { category: 'DNS Filtering', freeOptions: 'Cloudflare 1.1.1.1 for Families', lowCostOptions: 'NextDNS ($20/yr), Cisco Umbrella' },
  { category: 'Backup', freeOptions: 'OneDrive/Google Drive (included with M365/GW)', lowCostOptions: 'Acronis, Datto ($5–$10/device/mo)' },
  { category: 'Security Training', freeOptions: 'CISA free resources, KnowBe4 free module', lowCostOptions: 'Curricula ($3/user/yr), Ninjio ($3–$5/user/yr)' },
  { category: 'VPN', freeOptions: 'WireGuard (free, self-hosted)', lowCostOptions: 'NordLayer ($8/user/mo), Tailscale ($5/user/mo)' },
  { category: 'Vulnerability Scanning', freeOptions: 'Nmap, OpenVAS', lowCostOptions: 'Qualys ($200/yr), Tenable ($300+/yr)' },
  { category: 'SIEM / Logging', freeOptions: 'Windows Event Logs (built-in)', lowCostOptions: 'Blumira ($7/user/mo), Arctic Wolf' },
  { category: 'Framework / Assessment', freeOptions: 'NIST CSF, CIS Controls, HHS SRA Tool', lowCostOptions: '—' },
];

/* ------------------------------------------------------------------ */
/*  DATA — Budget Planners                                             */
/* ------------------------------------------------------------------ */

interface BudgetItem {
  item: string;
  cost: string;
}

interface BudgetTier {
  name: string;
  monthly: string;
  annual: string;
  riskReduction: string;
  color: string;
  items: BudgetItem[];
}

const budgetTiers: BudgetTier[] = [
  {
    name: 'Zero-Dollar Plan',
    monthly: '$0',
    annual: '$0',
    riskReduction: '~60–70%',
    color: 'from-green-500 to-emerald-600',
    items: [
      { item: 'Enable MFA everywhere', cost: '$0' },
      { item: 'Update all software', cost: '$0' },
      { item: 'Windows Security / macOS built-in', cost: '$0' },
      { item: 'Configure SPF, DKIM, DMARC', cost: '$0' },
      { item: 'Cloud sync backup (OneDrive / Google Drive)', cost: '$0' },
      { item: 'Written policies (Appendix A templates)', cost: '$0' },
      { item: 'Free security training (CISA, KnowBe4)', cost: '$0' },
      { item: 'Change all default passwords', cost: '$0' },
    ],
  },
  {
    name: '$100/Month Budget',
    monthly: '~$50–90',
    annual: '~$1,200',
    riskReduction: '~75–80%',
    color: 'from-blue-500 to-cyan-600',
    items: [
      { item: 'Password manager (15 users)', cost: '$45–60/mo' },
      { item: 'Security awareness training', cost: '~$4/mo' },
      { item: 'DNS filtering', cost: '$0–20/mo' },
      { item: 'Save remaining for cyber insurance', cost: '—' },
    ],
  },
  {
    name: '$250/Month Budget',
    monthly: '~$180–390',
    annual: '~$3,000',
    riskReduction: '~85–90%',
    color: 'from-violet-500 to-purple-600',
    items: [
      { item: 'Password manager (25 users)', cost: '$75–100/mo' },
      { item: 'Security awareness training', cost: '$5–15/mo' },
      { item: 'Business-grade endpoint protection', cost: '$50–125/mo' },
      { item: 'DNS filtering', cost: '$10–25/mo' },
      { item: 'Cyber insurance', cost: '$40–125/mo' },
    ],
  },
  {
    name: '$500/Month — The Sweet Spot',
    monthly: '~$370–830',
    annual: '~$6,000',
    riskReduction: '~90–95%',
    color: 'from-amber-500 to-orange-600',
    items: [
      { item: 'Password manager', cost: '$75–125/mo' },
      { item: 'Security awareness training', cost: '$10–30/mo' },
      { item: 'Business-grade endpoint protection', cost: '$75–175/mo' },
      { item: 'Managed firewall / UTM', cost: '$50–100/mo' },
      { item: 'Cloud backup service (1TB)', cost: '$50–100/mo' },
      { item: 'DNS filtering', cost: '$10–25/mo' },
      { item: 'Email security gateway', cost: '$25–75/mo' },
      { item: 'Cyber insurance', cost: '$75–200/mo' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  DATA — Government Resources                                        */
/* ------------------------------------------------------------------ */

interface GovResource {
  name: string;
  org: string;
  url: string;
  urlLabel: string;
  purpose: string;
}

const govResources: GovResource[] = [
  { name: 'CISA Cybersecurity Resources', org: 'CISA', url: 'https://www.cisa.gov/cybersecurity', urlLabel: 'cisa.gov/cybersecurity', purpose: 'Free assessments, alerts, best practices, and the Cybersecurity Performance Goals' },
  { name: 'CISA Cyber Hygiene Services', org: 'CISA', url: 'https://www.cisa.gov/cyber-hygiene-services', urlLabel: 'cisa.gov/cyber-hygiene-services', purpose: 'Free vulnerability scanning for public-facing systems' },
  { name: 'NIST Cybersecurity Framework', org: 'NIST', url: 'https://www.nist.gov/cyberframework', urlLabel: 'nist.gov/cyberframework', purpose: 'Free CSF 2.0 framework — the gold standard for cybersecurity programs' },
  { name: 'NIST Small Business Corner', org: 'NIST', url: 'https://www.nist.gov/itl/smallbusinesscyber', urlLabel: 'nist.gov/itl/smallbusinesscyber', purpose: 'Quick-Start Guide and resources tailored for small businesses' },
  { name: 'FBI IC3 (Internet Crime)', org: 'FBI', url: 'https://www.ic3.gov', urlLabel: 'ic3.gov', purpose: 'Report cybercrime, access annual threat reports' },
  { name: 'InfraGard', org: 'FBI', url: 'https://www.infragard.org', urlLabel: 'infragard.org', purpose: 'Free FBI-private sector partnership — threat briefings, local chapters' },
  { name: 'FTC Start with Security', org: 'FTC', url: 'https://www.ftc.gov/business-guidance/resources/start-security-guide-business', urlLabel: 'ftc.gov (Start with Security)', purpose: 'Practical 15-page guide with 10 security principles' },
  { name: 'FTC Data Breach Response', org: 'FTC', url: 'https://www.ftc.gov/business-guidance/resources/data-breach-response-guide-business', urlLabel: 'ftc.gov (Breach Response)', purpose: 'Step-by-step guidance after a breach, including notification requirements' },
  { name: 'SBA Cybersecurity Guide', org: 'SBA', url: 'https://www.sba.gov/business-guide/manage-your-business/strengthen-your-cybersecurity', urlLabel: 'sba.gov (Cybersecurity)', purpose: 'Overview of threats, best practices, and free resources for beginners' },
  { name: 'Small Business Dev Centers', org: 'SBA', url: 'https://americassbdc.org', urlLabel: 'americassbdc.org', purpose: 'Free local counseling — many now include cybersecurity guidance' },
  { name: 'SCORE Mentors', org: 'SCORE', url: 'https://www.score.org', urlLabel: 'score.org', purpose: 'Free business mentoring, some chapters with cybersecurity expertise' },
  { name: 'HHS Security Risk Assessment', org: 'HHS', url: 'https://www.healthit.gov/topic/privacy-security-and-hipaa/security-risk-assessment-tool', urlLabel: 'healthit.gov (SRA Tool)', purpose: 'Free HIPAA risk assessment tool for healthcare providers' },
];

/* ------------------------------------------------------------------ */
/*  DATA — Annual Reports                                              */
/* ------------------------------------------------------------------ */

interface AnnualReport {
  name: string;
  org: string;
  url: string;
  urlLabel: string;
  published: string;
  description: string;
}

const annualReports: AnnualReport[] = [
  { name: 'Data Breach Investigations Report (DBIR)', org: 'Verizon', url: 'https://www.verizon.com/business/resources/reports/dbir', urlLabel: 'verizon.com/dbir', published: 'Annually (May)', description: 'The most respected breach analysis — tens of thousands of incidents analyzed. Essential small business section.' },
  { name: 'Cost of a Data Breach Report', org: 'IBM / Ponemon', url: 'https://www.ibm.com/reports/data-breach', urlLabel: 'ibm.com/reports/data-breach', published: 'Annually (July)', description: 'Definitive breach cost data. Average: $4.88M globally, $3.31M for small orgs (2024).' },
  { name: 'State of Ransomware Report', org: 'Sophos', url: 'https://www.sophos.com/en-us/content/state-of-ransomware', urlLabel: 'sophos.com (Ransomware)', published: 'Annually (Apr–May)', description: 'Detailed ransomware trends — attack frequency, ransom demands, recovery costs.' },
  { name: 'Global Threat Report', org: 'CrowdStrike', url: 'https://www.crowdstrike.com/global-threat-report', urlLabel: 'crowdstrike.com/global-threat-report', published: 'Annually (Feb)', description: 'Threat actor behavior — who is attacking, techniques, and eCrime analysis.' },
  { name: 'Phishing by Industry Report', org: 'KnowBe4', url: 'https://www.knowbe4.com/phishing-benchmarking-report', urlLabel: 'knowbe4.com (Phishing Report)', published: 'Annually', description: 'Phishing susceptibility across industries — baseline click rates and training effectiveness.' },
];

/* ------------------------------------------------------------------ */
/*  DATA — Free Training                                               */
/* ------------------------------------------------------------------ */

interface TrainingResource {
  name: string;
  url: string;
  urlLabel: string;
  format: string;
  time: string;
  bestFor: string;
}

const freeTraining: TrainingResource[] = [
  { name: 'CISA Cybersecurity Awareness Program', url: 'https://www.cisa.gov/cybersecurity-awareness-program', urlLabel: 'cisa.gov', format: 'Tip sheets, presentations, videos', time: '15 min – 2 hrs', bestFor: 'Employee training sessions' },
  { name: 'SANS Cyber Aces Online', url: 'https://www.cyberaces.org', urlLabel: 'cyberaces.org', format: 'Self-paced video courses', time: '10–20 hours', bestFor: 'Deeper technical understanding' },
  { name: 'CyberSecure My Business', url: 'https://staysafeonline.org/programs/cybersecure-my-business', urlLabel: 'staysafeonline.org', format: 'Webinars, workshops', time: 'Various', bestFor: 'Small business owners' },
  { name: 'GCA Cybersecurity Toolkit', url: 'https://gcatoolkit.org/smallbusiness', urlLabel: 'gcatoolkit.org', format: 'Interactive step-by-step guides', time: 'Self-paced', bestFor: 'Implementing specific controls' },
  { name: 'Coursera — Cybersecurity for Business', url: 'https://www.coursera.org', urlLabel: 'coursera.org', format: 'Video lectures + assignments', time: '~20 hours (audit free)', bestFor: 'Structured multi-week learning' },
  { name: 'FTC Start with Security Training', url: 'https://www.ftc.gov/business-guidance/resources/start-security-guide-business', urlLabel: 'ftc.gov', format: 'Interactive modules', time: '1–2 hours', bestFor: 'Understanding legal obligations' },
];

/* ------------------------------------------------------------------ */
/*  DATA — Newsletters & Podcasts                                      */
/* ------------------------------------------------------------------ */

interface MediaResource {
  name: string;
  url: string;
  type: 'newsletter' | 'podcast';
  description: string;
}

const mediaResources: MediaResource[] = [
  { name: 'CISA Alerts', url: 'https://www.cisa.gov/subscribe', type: 'newsletter', description: 'Official government cybersecurity alerts — subscribe to "Current Activity" and "Alerts"' },
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com', type: 'newsletter', description: 'Most respected independent cybersecurity journalist — breaches, threats, law enforcement' },
  { name: 'The Hacker News', url: 'https://thehackernews.com', type: 'newsletter', description: 'Daily cybersecurity news — vulnerabilities, breaches, threat intelligence' },
  { name: 'SANS NewsBites', url: 'https://www.sans.org/newsletters/newsbites', type: 'newsletter', description: 'Twice-weekly curated summary — excellent signal-to-noise ratio' },
  { name: 'Risky Business', url: 'https://risky.biz', type: 'newsletter', description: 'Weekly cybersecurity news podcast and newsletter with excellent analysis' },
  { name: 'Smashing Security', url: 'https://www.smashingsecurity.com', type: 'podcast', description: 'Light, accessible, entertaining — perfect for non-technical listeners. Weekly ~45 min' },
  { name: 'Darknet Diaries', url: 'https://darknetdiaries.com', type: 'podcast', description: 'Deep-dive stories about hackers and cybercrime — true crime meets cybersecurity. Bi-weekly ~60 min' },
  { name: 'CyberWire Daily', url: 'https://thecyberwire.com/podcasts/daily-podcast', type: 'podcast', description: 'Daily 20-minute briefing on cybersecurity news — like a morning news show' },
  { name: 'Hacking Humans', url: 'https://thecyberwire.com/podcasts/hacking-humans', type: 'podcast', description: 'Focused on social engineering and human factors. Weekly ~40 min' },
];

/* ------------------------------------------------------------------ */
/*  DATA — Professional Orgs                                           */
/* ------------------------------------------------------------------ */

interface ProfOrg {
  name: string;
  url: string;
  urlLabel: string;
  cost: string;
  value: string;
}

const profOrgs: ProfOrg[] = [
  { name: 'InfraGard', url: 'https://www.infragard.org', urlLabel: 'infragard.org', cost: 'Free', value: 'FBI-private sector partnership — threat briefings, local chapter meetings' },
  { name: 'SCORE Cybersecurity Mentoring', url: 'https://www.score.org', urlLabel: 'score.org', cost: 'Free', value: 'One-on-one mentoring from experienced cybersecurity professionals' },
  { name: 'National Cybersecurity Alliance', url: 'https://staysafeonline.org', urlLabel: 'staysafeonline.org', cost: 'Free', value: 'Training materials, awareness campaigns, best practice guides' },
  { name: 'Center for Internet Security (CIS)', url: 'https://www.cisecurity.org', urlLabel: 'cisecurity.org', cost: 'Free (most)', value: 'CIS Controls (prioritized security actions) and CIS Benchmarks (configuration guides)' },
  { name: 'No More Ransom Project', url: 'https://www.nomoreransom.org', urlLabel: 'nomoreransom.org', cost: 'Free', value: 'Free ransomware decryption tools — check here first if hit by ransomware' },
  { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', urlLabel: 'haveibeenpwned.com', cost: 'Free (basic)', value: 'Check if your email/passwords have appeared in known data breaches' },
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
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-400" />
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

export default function CybersecurityResourcesPage() {
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
            <span>Cybersecurity Guide</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="gradient-text">Cybersecurity Guide</span>
            <br />
            <span className="text-white text-2xl sm:text-3xl mt-2 block">Small Business Companion Resources</span>
          </h1>
          <p className="text-lg text-surface-300 leading-relaxed">
            Security tools change pricing, government agencies update their resources, and
            annual reports publish new editions every year. This companion page keeps
            Chapters 28 and 29 of the book current — tool recommendations, budget plans,
            and every link verified.
          </p>
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Last verified: {LAST_UPDATED}</span>
          </div>
        </div>

        {/* Quick Nav */}
        <nav className="card p-6 space-y-4" aria-label="Page sections">
          <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">Jump to Section</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: 'tools', label: 'Security Tools Directory', icon: Wrench },
              { id: 'budgets', label: 'Budget Planners', icon: DollarSign },
              { id: 'government', label: 'Government Resources', icon: Landmark },
              { id: 'reports', label: 'Annual Reports', icon: Newspaper },
              { id: 'training', label: 'Free Training', icon: GraduationCap },
              { id: 'media', label: 'Newsletters & Podcasts', icon: Newspaper },
              { id: 'orgs', label: 'Professional Organizations', icon: Users },
              { id: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50 hover:border-surface-600 transition-all group"
              >
                <item.icon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-surface-200 group-hover:text-white transition-colors">{item.label}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* Section 1: Security Tools Directory */}
        <section className="space-y-8">
          <SectionHeader
            icon={Wrench}
            title="Free & Low-Cost Security Tools"
            description="A curated directory of security tools at every price point. Most small businesses can build a solid security posture for $50–$500/month using these tools."
            id="tools"
          />

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-surface-700 bg-surface-900/40">
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Category</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Free Options</th>
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold uppercase tracking-wider text-xs">Low-Cost Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800">
                  {securityTools.map((tool) => (
                    <tr key={tool.category} className="hover:bg-surface-800/40 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{tool.category}</td>
                      <td className="py-3 px-4 text-surface-300">{tool.freeOptions}</td>
                      <td className="py-3 px-4 text-surface-300">{tool.lowCostOptions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 2: Budget Planners */}
        <section className="space-y-8">
          <SectionHeader
            icon={DollarSign}
            title="Budget Planners"
            description="Four tiers of cybersecurity investment — from $0 to $500/month. Each tier builds on the previous one. Even the zero-dollar plan blocks 60–70% of common attack vectors."
            id="budgets"
          />

          <div className="grid md:grid-cols-2 gap-6">
            {budgetTiers.map((tier) => (
              <div key={tier.name} className="card p-6 space-y-5 relative overflow-hidden">
                {/* Gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tier.color}`} />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-surface-400">Monthly: <span className="text-white font-mono">{tier.monthly}</span></span>
                    <span className="text-surface-400">Annual: <span className="text-white font-mono">{tier.annual}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Shield className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400 font-medium">Risk reduction: {tier.riskReduction}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {tier.items.map((item) => (
                    <div key={item.item} className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-surface-200">{item.item}</span>
                      </div>
                      <span className="text-xs text-surface-400 font-mono whitespace-nowrap flex-shrink-0">{item.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Key stat */}
          <div className="card p-6 border-blue-500/20 bg-blue-500/5">
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold text-white">$1 spent on prevention = $20–$200 saved</p>
              <p className="text-surface-300 text-sm max-w-2xl mx-auto">
                Average small business breach costs $120,000–$1,240,000. A basic security program
                costs $1,200–$6,000/year. Nearly 1 in 5 SMBs that experience a cyberattack go bankrupt or close.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Government Resources */}
        <section className="space-y-8">
          <SectionHeader
            icon={Landmark}
            title="Government Resources"
            description="Free cybersecurity resources from federal agencies — frameworks, scanning tools, training materials, and incident response guidance."
            id="government"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            {govResources.map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-5 group hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-800 text-surface-400 border border-surface-700/50">{resource.org}</span>
                    </div>
                    <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                      {resource.name}
                    </h3>
                    <p className="text-sm text-surface-400">{resource.purpose}</p>
                    <p className="text-xs text-blue-400/70 font-mono">{resource.urlLabel}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-surface-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Section 4: Annual Reports */}
        <section className="space-y-8">
          <SectionHeader
            icon={Newspaper}
            title="Annual Must-Read Reports"
            description="Published annually by leading cybersecurity firms — the data that informs security strategy worldwide. Most are free to download."
            id="reports"
          />

          <div className="space-y-4">
            {annualReports.map((report) => (
              <a
                key={report.name}
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-5 group hover:border-blue-500/40 transition-all flex items-start gap-5"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                      {report.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-800 text-surface-400">{report.org}</span>
                  </div>
                  <p className="text-sm text-surface-300">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-surface-400">
                    <span>Published: {report.published}</span>
                    <span className="text-blue-400/70 font-mono">{report.urlLabel}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-surface-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
              </a>
            ))}
          </div>
        </section>

        {/* Section 5: Free Training */}
        <section className="space-y-8">
          <SectionHeader
            icon={GraduationCap}
            title="Free Training & Courses"
            description="Structured learning at no cost — for business owners and employees alike. Even basic training reduces phishing susceptibility by 40–50%."
            id="training"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            {freeTraining.map((course) => (
              <a
                key={course.name}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-5 group hover:border-blue-500/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                      {course.name}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-surface-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-surface-400">
                    <span>{course.format}</span>
                    <span>•</span>
                    <span>{course.time}</span>
                  </div>
                  <p className="text-sm text-surface-300">Best for: {course.bestFor}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Section 6: Newsletters & Podcasts */}
        <section className="space-y-8">
          <SectionHeader
            icon={Newspaper}
            title="Newsletters & Podcasts"
            description="Stay current without hours of research. All free."
            id="media"
          />

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Newsletters</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {mediaResources
                  .filter((m) => m.type === 'newsletter')
                  .map((m) => (
                    <a
                      key={m.name}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card p-4 group hover:border-blue-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors text-sm">
                            {m.name}
                          </h4>
                          <p className="text-xs text-surface-400">{m.description}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-surface-500 group-hover:text-blue-400 flex-shrink-0" />
                      </div>
                    </a>
                  ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Podcasts</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {mediaResources
                  .filter((m) => m.type === 'podcast')
                  .map((m) => (
                    <a
                      key={m.name}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card p-4 group hover:border-blue-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors text-sm">
                            {m.name}
                          </h4>
                          <p className="text-xs text-surface-400">{m.description}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-surface-500 group-hover:text-blue-400 flex-shrink-0" />
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Professional Organizations */}
        <section className="space-y-8">
          <SectionHeader
            icon={Users}
            title="Professional Organizations & Tools"
            description="Communities, tools, and resources that keep you connected to current threats and best practices."
            id="orgs"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            {profOrgs.map((org) => (
              <a
                key={org.name}
                href={org.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-5 group hover:border-blue-500/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                      {org.name}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-surface-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-sm text-surface-300">{org.value}</p>
                  <div className="flex items-center gap-3 text-xs text-surface-400">
                    <span>Cost: <span className="text-green-400">{org.cost}</span></span>
                    <span className="text-blue-400/70 font-mono">{org.urlLabel}</span>
                  </div>
                </div>
              </a>
            ))}
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
                    Security tool pricing, features, and availability change frequently. Prices shown
                    were verified as of {LAST_UPDATED}. Always check vendor websites for current pricing
                    before purchasing.
                  </p>
                  <p>
                    Government URLs and resources may move or be reorganized. If a link is broken,
                    search the agency&apos;s main website for the resource name.
                  </p>
                  <p>
                    This page is for informational purposes only and does not constitute cybersecurity,
                    legal, or compliance advice. Consult qualified cybersecurity professionals for
                    guidance specific to your business.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-extrabold text-white">
            Ready to secure your business?
          </h2>
          <p className="text-surface-300 max-w-xl mx-auto">
            This page covers tools and links. The book covers the full strategy —
            risk assessment, implementation roadmaps, incident response plans, employee
            training programs, and compliance requirements.
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
