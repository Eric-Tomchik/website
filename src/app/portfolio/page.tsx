import { Metadata } from 'next';
import Link from 'next/link';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../convex/_generated/api';
import { ArrowRight, Code2, ExternalLink, Lightbulb } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Web development portfolio by Eric Tomchik — showcase projects demonstrating custom restaurant websites, e-commerce, and web applications.',
};

// Fallback data in case Convex is empty (used during initial seed)
const fallbackProjects = [
  {
    title: 'Boonies on the Bayou',
    description:
      'Full-featured restaurant website with real-time menu management powered by Convex, online reservations, interactive Google Maps integration, image gallery, and live events calendar. Bay St. Louis, MS.',
    thumbnail_url: '/images/portfolio/boonies-on-the-bayou.png',
    technologies: ['HTML/CSS', 'JavaScript', 'Convex', 'Google Maps API'],
    category: 'Restaurant',
    live_url: 'https://preview-boonies-on-the-bayou-c3c54177.viktor.space/',
  },
  {
    title: 'Butcher Block Steak House & Bar',
    description:
      'Multi-location steakhouse site with Convex-powered dynamic menus, table reservation system, private events booking, catering request forms, and location-specific content for four Gulf Coast restaurants.',
    thumbnail_url: '/images/portfolio/butcher-block.png',
    technologies: ['HTML/CSS', 'JavaScript', 'Convex', 'Responsive Design'],
    category: 'Restaurant',
    live_url: 'https://preview-butcher-block-site-2206c411.viktor.space/butcherblock.html',
  },
  {
    title: 'Cosmos Café',
    description:
      'Immersive space-themed café website for The Pearl Hotel in Bay St. Louis. Features an animated menu system, photo gallery with lightbox, embedded maps, and bold cosmic visual design.',
    thumbnail_url: '/images/portfolio/cosmos.png',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Restaurant',
    live_url: 'https://preview-cosmos-bsl-7af4fc1f.viktor.space/cosmos.html',
  },
  {
    title: "Dan B. Murphy's Restaurant & Bar",
    description:
      'Three-floor restaurant and entertainment venue website featuring interactive menus, photo galleries of harbor views, live music event calendar, and responsive design showcasing decades of history.',
    thumbnail_url: '/images/portfolio/dan-b-murphys.png',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Restaurant',
    live_url: 'https://preview-dan-bs-bsl-79b3a67f.viktor.space/danbs.html',
  },
  {
    title: 'Hen House Cocktail & Wine Bar',
    description:
      'Upscale cocktail bar website with elegant dark design, curated drink menus with detailed descriptions, artisan small plates showcase, event listings, and an immersive gallery of the venue.',
    thumbnail_url: '/images/portfolio/hen-house.png',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Bar & Lounge',
    live_url: 'https://hen-house-bsl-c6861667.viktor.space/henhouse.html',
  },
  {
    title: "Lemoine's Landing Tiki Bar",
    description:
      'Tropical-themed waterfront bar website with vibrant visual design, food and drink menus, photo gallery of harbor views, embedded maps, and event information for the Bay St. Louis hotspot.',
    thumbnail_url: '/images/portfolio/lemoines-landing.png',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Bar & Restaurant',
    live_url: 'https://preview-lemoines-landing-d7a7aff8.viktor.space/lemoines.html',
  },
  {
    title: "Rickey's on Coleman",
    description:
      "Redesigned website for Waveland's beloved 25-year legacy seafood restaurant. Features comprehensive Cajun/seafood menus, press coverage showcase, customer review integration, and location mapping.",
    thumbnail_url: '/images/portfolio/rickeys-on-coleman.png',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'Responsive Design'],
    category: 'Restaurant',
    live_url: 'https://rickeys-on-coleman-980a4959.viktor.space/',
  },
  {
    title: 'The Ugly Pirate Cafe & Bar',
    description:
      "Personality-packed website for a legendary Bay St. Louis pirate-themed café and bar. Features extensive press/article showcase, full pizza and menu system, events calendar, contact forms, and fun pirate branding.",
    thumbnail_url: '/images/portfolio/ugly-pirate.png',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Cafe & Bar',
    live_url: 'https://ugly-pirate-13a0ae30.viktor.space/',
  },
  {
    title: 'Wicked Pig Kitchen & Bar',
    description:
      'Modern bistro website with rich photography, comprehensive food and cocktail menus, photo gallery, patio and venue showcase, event listings, and smooth scroll animations throughout.',
    thumbnail_url: '/images/portfolio/wicked-pig.png',
    technologies: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    category: 'Restaurant',
    live_url: 'https://wicked-pig-bsl-d1b371ec.viktor.space/wickedpig.html',
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
    description: 'Web development portfolio by Eric Tomchik — restaurant websites, e-commerce, and custom web applications.',
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
            Showcase projects demonstrating custom-built websites for restaurants, bars, and
            businesses on the Mississippi Gulf Coast. Each project is hand-coded with modern web
            technologies, responsive design, and attention to every detail.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600/10 border border-brand-600/20 text-sm text-brand-300">
            <Lightbulb className="w-4 h-4 flex-shrink-0" />
            <span>These are personal concept projects — demonstrating what I can build for <strong className="text-brand-200">your</strong> business.</span>
          </div>
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
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-brand-600/90 text-white text-xs font-medium backdrop-blur-sm">
                        {project.category}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-surface-900/80 text-surface-300 text-xs font-medium backdrop-blur-sm border border-surface-700/50">
                        Concept Project
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
