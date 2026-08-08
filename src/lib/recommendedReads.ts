/**
 * Curated "Recommended Reads" — Amazon Associates affiliate list.
 *
 * Links are built as Amazon search URLs (`/s?k=<title+author>`) rather than
 * hardcoded /dp/ASIN links on purpose: editions get re-issued and ASINs go
 * stale (dead links earn $0), while a title+author search always resolves to
 * the current edition and still carries the associate tag for attribution.
 * If a direct product link is preferred for a specific title, set `asin`.
 */

export type ReadCategory = 'business' | 'tech' | 'security' | 'ai';

export interface RecommendedRead {
  title: string;
  author: string;
  category: ReadCategory;
  /** One line on why it's worth the money — Eric's voice, no fluff. */
  note: string;
  /** Optional direct ASIN. When set, links go straight to the product page. */
  asin?: string;
  /**
   * Self-hosted cover image under /public/covers, sourced from Open Library.
   * Amazon product images may only be used via SiteStripe / the Product
   * Advertising API, so we never hotlink theirs.
   */
  cover?: string;
  /** Cover credit / provenance: the Open Library edition the image came from. */
  coverSource?: string;
}

export const CATEGORY_LABELS: Record<ReadCategory, string> = {
  business: 'Business & Money',
  tech: 'Computers & IT',
  security: 'Cybersecurity',
  ai: 'AI & the Future of Work',
};

export const RECOMMENDED_READS: RecommendedRead[] = [
  // ── Business & Money ──────────────────────────────────────────────
  {
    title: 'The E-Myth Revisited',
    author: 'Michael E. Gerber',
    category: 'business',
    note: 'Why most small businesses stall: the owner works in the business instead of on it. Required reading if you run the shop and the register.',
    cover: '/covers/the-e-myth-revisited.webp',
    coverSource: 'Open Library /works/OL1821254W',
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
    cover: '/covers/100m-offers.webp',
    coverSource: 'Open Library /works/OL25037516W',
  },
  {
    title: 'Traction: Get a Grip on Your Business',
    author: 'Gino Wickman',
    category: 'business',
    note: 'The EOS operating system — meetings, scorecards, accountability. Good once you have a team and things get sloppy.',
    cover: '/covers/traction-get-a-grip-on-your-business.webp',
    coverSource: 'Open Library /works/OL11937510W',
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'business',
    note: 'Short chapters on why smart people make dumb money decisions. Best book to hand someone who "isn\'t a numbers person."',
    cover: '/covers/the-psychology-of-money.webp',
    coverSource: 'Open Library /works/OL21640039W',
  },
  {
    title: 'Never Split the Difference',
    author: 'Chris Voss',
    category: 'business',
    note: 'Negotiation from an FBI hostage negotiator. Mirroring and calibrated questions work in a sales call as well as a standoff.',
    cover: '/covers/never-split-the-difference.webp',
    coverSource: 'Open Library /works/OL18819818W',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'business',
    note: 'Systems over goals. The most practical book on actually doing the boring daily work.',
    cover: '/covers/atomic-habits.webp',
    coverSource: 'Open Library /works/OL17930368W',
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'business',
    note: 'A case for protecting long, uninterrupted blocks — and a schedule for getting them back.',
    cover: '/covers/deep-work.webp',
    coverSource: 'Open Library /works/OL17713267W',
  },
  {
    title: 'The Millionaire Real Estate Agent',
    author: 'Gary Keller',
    category: 'business',
    note: 'Written for agents, but the lead-gen models and economic model apply to any commission-based business.',
    cover: '/covers/the-millionaire-real-estate-agent.webp',
    coverSource: 'Open Library /works/OL19925633W',
  },

  // ── Computers & IT ────────────────────────────────────────────────
  {
    title: 'CompTIA A+ Certification All-in-One Exam Guide',
    author: 'Mike Meyers',
    category: 'tech',
    note: 'The standard A+ study bible. Pair it with hands-on practice and you will pass both cores.',
    cover: '/covers/comptia-a-certification-all-in-one-exam-guide.webp',
    coverSource: 'Open Library /works/OL27244239W',
  },
  {
    title: 'CompTIA Security+ Get Certified Get Ahead Study Guide',
    author: 'Darril Gibson',
    category: 'security',
    note: 'Clear, exam-focused Security+ prep. The practice questions map closely to how the real objectives are tested.',
    cover: '/covers/comptia-security-get-certified-get-ahead-study-guide.webp',
    coverSource: 'Open Library /works/OL27302640W',
  },
  {
    title: 'CompTIA Network+ Certification All-in-One Exam Guide',
    author: 'Mike Meyers',
    category: 'tech',
    note: 'Networking fundamentals explained without the fog — subnetting, routing, and the OSI model finally stick.',
    cover: '/covers/comptia-network-certification-all-in-one-exam-guide.webp',
    coverSource: 'Open Library /works/OL21122264W',
  },
  {
    title: 'The Linux Command Line',
    author: 'William Shotts',
    category: 'tech',
    note: 'The friendliest path from "what is a shell" to writing real scripts. Free online, worth owning in print.',
    cover: '/covers/the-linux-command-line.webp',
    coverSource: 'Open Library /works/OL16117040W',
  },
  {
    title: 'Linux Bible',
    author: 'Christopher Negus',
    category: 'tech',
    note: 'Broad reference covering administration, servers, and containers. Good companion to LPIC and Linux+ study.',
    cover: '/covers/linux-bible.webp',
    coverSource: 'Open Library /works/OL19547285W',
  },
  {
    title: 'The Pragmatic Programmer (20th Anniversary Edition)',
    author: 'David Thomas & Andrew Hunt',
    category: 'tech',
    note: 'Career-level advice on craft, not syntax. Ages better than any framework book.',
    cover: '/covers/the-pragmatic-programmer-20th-anniversary-edition.webp',
    coverSource: 'Open Library /works/OL5748544W',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'tech',
    note: 'Opinionated and argued about — still the fastest way to start caring about readable code.',
    cover: '/covers/clean-code.webp',
    coverSource: 'Open Library /works/OL17618370W',
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'tech',
    note: 'How real systems store and move data at scale. The book senior engineers keep re-reading.',
    cover: '/covers/designing-data-intensive-applications.webp',
    coverSource: 'Open Library /works/OL19293745W',
  },
  {
    title: 'The Web Application Hacker\u2019s Handbook',
    author: 'Dafydd Stuttard & Marcus Pinto',
    category: 'security',
    note: 'Offensive-security classic. Read it to understand how your own site gets probed.',
  },
  {
    title: 'The Phoenix Project',
    author: 'Gene Kim, Kevin Behr & George Spafford',
    category: 'tech',
    note: 'A novel about an IT department on fire that teaches DevOps painlessly.',
    cover: '/covers/the-phoenix-project.webp',
    coverSource: 'Open Library /works/OL16806686W',
  },

  // ── Cybersecurity ───────────────────────────────────────
  {
    title: 'Hacking: The Art of Exploitation',
    author: 'Jon Erickson',
    category: 'security',
    note: 'Ground-level look at how exploits actually work — memory, shellcode, and networking. Technical, and worth the effort.',
    cover: '/covers/hacking-the-art-of-exploitation.webp',
    coverSource: 'Open Library /works/OL5603179W',
  },
  {
    title: 'The Art of Invisibility',
    author: 'Kevin Mitnick',
    category: 'security',
    note: 'Practical privacy hardening from the most famous social engineer alive. Good to hand to a non-technical family member.',
    cover: '/covers/the-art-of-invisibility.webp',
    coverSource: 'Open Library /works/OL17635845W',
  },
  {
    title: 'Social Engineering: The Science of Human Hacking',
    author: 'Christopher Hadnagy',
    category: 'security',
    note: 'Most breaches start with a person, not a firewall. This is the playbook attackers use on your staff.',
    cover: '/covers/social-engineering-the-science-of-human-hacking.webp',
    coverSource: 'Open Library /works/OL16495169W',
  },
  {
    title: 'Sandworm',
    author: 'Andy Greenberg',
    category: 'security',
    note: 'True account of state-sponsored cyberattacks on real infrastructure. Reads like a thriller and explains the stakes.',
    cover: '/covers/sandworm.webp',
    coverSource: 'Open Library /works/OL20806093W',
  },
  {
    title: 'The Cuckoo\u2019s Egg',
    author: 'Cliff Stoll',
    category: 'security',
    note: 'The original hacker-hunt story, from 1989 and still the most fun intro to incident response.',
    cover: '/covers/the-cuckoo-s-egg.webp',
    coverSource: 'Open Library /works/OL3741565W',
  },
  {
    title: 'Practical Malware Analysis',
    author: 'Michael Sikorski & Andrew Honig',
    category: 'security',
    note: 'The hands-on reference for pulling malware apart safely. Standard on blue-team bookshelves.',
    cover: '/covers/practical-malware-analysis.webp',
    coverSource: 'Open Library /works/OL16509463W',
  },

  // ── AI & the Future of Work ───────────────────────────────────────
  {
    title: 'Co-Intelligence: Living and Working with AI',
    author: 'Ethan Mollick',
    category: 'ai',
    note: 'The most useful practical framing of working alongside AI. Start here if you only read one.',
    cover: '/covers/co-intelligence-living-and-working-with-ai.webp',
    coverSource: 'Open Library /works/OL37565105W',
  },
  {
    title: 'The Coming Wave',
    author: 'Mustafa Suleyman',
    category: 'ai',
    note: 'What happens as AI and synthetic biology arrive together, from a founder who built the tech.',
    cover: '/covers/the-coming-wave.webp',
    coverSource: 'Open Library /works/OL36525720W',
  },
  {
    title: 'AI Superpowers',
    author: 'Kai-Fu Lee',
    category: 'ai',
    note: 'The US-versus-China AI race and what it means for jobs. Still the clearest geopolitical primer.',
    cover: '/covers/ai-superpowers.webp',
    coverSource: 'Open Library /works/OL17994504W',
  },
  {
    title: 'Life 3.0: Being Human in the Age of Artificial Intelligence',
    author: 'Max Tegmark',
    category: 'ai',
    note: 'Big-picture scenarios for where this all goes, written by a physicist who takes both sides seriously.',
    cover: '/covers/life-3-0-being-human-in-the-age-of-artificial-intelligence.webp',
    coverSource: 'Open Library /works/OL19717530W',
  },
  {
    title: 'Human Compatible: Artificial Intelligence and the Problem of Control',
    author: 'Stuart Russell',
    category: 'ai',
    note: 'From the co-author of the standard AI textbook: how we keep powerful systems pointed at what we actually want.',
    cover: '/covers/human-compatible-artificial-intelligence-and-the-problem-of-.webp',
    coverSource: 'Open Library /works/OL20492448W',
  },
  {
    title: 'Superintelligence: Paths, Dangers, Strategies',
    author: 'Nick Bostrom',
    category: 'ai',
    note: 'The book that put AI risk on the map. Dense, but the arguments show up everywhere else.',
    cover: '/covers/superintelligence-paths-dangers-strategies.webp',
    coverSource: 'Open Library /works/OL17319280W',
  },
  {
    title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
    author: 'Aur\u00e9lien G\u00e9ron',
    category: 'ai',
    note: 'The build-it-yourself ML book. Code-first, and the best on-ramp for a working developer.',
    cover: '/covers/hands-on-machine-learning-with-scikit-learn-keras-and-tensorf.webp',
    coverSource: 'Open Library /works/OL20024943W',
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell & Peter Norvig',
    category: 'ai',
    note: 'The university textbook. Overkill for casual reading, definitive if you want the foundations.',
    cover: '/covers/artificial-intelligence-a-modern-approach.webp',
    coverSource: 'Open Library /works/OL2896994W',
  },
  {
    title: 'The Alignment Problem',
    author: 'Brian Christian',
    category: 'ai',
    note: 'Bias, reward hacking, and machine values told through the researchers who found the failures.',
    cover: '/covers/the-alignment-problem.webp',
    coverSource: 'Open Library /works/OL20781447W',
  },
];
