import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Code2, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Web development portfolio by Eric Tomchik — restaurant websites, e-commerce, and custom web applications on the Mississippi Gulf Coast.',
};

interface Project {
  name: string;
  tagline: string;
  description: string;
  image: string;
  category: string;
  tech: string[];
  features: string[];
}

const projects: Project[] = [
  {
    name: 'Boonies on the Bayou',
    tagline: 'Smoked Meats, Seafood & Southern Soul',
    description:
      'Full-featured restaurant website with real-time menu management powered by Convex, online reservations, interactive Google Maps integration, image gallery, and live events calendar. Bay St. Louis, MS.',
    image: '/images/portfolio/boonies-on-the-bayou.jpg',
    category: 'Restaurant',
    tech: ['HTML/CSS', 'JavaScript', 'Convex', 'Google Maps API'],
    features: ['Real-Time Menus', 'Reservations', 'Events Calendar', 'Image Gallery', 'Maps'],
  },
  {
    name: 'Butcher Block Steak House & Bar',
    tagline: 'Premium Hand-Cut Steaks & Gulf Seafood',
    description:
      'Multi-location steakhouse site with Convex-powered dynamic menus, table reservation system, private events booking, catering request forms, and location-specific content for four Gulf Coast restaurants.',
    image: '/images/portfolio/butcher-block.jpg',
    category: 'Restaurant',
    tech: ['HTML/CSS', 'JavaScript', 'Convex', 'Responsive Design'],
    features: ['Multi-Location', 'Reservations', 'Dynamic Menus', 'Catering', 'Contact Forms'],
  },
  {
    name: 'Cosmos Café',
    tagline: 'Space-Themed Breakfast & Lunch',
    description:
      'Immersive space-themed café website for The Pearl Hotel in Bay St. Louis. Features an animated menu system, photo gallery with lightbox, embedded maps, and bold cosmic visual design.',
    image: '/images/portfolio/cosmos.jpg',
    category: 'Restaurant',
    tech: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    features: ['Themed Design', 'Animated Menus', 'Photo Gallery', 'Maps Integration'],
  },
  {
    name: "Dan B. Murphy's Restaurant & Bar",
    tagline: 'A Bay St. Louis Landmark Since 1981',
    description:
      'Three-floor restaurant and entertainment venue website featuring interactive menus, photo galleries of harbor views, live music event calendar, and responsive design showcasing decades of history.',
    image: '/images/portfolio/dan-b-murphys.jpg',
    category: 'Restaurant',
    tech: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    features: ['Multi-Floor Layout', 'Event Calendar', 'Photo Gallery', 'Interactive Menus', 'Maps'],
  },
  {
    name: 'Hen House Cocktail & Wine Bar',
    tagline: 'Elevated Cocktails in the Depot District',
    description:
      'Upscale cocktail bar website with elegant dark design, curated drink menus with detailed descriptions, artisan small plates showcase, event listings, and an immersive gallery of the venue.',
    image: '/images/portfolio/hen-house.jpg',
    category: 'Bar & Lounge',
    tech: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    features: ['Cocktail Menus', 'Event Listings', 'Venue Gallery', 'Elegant Dark Theme', 'Maps'],
  },
  {
    name: "Lemoine's Landing Tiki Bar",
    tagline: 'Waterfront Tiki Bar on Beach Boulevard',
    description:
      'Tropical-themed waterfront bar website with vibrant visual design, food and drink menus, photo gallery of harbor views, embedded maps, and event information for the Bay St. Louis hotspot.',
    image: '/images/portfolio/lemoines-landing.jpg',
    category: 'Bar & Restaurant',
    tech: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    features: ['Tropical Theme', 'Menu System', 'Photo Gallery', 'Events', 'Maps Integration'],
  },
  {
    name: "Rickey's on Coleman",
    tagline: 'Gulf Coast Seafood & Cajun Cuisine',
    description:
      'Redesigned website for Waveland\'s beloved 25-year legacy seafood restaurant. Features comprehensive Cajun/seafood menus, press coverage showcase, customer review integration, and location mapping.',
    image: '/images/portfolio/rickeys-on-coleman.jpg',
    category: 'Restaurant',
    tech: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'Responsive Design'],
    features: ['Full Menu System', 'Press Coverage', 'Review Integration', 'Maps', 'Responsive'],
  },
  {
    name: 'The Ugly Pirate Cafe & Bar',
    tagline: "Mississippi's First Official Pirate Pub",
    description:
      'Personality-packed website for a legendary Bay St. Louis pirate-themed café and bar. Features extensive press/article showcase, full pizza and menu system, events calendar, contact forms, and fun pirate branding.',
    image: '/images/portfolio/ugly-pirate.jpg',
    category: 'Cafe & Bar',
    tech: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    features: ['Press Showcase', 'Full Menus', 'Events Calendar', 'Contact Forms', 'Themed Design'],
  },
  {
    name: 'Wicked Pig Kitchen & Bar',
    tagline: 'Southern-Inspired Bistro & Bar',
    description:
      'Modern bistro website with rich photography, comprehensive food and cocktail menus, photo gallery, patio and venue showcase, event listings, and smooth scroll animations throughout.',
    image: '/images/portfolio/wicked-pig.jpg',
    category: 'Restaurant',
    tech: ['HTML/CSS', 'JavaScript', 'Google Maps API', 'CSS Animations'],
    features: ['Menu System', 'Photo Gallery', 'Event Listings', 'Smooth Animations', 'Maps'],
  },
];

const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))];

export default function PortfolioPage() {
  return (
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
            Custom-built websites for restaurants, bars, and businesses across the Mississippi Gulf
            Coast. Each project is hand-coded with modern web technologies, responsive design,
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
            <div
              key={project.name}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                i % 2 === 1 ? 'lg:direction-rtl' : ''
              }`}
            >
              {/* Image */}
              <div className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 to-brand-700/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative rounded-xl overflow-hidden border border-surface-800 shadow-2xl">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full aspect-[8/5] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
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
                    {project.name}
                  </h2>
                  <p className="text-brand-400 font-medium">{project.tagline}</p>
                </div>

                <p className="text-surface-300 leading-relaxed">{project.description}</p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md bg-surface-800 border border-surface-700
                                 text-xs text-surface-300 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2">
                  {project.features.map((f) => (
                    <span
                      key={f}
                      className="px-2.5 py-1 rounded-full bg-brand-600/10 border border-brand-600/20
                                 text-xs text-brand-400 font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
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
      </div>
    </div>
  );
}
