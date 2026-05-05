import { ExternalLink, Github, Briefcase } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  live_url?: string;
  github_url?: string;
  technologies: string[];
  category: string;
  is_featured: boolean;
}

export function PortfolioCard({ project }: { project: Project }) {
  return (
    <div className="card group flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-surface-800 overflow-hidden">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Briefcase className="w-10 h-10 text-surface-600" />
          </div>
        )}
        {project.is_featured && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-brand-600
                          text-xs font-semibold text-white">
            Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs text-brand-400 font-medium uppercase tracking-wider mb-1">
          {project.category}
        </span>
        <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
        <p className="text-sm text-surface-400 mb-4 flex-1 line-clamp-3">
          {project.description}
        </p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded text-xs bg-surface-800 text-surface-400"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-2">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 text-sm py-2"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Live Demo
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm py-2 px-3"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
