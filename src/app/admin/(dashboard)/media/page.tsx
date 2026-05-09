'use client';

import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import {
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';
  FolderOpen,
  Image,
  FileText,
  Film,
  File,
  Trash2,
  Pencil,
  Search,
  Grid3X3,
  List,
  HardDrive,
  Copy,
  Check,
  X,
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type FileType = 'all' | 'image' | 'pdf' | 'document' | 'video' | 'other';

const typeIcons: Record<string, typeof Image> = {
  image: Image,
  pdf: FileText,
  document: FileText,
  video: Film,
  other: File,
};

const typeColors: Record<string, string> = {
  image: 'text-green-400',
  pdf: 'text-red-400',
  document: 'text-blue-400',
  video: 'text-violet-400',
  other: 'text-surface-400',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryPage() {
  const files = useAdminQuery(api.mediaFiles.list, {}) ?? [];
  const stats = useAdminQuery(api.mediaFiles.stats);
  const remove = useAdminMutation(api.mediaFiles.remove);
  const update = useAdminMutation(api.mediaFiles.update);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FileType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editingId, setEditingId] = useState<Id<'media_files'> | null>(null);
  const [editName, setEditName] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = files.filter((f) => {
    if (typeFilter !== 'all' && f.file_type !== typeFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openEdit = (file: (typeof files)[0]) => {
    setEditingId(file._id);
    setEditName(file.name);
    setEditAlt(file.alt_text || '');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await update({ id: editingId, name: editName, alt_text: editAlt });
    setEditingId(null);
  };

  const copyUrl = (url: string | undefined) => {
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedId(url);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FolderOpen className="w-7 h-7 text-brand-400" />
            Media Library
          </h1>
          <p className="text-surface-400 mt-1">Manage uploaded files and images</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-brand-400" />
            <div>
              <p className="text-xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-surface-400">Total Files</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <Image className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-xl font-bold text-white">{stats.byType['image'] || 0}</p>
              <p className="text-xs text-surface-400">Images</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <FileText className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-xl font-bold text-white">{(stats.byType['pdf'] || 0) + (stats.byType['document'] || 0)}</p>
              <p className="text-xs text-surface-400">Documents</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-violet-400" />
            <div>
              <p className="text-xl font-bold text-white">{formatFileSize(stats.totalSize)}</p>
              <p className="text-xs text-surface-400">Total Size</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white placeholder:text-surface-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex gap-1 bg-surface-800 rounded-lg p-1">
          {(['all', 'image', 'pdf', 'document', 'video'] as FileType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                typeFilter === t ? 'bg-brand-500 text-white' : 'text-surface-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-surface-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-brand-500 text-white' : 'text-surface-400'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-surface-400'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
          <div className="card p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Edit File</h2>
              <button onClick={() => setEditingId(null)} className="text-surface-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">Alt Text</label>
              <input
                value={editAlt}
                onChange={(e) => setEditAlt(e.target.value)}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                placeholder="Describe the file for accessibility"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingId(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={saveEdit} className="btn-primary text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((file) => {
            const Icon = typeIcons[file.file_type] || File;
            const color = typeColors[file.file_type] || 'text-surface-400';
            return (
              <div key={file._id} className="card p-3 group hover:border-brand-500/30 transition-colors">
                <div className="aspect-square bg-surface-800 rounded-lg flex items-center justify-center mb-3">
                  {file.file_type === 'image' && file.url ? (
                    <img src={file.url} alt={file.alt_text || file.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Icon className={`w-12 h-12 ${color}`} />
                  )}
                </div>
                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                <p className="text-surface-500 text-xs">{formatFileSize(file.file_size_bytes)}</p>
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.url && (
                    <button onClick={() => copyUrl(file.url)} className="p-1 text-surface-400 hover:text-brand-400" title="Copy URL">
                      {copiedId === file.url ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button onClick={() => openEdit(file)} className="p-1 text-surface-400 hover:text-brand-400" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this file?')) remove({ id: file._id }); }}
                    className="p-1 text-surface-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-surface-500">
              {search ? 'No files match your search' : 'No files uploaded yet'}
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700 bg-surface-900/40">
                <th className="text-left py-3 px-4 text-surface-400 font-semibold">Name</th>
                <th className="text-left py-3 px-4 text-surface-400 font-semibold">Type</th>
                <th className="text-left py-3 px-4 text-surface-400 font-semibold">Size</th>
                <th className="text-left py-3 px-4 text-surface-400 font-semibold">Uploaded</th>
                <th className="text-right py-3 px-4 text-surface-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filtered.map((file) => {
                const Icon = typeIcons[file.file_type] || File;
                const color = typeColors[file.file_type] || 'text-surface-400';
                return (
                  <tr key={file._id} className="hover:bg-surface-800/40">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                      <span className="text-white truncate">{file.name}</span>
                    </td>
                    <td className="py-3 px-4 text-surface-300 capitalize">{file.file_type}</td>
                    <td className="py-3 px-4 text-surface-300">{formatFileSize(file.file_size_bytes)}</td>
                    <td className="py-3 px-4 text-surface-300 text-xs">
                      {new Date(file._creationTime).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        {file.url && (
                          <button onClick={() => copyUrl(file.url)} className="p-1.5 text-surface-400 hover:text-brand-400" title="Copy URL">
                            {copiedId === file.url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        )}
                        <button onClick={() => openEdit(file)} className="p-1.5 text-surface-400 hover:text-brand-400">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this file?')) remove({ id: file._id }); }}
                          className="p-1.5 text-surface-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-surface-500">No files yet</td>
                </tr>
              )}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
