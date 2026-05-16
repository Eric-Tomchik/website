import { Metadata } from 'next';
import Link from 'next/link';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../convex/_generated/api';
import { ArrowRight, Code2, ExternalLink } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Web development portfolio by Eric Tomchik — custom websites for restaurants, bars, and businesses on the Mississippi Gulf Coast.',
  alternates: {
    canonical: 'https://erictomchik.com/portfolio',
  },
};

// Fallback data in case Convex is empty (used during initial seed)
const fallbackProjects = [
  {
    title: 'Boonies on the Bayou',
    description:
      'Customers can find the full menu, make reservations, and discover upcoming events — all from their phone. The owner updates menus and events instantly without needing a developer. Interactive map helps first-time visitors find the Bay St. Louis waterfront location.',
    thumbnail_url: '/images/portfolio/boonies-on-the-bayou.webp',
    technologies: ['HTML/CSS', 'JavaScript', 'Convex', 'Google Maps API'],
    category: 'Restaurant',
    live_url: 'https://boonies.erictomchik.com',
  },
  {
    title: 'Butcher Block Steak House & Bar',
    description:
      'One website manages four Gulf Coast restaurant locations. Guests pick their nearest spot, view location-specific menus, book tables, request catering, and reserve private event space — reducing phone calls and walk-in confusion across all four venues.',
    thumbnail_url: '/images/portfolio/butcher-block.webp',
    technologies: ['HTML/CSS', 'JavaScript', 'Convex', 'Responsive Design'],
    category: 'Restaurant',
    live_url: 'https://butcherblock.erictomchik.com',
  },
  {
    title: 'Cosmos Café',
    description:
      'Captures the unique atmosphere of The Pearl Hotel\'s café with an immersive design that drives walk-in traffic. Guests browse the full menu and photo gallery on any device, and the built-in map ensures they find the Bay St. Louis location on the first try.',
    thumbnail_url: '/images/portfolio/cosmos.webp',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Restaurant',
    live_url: 'https://cosmos.erictomchik.com',
  },
  {
    title: "Dan B. Murphy's Restaurant & Bar",
    description:
      'Three floors of dining and entertainment showcased in one seamless site. Guests browse each floor\'s menu, see upcoming live music, view harbor-view galleries, and get directions — turning online visitors into seated customers.',
    thumbnail_url: '/images/portfolio/dan-b-murphys.webp',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Restaurant',
    live_url: 'https://danbs.erictomchik.com',
  },
  {
    title: 'Hen House Cocktail & Wine Bar',
    description:
      'Elegant design that matches the upscale atmosphere and sets guest expectations before they walk in. Visitors browse craft cocktails and artisan small plates with rich descriptions. Event listings and an immersive venue gallery keep regulars coming back.',
    thumbnail_url: '/images/portfolio/hen-house.webp',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Bar & Lounge',
    live_url: 'https://henhouse.erictomchik.com',
  },
  {
    title: "Lemoine's Landing Tiki Bar",
    description:
      'Vibrant waterfront tiki bar brought to life online. Visitors see the food, drinks, harbor views, and upcoming events — then show up. Mobile-optimized so tourists and locals can check the menu from anywhere along the Bay St. Louis strip.',
    thumbnail_url: '/images/portfolio/lemoines-landing.webp',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Bar & Restaurant',
    live_url: 'https://lemoines.erictomchik.com',
  },
  {
    title: "Rickey's on Coleman",
    description:
      "A 25-year legacy Waveland seafood restaurant modernized online. Showcases press coverage and customer reviews alongside the full Cajun/seafood menu — building trust with new visitors before their first visit. Directions and hours are one tap away on mobile.",
    thumbnail_url: '/images/portfolio/rickeys-on-coleman.webp',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'Responsive Design'],
    category: 'Restaurant',
    live_url: 'https://rickeys.erictomchik.com',
  },
  {
    title: 'The Ugly Pirate Cafe & Bar',
    description:
      "Captures the legendary personality of Bay St. Louis' favorite pirate-themed café. Press features, the full pizza and bar menu, and an events calendar drive both tourists and locals through the door. The fun branding makes the site as memorable as the restaurant.",
    thumbnail_url: '/images/portfolio/ugly-pirate.webp',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Cafe & Bar',
    live_url: 'https://uglypirate.erictomchik.com',
  },
  {
    title: 'Wicked Pig Kitchen & Bar',
    description:
      'Rich photography and smooth design showcase this modern bistro\'s food and cocktail menu. Guests can browse dishes, check the patio and venue, and see upcoming events on any device — filling tables during both lunch and dinner service.',
    thumbnail_url: '/images/portfolio/wicked-pig.webp',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Restaurant',
    live_url: 'https://wickedpig.erictomchik.com',
  },
  {
    title: 'Sparkles Travel Group',
    description:
      'Luxury travel agency where customers browse cruise and destination wedding packages, submit booking requests, and join a community portal — all in one place. Replaced a manual phone-and-email booking process with a streamlined online experience.',
    thumbnail_url: '/images/portfolio/sparkles-travel.png',
    technologies: ['HTML/CSS', 'JavaScript', 'Font Awesome', 'CSS Animations'],
    category: 'Travel & Tourism',
    live_url: 'https://sparkles.erictomchik.com',
  },
];

export default async function PortfolioPage() {
  let projects: typeof fallbackProjects;

  try {
    const dbProjects = await fetchQuery(api.portfolio.list, { activeOnly: true });
    projects =
      dbProjects.length > 0
        ? dbProjects.map((p) => ({
            title: p.title,
            description: p.description,
            thumbnail_url: p.thumbnail_url || '',
            technologies: p.technologies,
            category: p.category,
            live_url: p.live_url || '',
          }))
        : fallbackProjects;
  } catch {
    projects = fallbackProjects;
  }

  const portfolioJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Portfolio — Eric Tomchik',
    description: 'Web development portfolio by Eric Tomchik — custom websites for restaurants, bars, and businesses on the Mississippi Gulf Coast.',
    url: 'https://erictomchik.com/portfolio',
    author: {
      '@type': 'Person',
      name: 'Eric Tomchik',
      url: 'https://erictomchik.com',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'CreativeWork',
          name: p.title,
          description: p.description,
          image: p.thumbnail_url ? `https://erictomchik.com${p.thumbnail_url}` : undefined,
          keywords: p.technologies.join(', '),
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioJsonLd) }}
      />
    <div className="py-16">
      <div className="section-container">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400">
            <Code2 className="w-4 h-4" />
            Portfolio
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            My <span className="gradient-text">Work</span>
          </h1>
          <p className="text-surface-400 max-w-2xl mx-auto text-lg">
            Custom-built websites for restaurants, bars, and businesses on the Mississippi Gulf
            Coast. Every project is hand-coded with modern web technologies, responsive design,
            and attention to every detail.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-16">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white">{projects.length}</div>
            <div className="text-xs text-surface-400 mt-1">Projects</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white">100%</div>
            <div className="text-xs text-surface-400 mt-1">Custom Code</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-white">Gulf Coast</div>
            <div className="text-xs text-surface-400 mt-1">Based</div>
          </div>
        </div>

        {/* Project Grid */}
        <div className="space-y-20">
          {projects.map((project, i) => (
            <ScrollReveal key={project.title} animation={i % 2 === 0 ? 'fade-right' : 'fade-left'}>
            <div
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                i % 2 === 1 ? 'lg:direction-rtl' : ''
              }`}
            >
              {/* Image */}
              <div className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 to-brand-700/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative rounded-xl overflow-hidden border border-surface-800 shadow-2xl">
                    {project.thumbnail_url && (
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-950/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-brand-600/90 text-white text-xs font-medium backdrop-blur-sm">
                        {project.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`space-y-5 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {project.title}
                  </h2>
                </div>

                <p className="text-surface-300 leading-relaxed">{project.description}</p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md bg-surface-800 border border-surface-700
                                 text-xs text-surface-300 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* View Site link */}
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium transition-colors group/link"
                  >
                    View Site
                    <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                )}
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal animation="scale">
        <div className="mt-24 text-center">
          <div className="card p-12 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Build <span className="gradient-text">Your Website</span>?
            </h2>
            <p className="text-surface-400 mb-8 max-w-lg mx-auto">
              Whether you need a restaurant website, business platform, or custom web application —
              I bring the same level of craft and attention to every project.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary">
                Get a Free Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="/services" className="btn-secondary">
                <Code2 className="w-4 h-4 mr-2" />
                View Services
              </Link>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </div>
    </>
  );
}
