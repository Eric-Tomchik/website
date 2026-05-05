'use client';

import Image from 'next/image';
import { ExternalLink, Github } from 'lucide-react';

interface PortfolioCardProps {
  project: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail_url?: string;
    live_url?: string;
    github_url?: string;
    technologies: string[];
    category: string;
  };
}

export function PortfolioCard({ project }: PortfolioCardProps) {
  return (
    <div className="card group">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={project.thumbnail_url || '/images/placeholder-project.png'}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="flex gap-2">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-1.5 px-3"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Live Site
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <Github className="w-3.5 h-3.5 mr-1" />
                Code
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-brand-400 uppercase tracking-wider">
            {project.category}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-surface-400 line-clamp-2">{project.description}</p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded-md bg-surface-800 text-xs text-surface-300"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-2 py-0.5 rounded-md bg-surface-800 text-xs text-surface-400">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
