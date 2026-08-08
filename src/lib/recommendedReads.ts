/**
 * Curated "Recommended Reads" — Amazon Associates affiliate list.
 *
 * Links are built as Amazon search URLs (`/s?k=<title+author>`) rather than
 * hardcoded /dp/ASIN links on purpose: editions get re-issued and ASINs go
 * stale (dead links earn $0), while a title+author search always resolves to
 * the current edition and still carries the associate tag for attribution.
 * If a direct product link is preferred for a specific title, set `asin`.
 */

export type ReadCategory = 'business' | 'tech' | 'ai';

export interface RecommendedRead {
  title: string;
  author: string;
  category: ReadCategory;
  /** One line on why it's worth the money — Eric's voice, no fluff. */
  note: string;
  /** Optional direct ASIN. When set, links go straight to the product page. */
  asin?: string;
}

export const CATEGORY_LABELS: Record<ReadCategory, string> = {
  business: 'Business & Money',
  tech: 'Computers & IT',
  ai: 'AI & the Future of Work',
};

export const RECOMMENDED_READS: RecommendedRead[] = [
  // ── Business & Money ──────────────────────────────────────────────
  {
    title: 'The E-Myth Revisited',
    author: 'Michael E. Gerber',
    category: 'business',
    note: 'Why most small businesses stall: the owner works in the business instead of on it. Required reading if you run the shop and the register.',
  },
  {
    title: 'Profit First',
    author: 'Mike Michalowicz',
    category: 'business',
    note: 'Pay yourself first and let the business live on what is left. The bank-account system is dead simple to run.',
  },
  {
    title: '$100M Offers',
    author: 'Alex Hormozi',
    category: 'business',
    note: 'How to build an offer that is hard to say no to. The value-stacking chapters alone are worth it.',
  },
  {
    title: 'Traction: Get a Grip on Your Business',
    author: 'Gino Wickman',
    category: 'business',
    note: 'The EOS operating system — meetings, scorecards, accountability. Good once you have a team and things get sloppy.',
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'business',
    note: 'Short chapters on why smart people make dumb money decisions. Best book to hand someone who "isn\'t a numbers person."',
  },
  {
    title: 'Never Split the Difference',
    author: 'Chris Voss',
    category: 'business',
    note: 'Negotiation from an FBI hostage negotiator. Mirroring and calibrated questions work in a sales call as well as a standoff.',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'business',
    note: 'Systems over goals. The most practical book on actually doing the boring daily work.',
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'business',
    note: 'A case for protecting long, uninterrupted blocks — and a schedule for getting them back.',
  },
  {
    title: 'The Millionaire Real Estate Agent',
    author: 'Gary Keller',
    category: 'business',
    note: 'Written for agents, but the lead-gen models and economic model apply to any commission-based business.',
  },

  // ── Computers & IT ────────────────────────────────────────────────
  {
    title: 'CompTIA A+ Certification All-in-One Exam Guide',
    author: 'Mike Meyers',
    category: 'tech',
    note: 'The standard A+ study bible. Pair it with hands-on practice and you will pass both cores.',
  },
  {
    title: 'CompTIA Security+ Get Certified Get Ahead Study Guide',
    author: 'Darril Gibson',
    category: 'tech',
    note: 'Clear, exam-focused Security+ prep. The practice questions map closely to how the real objectives are tested.',
  },
  {
    title: 'CompTIA Network+ Certification All-in-One Exam Guide',
    author: 'Mike Meyers',
    category: 'tech',
    note: 'Networking fundamentals explained without the fog — subnetting, routing, and the OSI model finally stick.',
  },
  {
    title: 'The Linux Command Line',
    author: 'William Shotts',
    category: 'tech',
    note: 'The friendliest path from "what is a shell" to writing real scripts. Free online, worth owning in print.',
  },
  {
    title: 'Linux Bible',
    author: 'Christopher Negus',
    category: 'tech',
    note: 'Broad reference covering administration, servers, and containers. Good companion to LPIC and Linux+ study.',
  },
  {
    title: 'The Pragmatic Programmer (20th Anniversary Edition)',
    author: 'David Thomas & Andrew Hunt',
    category: 'tech',
    note: 'Career-level advice on craft, not syntax. Ages better than any framework book.',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'tech',
    note: 'Opinionated and argued about — still the fastest way to start caring about readable code.',
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'tech',
    note: 'How real systems store and move data at scale. The book senior engineers keep re-reading.',
  },
  {
    title: 'The Web Application Hacker\u2019s Handbook',
    author: 'Dafydd Stuttard & Marcus Pinto',
    category: 'tech',
    note: 'Offensive-security classic. Read it to understand how your own site gets probed.',
  },
  {
    title: 'The Phoenix Project',
    author: 'Gene Kim, Kevin Behr & George Spafford',
    category: 'tech',
    note: 'A novel about an IT department on fire that teaches DevOps painlessly.',
  },

  // ── AI & the Future of Work ───────────────────────────────────────
  {
    title: 'Co-Intelligence: Living and Working with AI',
    author: 'Ethan Mollick',
    category: 'ai',
    note: 'The most useful practical framing of working alongside AI. Start here if you only read one.',
  },
  {
    title: 'The Coming Wave',
    author: 'Mustafa Suleyman',
    category: 'ai',
    note: 'What happens as AI and synthetic biology arrive together, from a founder who built the tech.',
  },
  {
    title: 'AI Superpowers',
    author: 'Kai-Fu Lee',
    category: 'ai',
    note: 'The US-versus-China AI race and what it means for jobs. Still the clearest geopolitical primer.',
  },
  {
    title: 'Life 3.0: Being Human in the Age of Artificial Intelligence',
    author: 'Max Tegmark',
    category: 'ai',
    note: 'Big-picture scenarios for where this all goes, written by a physicist who takes both sides seriously.',
  },
  {
    title: 'Human Compatible: Artificial Intelligence and the Problem of Control',
    author: 'Stuart Russell',
    category: 'ai',
    note: 'From the co-author of the standard AI textbook: how we keep powerful systems pointed at what we actually want.',
  },
  {
    title: 'Superintelligence: Paths, Dangers, Strategies',
    author: 'Nick Bostrom',
    category: 'ai',
    note: 'The book that put AI risk on the map. Dense, but the arguments show up everywhere else.',
  },
  {
    title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
    author: 'Aur\u00e9lien G\u00e9ron',
    category: 'ai',
    note: 'The build-it-yourself ML book. Code-first, and the best on-ramp for a working developer.',
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell & Peter Norvig',
    category: 'ai',
    note: 'The university textbook. Overkill for casual reading, definitive if you want the foundations.',
  },
  {
    title: 'The Alignment Problem',
    author: 'Brian Christian',
    category: 'ai',
    note: 'Bias, reward hacking, and machine values told through the researchers who found the failures.',
  },
];
