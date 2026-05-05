'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Briefcase, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import type { PortfolioProject } from '@/types';

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);

  const supabase = createClient();

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('portfolio_projects')
      .select('*')
      .order('sort_order', { ascending: true });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const toggleActive = async (p: PortfolioProject) => {
    await supabase.from('portfolio_projects').update({ is_active: !p.is_active }).eq('id', p.id);
    fetchProjects();
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('portfolio_projects').delete().eq('id', id);
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio</h1>
          <p className="text-surface-400 mt-1">Manage your portfolio projects</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </button>
      </div>

      {showForm && (
        <ProjectForm
          project={editing}
          onSave={() => { setShowForm(false); fetchProjects(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-12 text-surface-400">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-10 h-10 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400">No projects yet. Add your first portfolio piece!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="card p-4 space-y-3">
              {p.thumbnail_url && (
                <img src={p.thumbnail_url} alt="" className="w-full h-32 rounded-lg object-cover" />
              )}
              <div>
                <h3 className="font-semibold text-white text-sm">{p.title}</h3>
                <p className="text-xs text-surface-400 mt-1 line-clamp-2">{p.description}</p>
              </div>
              {p.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.technologies.slice(0, 4).map((t) => (
                    <span key={t} className="px-1.5 py-0.5 bg-surface-800 rounded text-xs text-surface-400">{t}</span>
                  ))}
                  {p.technologies.length > 4 && (
                    <span className="text-xs text-surface-500">+{p.technologies.length - 4}</span>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-surface-800">
                <span className={`text-xs font-medium ${p.is_active ? 'text-green-400' : 'text-surface-500'}`}>
                  {p.is_active ? 'Active' : 'Hidden'}
                </span>
                <div className="flex gap-1">
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                       className="p-1.5 rounded hover:bg-surface-700 text-surface-400 hover:text-white">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button onClick={() => toggleActive(p)}
                          className="p-1.5 rounded hover:bg-surface-700 text-surface-400 hover:text-white">
                    {p.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => { setEditing(p); setShowForm(true); }}
                          className="p-1.5 rounded hover:bg-surface-700 text-surface-400 hover:text-white">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteProject(p.id)}
                          className="p-1.5 rounded hover:bg-red-900/30 text-surface-400 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project: PortfolioProject | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: project?.title || '',
    slug: project?.slug || '',
    description: project?.description || '',
    thumbnail_url: project?.thumbnail_url || '',
    live_url: project?.live_url || '',
    technologies: project?.technologies.join(', ') || '',
    category: project?.category || '',
    is_featured: project?.is_featured || false,
    is_active: project?.is_active ?? true,
    sort_order: project?.sort_order || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const technologies = form.technologies.split(',').map((t) => t.trim()).filter(Boolean);

    const data = { ...form, slug, technologies, images: project?.images || [] };
    delete (data as any).technologies;
    Object.assign(data, { technologies });

    if (project) {
      await supabase.from('portfolio_projects').update(data).eq('id', project.id);
    } else {
      await supabase.from('portfolio_projects').insert(data);
    }

    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">
        {project ? 'Edit Project' : 'Add New Project'}
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-surface-300 mb-1">Title *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-sm text-surface-300 mb-1">Category</label>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. E-Commerce, Portfolio, SaaS"
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-surface-300 mb-1">Description</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 resize-none" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-surface-300 mb-1">Thumbnail URL</label>
          <input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="block text-sm text-surface-300 mb-1">Live URL</label>
          <input value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-surface-300 mb-1">Technologies (comma-separated)</label>
        <input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })}
          placeholder="React, Next.js, Tailwind CSS, Supabase"
          className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : project ? 'Update Project' : 'Add Project'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
