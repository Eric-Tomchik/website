'use client';

import { useMemo, useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';
import {
  Columns3,
  User,
  Calendar,
  GripVertical,
  ChevronRight,
} from 'lucide-react';

type ProjectStatus = 'discovery' | 'proposal' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled';

const COLUMNS: { status: ProjectStatus; label: string; color: string; bg: string }[] = [
  { status: 'discovery', label: 'Discovery', color: 'text-surface-400', bg: 'bg-surface-500/20' },
  { status: 'proposal', label: 'Proposal', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  { status: 'in_progress', label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { status: 'review', label: 'Review', color: 'text-violet-400', bg: 'bg-violet-500/20' },
  { status: 'completed', label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20' },
];

export default function KanbanPage() {
  const projects = useAdminQuery(api.projects.list, {}) ?? [];
  const clients = useAdminQuery(api.clients.list, {}) ?? [];
  const updateProject = useAdminMutation(api.projects.update);

  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((c) => map.set(c._id, c.name));
    return map;
  }, [clients]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof projects> = {};
    COLUMNS.forEach((c) => { map[c.status] = []; });
    projects.forEach((p) => {
      const status = p.status || 'discovery';
      if (map[status]) map[status].push(p);
      else if (map['discovery']) map['discovery'].push(p);
    });
    return map;
  }, [projects]);

  const handleDragStart = (projectId: string) => {
    setDragging(projectId);
  };

  const handleDrop = async (newStatus: ProjectStatus) => {
    if (!dragging) return;
    const project = projects.find((p) => p._id === dragging);
    if (project && project.status !== newStatus) {
      await updateProject({ id: project._id as Id<'projects'>, status: newStatus });
    }
    setDragging(null);
    setDragOver(null);
  };

  const moveProject = async (projectId: string) => {
    const project = projects.find((p) => p._id === projectId);
    if (!project) return;
    const currentIdx = COLUMNS.findIndex((c) => c.status === project.status);
    if (currentIdx < COLUMNS.length - 1) {
      await updateProject({
        id: project._id as Id<'projects'>,
        status: COLUMNS[currentIdx + 1].status,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Columns3 className="w-7 h-7 text-brand-400" />
          Project Kanban
        </h1>
        <p className="text-surface-400 mt-1">
          Drag and drop to update project status · {projects.length} total projects
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[70vh]">
        {COLUMNS.map((col) => {
          const colProjects = grouped[col.status] || [];
          return (
            <div
              key={col.status}
              className={`flex-shrink-0 w-72 rounded-xl transition-colors ${
                dragOver === col.status ? 'bg-brand-500/10 ring-2 ring-brand-500/30' : 'bg-surface-900/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.status); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col.status)}
            >
              {/* Column Header */}
              <div className="p-3 flex items-center justify-between border-b border-surface-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.bg.replace('/20', '')}`} />
                  <h3 className={`font-semibold text-sm ${col.color}`}>{col.label}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${col.bg} ${col.color}`}>
                  {colProjects.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 min-h-[200px]">
                {colProjects.map((project) => (
                  <div
                    key={project._id}
                    draggable
                    onDragStart={() => handleDragStart(project._id)}
                    onDragEnd={() => { setDragging(null); setDragOver(null); }}
                    className={`card p-3 cursor-grab active:cursor-grabbing transition-all ${
                      dragging === project._id ? 'opacity-50 scale-95' : 'hover:border-brand-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-surface-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{project.title}</p>
                        {project.description && (
                          <p className="text-surface-400 text-xs mt-1 line-clamp-2">{project.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {project.client_id && (
                            <span className="text-xs text-surface-400 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {clientMap.get(project.client_id) || 'Client'}
                            </span>
                          )}
                          {project.target_date && (
                            <span className="text-xs text-surface-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(project.target_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {/* Progress bar */}
                        {project.progress_percent > 0 && (
                          <div className="mt-2 w-full h-1 bg-surface-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-500 rounded-full"
                              style={{ width: `${project.progress_percent}%` }}
                            />
                          </div>
                        )}
                        {/* Quick advance button */}
                        {col.status !== 'completed' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); moveProject(project._id); }}
                            className="mt-2 text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5"
                          >
                            Move to {COLUMNS[COLUMNS.findIndex((c) => c.status === col.status) + 1]?.label}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {colProjects.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-surface-600 text-xs">
                    Drop projects here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
