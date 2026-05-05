import { Metadata } from 'next';
import { PortfolioCard } from '@/components/ui/PortfolioCard';
import { Briefcase } from 'lucide-react';
import type { PortfolioProject } from '@/types';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'View my web development portfolio. Custom websites and applications built for real clients.',
};

// Sample data — replace with Supabase query
const sampleProjects: PortfolioProject[] = [
  {
    id: '1',
    title: 'Sample Client Website',
    slug: 'sample-client',
    description: 'A modern e-commerce website built with Next.js and Stripe for a boutique retail brand.',
    thumbnail_url: '/images/placeholder-project.png',
    images: [],
    live_url: 'https://example.com',
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'Stripe', 'Supabase'],
    category: 'E-Commerce',
    is_featured: true,
    is_active: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default async function PortfolioPage() {
  // When Supabase is connected:
  // const supabase = createServerSupabase();
  // const { data: projects } = await supabase
  //   .from('portfolio_projects')
  //   .select('*')
  //   .eq('is_active', true)
  //   .order('sort_order', { ascending: true });

  const projects = sampleProjects;

  return (
    <div className="py-16">
      <div className="section-container">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-brand-400">
            <Briefcase className="w-4 h-4" />
            Portfolio
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            My <span className="gradient-text">Work</span>
          </h1>
          <p className="text-surface-400 max-w-xl mx-auto">
            A selection of websites and applications I&apos;ve built for clients and personal projects.
          </p>
        </div>

        {/* Project grid */}
        {projects.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <PortfolioCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400">Portfolio projects coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
