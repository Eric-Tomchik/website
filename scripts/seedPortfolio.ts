import { mutation } from "./_generated/server";

const portfolioProjects = [
  {
    title: "Boonies on the Bayou",
    slug: "boonies-on-the-bayou",
    description:
      "Full-featured restaurant website with real-time menu management powered by Convex, online reservations, interactive Google Maps integration, image gallery, and live events calendar. Bay St. Louis, MS.",
    thumbnail_url: "/images/portfolio/boonies-on-the-bayou.png",
    images: [],
    technologies: ["HTML/CSS", "JavaScript", "Convex", "Google Maps API"],
    category: "Restaurant",
    is_featured: true,
    is_active: true,
    sort_order: 1,
  },
  {
    title: "Butcher Block Steak House & Bar",
    slug: "butcher-block-steak-house-bar",
    description:
      "Multi-location steakhouse site with Convex-powered dynamic menus, table reservation system, private events booking, catering request forms, and location-specific content for four Gulf Coast restaurants.",
    thumbnail_url: "/images/portfolio/butcher-block.png",
    images: [],
    technologies: ["HTML/CSS", "JavaScript", "Convex", "Responsive Design"],
    category: "Restaurant",
    is_featured: true,
    is_active: true,
    sort_order: 2,
  },
  {
    title: "Cosmos Café",
    slug: "cosmos-cafe",
    description:
      "Immersive space-themed café website for The Pearl Hotel in Bay St. Louis. Features an animated menu system, photo gallery with lightbox, embedded maps, and bold cosmic visual design.",
    thumbnail_url: "/images/portfolio/cosmos.png",
    images: [],
    technologies: ["HTML/CSS", "JavaScript", "Google Maps API", "CSS Animations"],
    category: "Restaurant",
    is_featured: false,
    is_active: true,
    sort_order: 3,
  },
  {
    title: "Dan B. Murphy's Restaurant & Bar",
    slug: "dan-b-murphys",
    description:
      "Three-floor restaurant and entertainment venue website featuring interactive menus, photo galleries of harbor views, live music event calendar, and responsive design showcasing decades of history.",
    thumbnail_url: "/images/portfolio/dan-b-murphys.png",
    images: [],
    technologies: ["HTML/CSS", "JavaScript", "Google Maps API", "CSS Animations"],
    category: "Restaurant",
    is_featured: false,
    is_active: true,
    sort_order: 4,
  },
  {
    title: "Hen House Cocktail & Wine Bar",
    slug: "hen-house-cocktail-wine-bar",
    description:
      "Upscale cocktail bar website with elegant dark design, curated drink menus with detailed descriptions, artisan small plates showcase, event listings, and an immersive gallery of the venue.",
    thumbnail_url: "/images/portfolio/hen-house.png",
    images: [],
    technologies: ["HTML/CSS", "JavaScript", "Google Maps API", "CSS Animations"],
    category: "Bar & Lounge",
    is_featured: false,
    is_active: true,
    sort_order: 5,
  },
  {
    title: "Lemoine's Landing Tiki Bar",
    slug: "lemoines-landing-tiki-bar",
    description:
      "Tropical-themed waterfront bar website with vibrant visual design, food and drink menus, photo gallery of harbor views, embedded maps, and event information for the Bay St. Louis hotspot.",
    thumbnail_url: "/images/portfolio/lemoines-landing.png",
    images: [],
    technologies: ["HTML/CSS", "JavaScript", "Google Maps API", "CSS Animations"],
    category: "Bar & Restaurant",
    is_featured: false,
    is_active: true,
    sort_order: 6,
  },
  {
    title: "Rickey's on Coleman",
    slug: "rickeys-on-coleman",
    description:
      "Redesigned website for Waveland's beloved 25-year legacy seafood restaurant. Features comprehensive Cajun/seafood menus, press coverage showcase, customer review integration, and location mapping.",
    thumbnail_url: "/images/portfolio/rickeys-on-coleman.png",
    images: [],
    technologies: ["HTML/CSS", "JavaScript", "Google Maps API", "Responsive Design"],
    category: "Restaurant",
    is_featured: false,
    is_active: true,
    sort_order: 7,
  },
  {
    title: "The Ugly Pirate Cafe & Bar",
    slug: "the-ugly-pirate-cafe-bar",
    description:
      "Personality-packed website for a legendary Bay St. Louis pirate-themed café and bar. Features extensive press/article showcase, full pizza and menu system, events calendar, contact forms, and fun pirate branding.",
    thumbnail_url: "/images/portfolio/ugly-pirate.png",
    images: [],
    technologies: ["HTML/CSS", "JavaScript", "Google Maps API", "CSS Animations"],
    category: "Cafe & Bar",
    is_featured: false,
    is_active: true,
    sort_order: 8,
  },
  {
    title: "Wicked Pig Kitchen & Bar",
    slug: "wicked-pig-kitchen-bar",
    description:
      "Modern bistro website with rich photography, comprehensive food and cocktail menus, photo gallery, patio and venue showcase, event listings, and smooth scroll animations throughout.",
    thumbnail_url: "/images/portfolio/wicked-pig.png",
    images: [],
    technologies: ["HTML/CSS", "JavaScript", "Google Maps API", "CSS Animations"],
    category: "Restaurant",
    is_featured: true,
    is_active: true,
    sort_order: 9,
  },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if any portfolio projects already exist
    const existing = await ctx.db.query("portfolio_projects").collect();
    if (existing.length > 0) {
      return { status: "skipped", message: `Already ${existing.length} portfolio projects in database` };
    }

    for (const project of portfolioProjects) {
      await ctx.db.insert("portfolio_projects", project);
    }

    return { status: "seeded", count: portfolioProjects.length };
  },
});
