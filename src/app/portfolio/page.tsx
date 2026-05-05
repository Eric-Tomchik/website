import { Metadata } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../convex/_generated/api';
import { PortfolioCard } from '@/components/ui/PortfolioCard';
import { Briefcase } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'View my web development portfolio. Custom websites and applications built for real clients.',
};

export default async function PortfolioPage() {
  const projects = await fetchQuery(api.portfolio.list, { activeOnly: true });

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
        {projects && projects.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <PortfolioCard key={project._id} project={project} />
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
