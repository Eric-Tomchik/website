'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { usePortalAuth } from '../../PortalAuthContext';
import { useState } from 'react';
import {
  FileText,
  Download,
  Filter,
  FileSpreadsheet,
  FileCheck,
  File,
  Receipt,
  ScrollText,
  Package,
} from 'lucide-react';

const categoryIcons: Record<string, typeof FileText> = {
  contract: ScrollText,
  invoice: Receipt,
  proposal: FileSpreadsheet,
  deliverable: Package,
  brief: FileCheck,
  other: File,
};

const categoryLabels: Record<string, string> = {
  contract: 'Contract',
  invoice: 'Invoice',
  proposal: 'Proposal',
  deliverable: 'Deliverable',
  brief: 'Project Brief',
  other: 'Other',
};

const categoryColors: Record<string, string> = {
  contract: 'bg-blue-500/10 text-blue-400',
  invoice: 'bg-green-500/10 text-green-400',
  proposal: 'bg-purple-500/10 text-purple-400',
  deliverable: 'bg-brand-500/10 text-brand-400',
  brief: 'bg-yellow-500/10 text-yellow-400',
  other: 'bg-surface-500/10 text-surface-400',
};

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PortalDocumentsPage() {
  const { client } = usePortalAuth();
  const documents = useQuery(
    api.clientDocuments.list,
    client ? { clientId: client._id } : 'skip'
  ) ?? [];
  const projects = useQuery(
    api.projects.list,
    client ? { clientId: client._id } : 'skip'
  ) ?? [];
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? documents : documents.filter((d) => d.category === filter);

  const categories = ['all', 'contract', 'invoice', 'proposal', 'deliverable', 'brief', 'other'];
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = cat === 'all' ? documents.length : documents.filter((d) => d.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const p = projects.find((pr) => pr._id === projectId);
    return p?.title;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <p className="text-surface-400 mt-1">Contracts, invoices, proposals, and project deliverables.</p>
      </div>

      {documents.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No documents yet</h3>
          <p className="text-surface-400 text-sm">Documents shared with you will appear here.</p>
        </div>
      ) : (
        <>
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) =>
              categoryCounts[cat] > 0 || cat === 'all' ? (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filter === cat
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-800 text-surface-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All' : categoryLabels[cat]}
                  <span className="ml-1.5 opacity-70">{categoryCounts[cat]}</span>
                </button>
              ) : null
            )}
          </div>

          {/* Document list */}
          <div className="space-y-2">
            {filtered.map((doc) => {
              const Icon = categoryIcons[doc.category] || FileText;
              const projectName = getProjectName(doc.project_id as string | undefined);

              return (
                <div
                  key={doc._id}
                  className="card flex items-center gap-4 p-4"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColors[doc.category] || ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{doc.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-surface-500">{categoryLabels[doc.category]}</span>
                      {projectName && (
                        <>
                          <span className="text-surface-600">·</span>
                          <span className="text-xs text-surface-500">{projectName}</span>
                        </>
                      )}
                      {doc.file_size_bytes && (
                        <>
                          <span className="text-surface-600">·</span>
                          <span className="text-xs text-surface-500">{formatBytes(doc.file_size_bytes)}</span>
                        </>
                      )}
                    </div>
                    {doc.notes && (
                      <p className="text-xs text-surface-500 mt-1">{doc.notes}</p>
                    )}
                  </div>
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-surface-800 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
