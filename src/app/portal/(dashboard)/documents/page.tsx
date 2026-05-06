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
  Eye,
  X,
  PenLine,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
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

const sigStatusConfig: Record<string, { icon: typeof CheckCircle2 | null; class: string; label: string; bg: string }> = {
  not_required: { icon: null, class: '', label: '', bg: '' },
  pending: { icon: Clock, class: 'text-surface-400', label: 'Awaiting signature', bg: 'bg-surface-800' },
  sent: { icon: PenLine, class: 'text-blue-400', label: 'Ready to sign', bg: 'bg-blue-500/10' },
  viewed: { icon: PenLine, class: 'text-yellow-400', label: 'Ready to sign', bg: 'bg-yellow-500/10' },
  signed: { icon: CheckCircle2, class: 'text-green-400', label: 'Signed', bg: 'bg-green-500/10' },
  declined: { icon: AlertCircle, class: 'text-red-400', label: 'Declined', bg: 'bg-red-500/10' },
};

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Component for downloading Convex-stored files
function StorageDownloadLink({ storageId, name }: { storageId: string; name: string }) {
  const url = useQuery(api.storage.getUrl, { storageId: storageId as any });

  if (!url) return <span className="p-2 text-surface-600"><Loader2 className="w-4 h-4 animate-spin" /></span>;

  return (
    <a
      href={url}
      target="_blank"
      download={name}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 text-surface-300 hover:text-white text-sm transition-colors"
      title="Download file"
    >
      <Download className="w-4 h-4" />
      Download
    </a>
  );
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
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

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

  const needsSignature = (doc: any) =>
    doc.signature_token &&
    ['sent', 'viewed', 'pending'].includes(doc.signature_status ?? '');

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
          {/* Action required banner */}
          {documents.some(needsSignature) && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex items-center gap-3">
              <PenLine className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-white font-medium">
                  You have {documents.filter(needsSignature).length} document{documents.filter(needsSignature).length > 1 ? 's' : ''} awaiting your signature
                </p>
                <p className="text-xs text-surface-400 mt-0.5">Click &quot;Review &amp; Sign&quot; on the document below to proceed.</p>
              </div>
            </div>
          )}

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
          <div className="space-y-3">
            {filtered.map((doc) => {
              const Icon = categoryIcons[doc.category] || FileText;
              const projectName = getProjectName(doc.project_id as string | undefined);
              const isExpanded = expandedDoc === doc._id;
              const hasContent = !!(doc as any).generated_content;
              const hasFile = !!doc.storage_id || !!doc.file_url;
              const canView = hasContent || hasFile;
              const sigStatus = sigStatusConfig[(doc as any).signature_status ?? 'not_required'];
              const SigIcon = sigStatus?.icon;
              const docNeedsSign = needsSignature(doc);

              return (
                <div
                  key={doc._id}
                  className={`card overflow-hidden transition-colors ${
                    docNeedsSign ? 'border-blue-500/30' : ''
                  }`}
                >
                  {/* Main row */}
                  <div className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColors[doc.category] || ''}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{doc.name}</span>
                        {SigIcon && (
                          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${sigStatus.bg} ${sigStatus.class}`}>
                            <SigIcon className="w-3 h-3" />
                            {sigStatus.label}
                          </span>
                        )}
                      </div>
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
                        <span className="text-surface-600">·</span>
                        <span className="text-xs text-surface-500">
                          {new Date(doc._creationTime).toLocaleDateString()}
                        </span>
                      </div>
                      {doc.notes && (
                        <p className="text-xs text-surface-500 mt-1">{doc.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Sign button */}
                      {docNeedsSign && (doc as any).signature_token && (
                        <a
                          href={`/sign/${(doc as any).signature_token}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
                        >
                          <PenLine className="w-4 h-4" />
                          Review & Sign
                        </a>
                      )}
                      {/* View/expand button for generated content */}
                      {hasContent && (
                        <button
                          onClick={() => setExpandedDoc(isExpanded ? null : doc._id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-800 text-surface-300 hover:text-white text-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          {isExpanded ? 'Hide' : 'View'}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                      {/* Download button for stored files */}
                      {doc.storage_id && (
                        <StorageDownloadLink storageId={doc.storage_id} name={doc.name} />
                      )}
                      {/* Download for URL-based files */}
                      {doc.file_url && !doc.storage_id && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 text-surface-300 hover:text-white text-sm transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Expanded content view */}
                  {isExpanded && hasContent && (
                    <div className="border-t border-surface-800">
                      <div className="px-4 py-2 bg-surface-900/50 flex items-center justify-between">
                        <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">Document Content</span>
                        {docNeedsSign && (doc as any).signature_token && (
                          <a
                            href={`/sign/${(doc as any).signature_token}`}
                            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <PenLine className="w-3 h-3" />
                            Open signing page
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <pre className="p-6 text-sm text-surface-200 whitespace-pre-wrap font-mono leading-relaxed max-h-[60vh] overflow-auto bg-surface-950/50">
                        {(doc as any).generated_content}
                      </pre>
                    </div>
                  )}

                  {/* Signed info */}
                  {(doc as any).signature_status === 'signed' && (doc as any).signed_at && (
                    <div className="border-t border-surface-800 px-4 py-2 bg-green-500/5 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-green-400">
                        Signed by {(doc as any).signer_name || 'client'} on {new Date((doc as any).signed_at).toLocaleString()}
                      </span>
                    </div>
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
