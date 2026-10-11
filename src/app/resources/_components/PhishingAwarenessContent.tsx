import Image from 'next/image';
import {
  ExternalLink,
  AlertTriangle,
  ShieldAlert,
  Eye,
  Siren,
  Flag,
  BookOpen,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const PHISHING_LAST_UPDATED = 'October 2026';

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const FEATURED_GUIDE_URL =
  'https://www.privateinternetaccess.com/blog/phishing-scams-how-to-spot-and-avoid-them/';

interface Stat {
  value: string;
  label: string;
  source: string;
}

const stats: Stat[] = [
  {
    value: '193,407',
    label: 'phishing & spoofing complaints, the #1 most-reported cybercrime in the US in 2024',
    source: 'FBI IC3 2024 Internet Crime Report',
  },
  {
    value: '3.8M',
    label: 'phishing attacks recorded worldwide in 2025',
    source: 'Anti-Phishing Working Group (APWG)',
  },
  {
    value: '$4.44M',
    label: 'average cost of a data breach. Phishing was the most common way attackers got in.',
    source: 'IBM Cost of a Data Breach Report 2025',
  },
];

interface ScamType {
  name: string;
  channel: string;
  description: string;
}

const scamTypes: ScamType[] = [
  { name: 'Email phishing', channel: 'Email', description: 'Mass emails impersonating banks, retailers, or delivery services, urging you to "verify" or "log in" through a malicious link.' },
  { name: 'Spear phishing', channel: 'Email', description: 'Targeted messages that use your name, employer, or recent activity. AI now makes these cheap to produce at scale.' },
  { name: 'Business email compromise', channel: 'Email', description: 'A "boss" or "vendor" asks for an urgent wire transfer, gift cards, or a change to payment details.' },
  { name: 'Smishing', channel: 'Text', description: 'Fake texts about packages, tolls, bank alerts, or prizes with a link to a lookalike site.' },
  { name: 'Vishing & voice clones', channel: 'Phone', description: 'Calls from "the bank," "IRS," "tech support," or an AI-cloned relative pressuring you to pay or share codes.' },
  { name: 'Quishing', channel: 'QR code', description: 'Malicious QR codes in emails, flyers, or stickers on parking meters that lead to credential-harvesting sites.' },
  { name: 'Social media impersonation', channel: 'Social', description: 'Fake friend profiles, "support" accounts, and quizzes designed to collect answers to your security questions.' },
  { name: 'Fake websites & scareware', channel: 'Web', description: 'Pixel-perfect login pages and pop-up "virus alerts" that push you to enter passwords or call a fake help line.' },
];

const fiveSecondCheck = [
  { title: 'Stop: am I being rushed?', text: 'Urgency, fear, secrecy, or a too-good-to-be-true reward are the oldest tricks in the book. Slow down.' },
  { title: 'Who really sent this?', text: 'Check the actual email address or phone number, not just the display name. Look for lookalike spellings.' },
  { title: 'Where does the link go?', text: 'Hover (desktop) or long-press (mobile) to preview the real URL. When in doubt, type the site address yourself.' },
  { title: 'What are they asking for?', text: 'Passwords, one-time codes, PINs, SSNs, gift cards, crypto, or wire transfers are an automatic red flag.' },
  { title: 'Verify another way', text: 'Call the company or person back on a number you already know, never the number in the message.' },
];

const protections = [
  'Turn on two-factor authentication (2FA) for email, banking, and social accounts. App-based codes or passkeys beat SMS.',
  'Use a password manager so every account has a unique password and you can see when a login page is on the wrong domain.',
  'Keep your phone, computer, browser, and apps updated automatically.',
  'Agree on a family "safe word" so you can verify emergency calls that might be AI voice clones.',
  'Limit what you share publicly (birthdays, pet names, travel plans, employer) because it fuels targeted scams.',
  'Turn on your email provider\u2019s spam and phishing filters, and your phone\u2019s "filter unknown senders" setting.',
];

interface ReportLink {
  name: string;
  url: string;
  urlLabel: string;
  use: string;
}

const reportLinks: ReportLink[] = [
  { name: 'FTC: Report Fraud', url: 'https://reportfraud.ftc.gov', urlLabel: 'reportfraud.ftc.gov', use: 'Report scams, phishing, and impersonation to the Federal Trade Commission.' },
  { name: 'FBI Internet Crime Complaint Center', url: 'https://www.ic3.gov', urlLabel: 'ic3.gov', use: 'Report online crime, especially if you lost money.' },
  { name: 'IdentityTheft.gov', url: 'https://www.identitytheft.gov', urlLabel: 'identitytheft.gov', use: 'Get a personalized recovery plan if your identity was stolen.' },
  { name: 'Forward scam texts to 7726', url: 'https://consumer.ftc.gov/articles/how-recognize-and-report-spam-text-messages', urlLabel: 'Text "SPAM" (7726)', use: 'Free on major US carriers. Helps block the sender.' },
  { name: 'APWG: Report Phishing', url: 'https://apwg.org/reportphishing/', urlLabel: 'reportphishing@apwg.org', use: 'Forward phishing emails to help security researchers take sites down.' },
  { name: 'CISA: Avoid Phishing', url: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing', urlLabel: 'cisa.gov', use: 'Free, plain-English tips from the U.S. Cybersecurity & Infrastructure Security Agency.' },
];

const ifYouClicked = [
  'Disconnect: close the page and don\u2019t enter anything else. If you downloaded a file, disconnect from Wi-Fi.',
  'Change the password for that account (and anywhere you reused it) from a trusted device. Turn on 2FA.',
  'Call your bank or card issuer using the number on the back of your card if you shared financial details.',
  'Run a full antivirus/security scan on your device.',
  'Report it (links below) and warn friends or coworkers if the scam came from your hacked account.',
  'Consider a free credit freeze with Equifax, Experian, and TransUnion if you shared your SSN.',
];

/* ------------------------------------------------------------------ */
/*  COMPONENTS                                                         */
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
    <div id={id} className="scroll-mt-32 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-rose-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h2>
      </div>
      <p className="text-surface-300 max-w-3xl">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CONTENT                                                            */
/* ------------------------------------------------------------------ */

export default function PhishingAwarenessContent({ showTitle = true }: { showTitle?: boolean }) {
  return (
    <div className="space-y-20">
      {/* Intro + stats */}
      <section className="space-y-8">
        <div className="max-w-3xl space-y-4">
          {showTitle && (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Phishing Awareness: <span className="gradient-text">Spot AI-Powered Scams</span>
            </h2>
          )}
          <p className="text-surface-300 leading-relaxed">
            The typo-filled &quot;Nigerian prince&quot; email is gone. Today&apos;s phishing scams are
            written by AI, personalized with details scraped from social media, and delivered by
            email, text, phone, and even QR code. Seniors, students, and small-business owners are all
            targets, and it often takes a single click. This page explains how modern
            phishing works, the red flags to look for, and exactly what to do if you&apos;ve been hooked.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.value} className="card p-6 space-y-2">
              <div className="text-3xl font-extrabold text-rose-400">{s.value}</div>
              <p className="text-sm text-surface-200">{s.label}</p>
              <p className="text-xs text-surface-500">Source: {s.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Anatomy of a phishing email */}
      <section className="space-y-8">
        <SectionHeader
          icon={Eye}
          title="Anatomy of a Phishing Email"
          description="Here are six warning signs in one realistic (fake) message. Learn these and you'll catch most scams before they catch you."
          id="phishing-anatomy"
        />
        <figure className="card overflow-hidden">
          <Image
            src="/images/resources/phishing-email-red-flags.webp"
            alt="Annotated example of a phishing email from a fake bank showing six red flags: lookalike sender domain, urgent deadline, generic greeting, request for PIN and SSN, mismatched link, and a disguised .pdf.exe attachment"
            width={1400}
            height={830}
            className="w-full h-auto"
          />
          <figcaption className="px-5 py-3 text-xs text-surface-500">
            Illustrative example created for awareness training. &quot;Northbridge Bank&quot; is fictional.
          </figcaption>
        </figure>
      </section>

      {/* AI-era scams */}
      <section className="space-y-8">
        <SectionHeader
          icon={ShieldAlert}
          title="Phishing in the AI Era"
          description="AI can write flawless, personalized messages and clone a loved one's voice from a few seconds of audio. Phishing now reaches you on every channel."
          id="ai-phishing"
        />
        <figure className="card overflow-hidden">
          <Image
            src="/images/resources/ai-era-phishing-examples.webp"
            alt="Three examples of modern phishing: a fake USPS delivery text message, an AI voice-clone call from a family member asking for money, and a fraudulent QR code sticker on a parking meter"
            width={1400}
            height={780}
            className="w-full h-auto"
          />
          <figcaption className="px-5 py-3 text-xs text-surface-500">
            Illustrative examples. Phone numbers and URLs are fictional.
          </figcaption>
        </figure>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scamTypes.map((t) => (
            <div key={t.name} className="card p-5 space-y-2">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-full px-2 py-0.5">
                {t.channel}
              </span>
              <h3 className="text-white font-semibold">{t.name}</h3>
              <p className="text-sm text-surface-300">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5-second check */}
      <section className="space-y-8">
        <SectionHeader
          icon={CheckCircle2}
          title="The 5-Second Check"
          description="Run through these five questions before you click, call, pay, or reply. Teach them to the people you care about."
          id="five-second-check"
        />
        <ol className="grid md:grid-cols-5 gap-4">
          {fiveSecondCheck.map((step, i) => (
            <li key={step.title} className="card p-5 space-y-2">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <h3 className="text-white font-semibold">{step.title}</h3>
              <p className="text-sm text-surface-300">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-400" /> Everyday protections
          </h3>
          <ul className="grid md:grid-cols-2 gap-3">
            {protections.map((p) => (
              <li key={p} className="flex gap-3 text-sm text-surface-300">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* If you clicked */}
      <section className="space-y-8">
        <SectionHeader
          icon={Siren}
          title="Clicked a Link? Do This Now"
          description="Acting in the first hour can make the difference between a scare and a loss. Don't be embarrassed. These scams are designed to fool smart people."
          id="if-you-clicked"
        />
        <ol className="card p-6 space-y-3">
          {ifYouClicked.map((step, i) => (
            <li key={step} className="flex gap-4 text-surface-200">
              <span className="w-7 h-7 rounded-full bg-surface-800 text-rose-300 text-sm font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Report */}
      <section className="space-y-8">
        <SectionHeader
          icon={Flag}
          title="Where to Report Phishing"
          description="Reporting helps authorities shut down scam sites and warn others, even if you didn't lose money."
          id="report"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportLinks.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 group hover:border-rose-500/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-white font-semibold group-hover:text-rose-400 transition-colors">{r.name}</h3>
                  <ExternalLink className="w-4 h-4 text-surface-500 group-hover:text-rose-400 transition-colors flex-shrink-0" />
                </div>
                <p className="text-sm text-surface-300">{r.use}</p>
                <span className="text-xs text-rose-400/70 font-mono">{r.urlLabel}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured guide */}
      <section className="space-y-8">
        <SectionHeader
          icon={BookOpen}
          title="Recommended Deep Dive"
          description="Want the full picture? This in-depth guide covers how phishing campaigns operate, real-world breaches, and how deepfakes are changing the threat."
          id="featured-guide"
        />
        <a
          href={FEATURED_GUIDE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="card p-6 sm:p-8 block group hover:border-rose-500/40 transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-7 h-7 text-rose-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">
                Phishing Scams: How to Spot and Avoid Them
              </h3>
              <p className="text-sm text-surface-300">
                A complete guide from Private Internet Access covering email, text, voice, QR-code,
                and social-media phishing, real case studies (MGM Resorts, Arup&apos;s $25M deepfake
                video call), prevention checklists, and an appendix of real-world tactics.
              </p>
              <p className="text-xs text-surface-500">
                Shared with us by Catherine Sanchez, a digital literacy educator who runs tech literacy
                workshops for seniors and young people.
              </p>
            </div>
            <span className="btn-primary whitespace-nowrap self-start sm:self-center">
              Read the Guide
              <ExternalLink className="w-4 h-4 ml-2" />
            </span>
          </div>
        </a>
      </section>

      {/* Disclaimer */}
      <section>
        <div className="card p-6 border-yellow-500/20 bg-yellow-500/5">
          <div className="flex gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-surface-300 space-y-2">
              <p>
                Statistics were verified against their published sources as of {PHISHING_LAST_UPDATED}.
                External guides are provided for educational purposes. Eric Tomchik is not affiliated
                with and does not endorse any third-party product mentioned on linked sites.
              </p>
              <p>
                This page is for general awareness only and is not legal or professional security advice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
