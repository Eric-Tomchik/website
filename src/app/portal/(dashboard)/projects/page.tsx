'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { usePortalAuth } from '../../PortalAuthContext';
import { useState } from 'react';
import {
  FolderKanban,
  Calendar,
  Globe,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Target,
} from 'lucide-react';
import { Id } from '../../../../../convex/_generated/dataModel';

const statusColors: Record<string, string> = {
  discovery: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  proposal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  review: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  on_hold: 'bg-surface-500/10 text-surface-400 border-surface-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusLabels: Record<string, string> = {
  discovery: 'Discovery',
  proposal: 'Proposal',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

const tierLabels: Record<string, string> = {
  starter: 'Starter — $1,500',
  business_pro: 'Business Pro — $3,500',
  custom: 'Custom App — $7,500+',
};

function MilestoneList({ projectId }: { projectId: Id<'projects'> }) {
  const milestones = useQuery(api.milestones.list, { projectId }) ?? [];

  if (milestones.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-surface-800">
      <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Milestones</h4>
      <div className="space-y-2">
        {milestones.map((m, i) => (
          <div key={m._id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                m.status === 'completed'
                  ? 'bg-green-500 border-green-500'
                  : m.status === 'in_progress'
                  ? 'border-brand-500 bg-brand-500/20'
                  : 'border-surface-600 bg-surface-800'
              }`}>
                {m.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              {i < milestones.length - 1 && (
                <div className={`w-0.5 h-6 ${m.status === 'completed' ? 'bg-green-500/30' : 'bg-surface-700'}`} />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <div className={`text-sm font-medium ${m.status === 'completed' ? 'text-surface-400 line-through' : 'text-white'}`}>
                {m.title}
              </div>
              {m.due_date && (
                <div className="text-xs text-surface-500 mt-0.5">
                  {m.status === 'completed' ? `Completed ${m.completed_date || ''}` : `Due ${m.due_date}`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortalProjectsPage() {
  const { client } = usePortalAuth();
  const projects = useQuery(
    api.projects.list,
    client ? { clientId: client._id } : 'skip'
  ) ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const active = projects.filter((p) => !['completed', 'cancelled'].includes(p.status));
  const completed = projects.filter((p) => p.status === 'completed');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Projects</h1>
        <p className="text-surface-400 mt-1">Track the progress of your web development projects.</p>
      </div>

      {projects.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderKanban className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-surface-400 text-sm">Your projects will appear here once they&apos;re set up.</p>
        </div>
      ) : (
        <>
          {/* Active Projects */}
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">
                Active ({active.length})
              </h2>
              <div className="space-y-4">
                {active.map((project) => {
                  const isExpanded = expandedId === project._id;
                  return (
                    <div key={project._id} className="card overflow-hidden">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : project._id)}
                        className="w-full p-5 text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-surface-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-surface-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <h3 className="text-white font-semibold">{project.title}</h3>
                              {project.description && (
                                <p className="text-sm text-surface-400 mt-1">{project.description}</p>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[project.status] || ''}`}>
                            {statusLabels[project.status] || project.status}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="flex items-center gap-3 mt-4 ml-8">
                          <div className="flex-1 h-2.5 rounded-full bg-surface-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all"
                              style={{ width: `${project.progress_percent}%` }}
                            />
                          </div>
                          <span className="text-sm text-white font-semibold">{project.progress_percent}%</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 ml-8 space-y-4">
                          {/* Meta info */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {project.service_tier && (
                              <div className="p-3 rounded-lg bg-surface-900/50">
                                <div className="text-xs text-surface-500">Plan</div>
                                <div className="text-sm text-white font-medium mt-0.5">
                                  {tierLabels[project.service_tier] || project.service_tier}
                                </div>
                              </div>
                            )}
                            {project.start_date && (
                              <div className="p-3 rounded-lg bg-surface-900/50">
                                <div className="text-xs text-surface-500">Started</div>
                                <div className="text-sm text-white font-medium mt-0.5 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {project.start_date}
                                </div>
                              </div>
                            )}
                            {project.target_date && (
                              <div className="p-3 rounded-lg bg-surface-900/50">
                                <div className="text-xs text-surface-500">Target</div>
                                <div className="text-sm text-white font-medium mt-0.5 flex items-center gap-1">
                                  <Target className="w-3 h-3" /> {project.target_date}
                                </div>
                              </div>
                            )}
                            {project.live_url && (
                              <div className="p-3 rounded-lg bg-surface-900/50">
                                <div className="text-xs text-surface-500">Live Site</div>
                                <a
                                  href={project.live_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-brand-400 hover:text-brand-300 font-medium mt-0.5 flex items-center gap-1"
                                >
                                  <Globe className="w-3 h-3" /> Visit
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Milestones */}
                          <MilestoneList projectId={project._id} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Projects */}
          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">
                Completed ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map((project) => (
                  <div key={project._id} className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <h3 className="text-white font-medium">{project.title}</h3>
                        <div className="text-xs text-surface-500">
                          Completed {project.completed_date || ''}
                          {project.service_tier && ` · ${tierLabels[project.service_tier]?.split(' —')[0] || project.service_tier}`}
                        </div>
                      </div>
                    </div>
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1"
                      >
                        <Globe className="w-4 h-4" /> Visit
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
