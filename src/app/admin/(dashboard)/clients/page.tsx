'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useState, useRef, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  FolderKanban,
  LifeBuoy,
  FileText,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  Loader2,
  StickyNote,
  Calendar,
  Globe,
  Target,
  Package,
  Receipt,
  ScrollText,
  Send,
  Download,
  Edit2,
  Trash2,
  Upload,
  Link2,
  PenLine,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Id } from '../../../../../convex/_generated/dataModel';

// =========== Client Detail View ===========
function ClientDetail({ clientId, onBack }: { clientId: Id<'clients'>; onBack: () => void }) {
  const client = useQuery(api.clients.get, { id: clientId });
  const projects = useQuery(api.projects.list, { clientId }) ?? [];
  const tickets = useQuery(api.tickets.list, { clientId }) ?? [];
  const documents = useQuery(api.clientDocuments.list, { clientId }) ?? [];
  const updateProject = useMutation(api.projects.update);
  const createProject = useMutation(api.projects.create);
  const createDoc = useMutation(api.clientDocuments.create);
  const updateDoc = useMutation(api.clientDocuments.update);
  const removeDoc = useMutation(api.clientDocuments.remove);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [tab, setTab] = useState<'overview' | 'projects' | 'tickets' | 'documents'>('overview');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', service_tier: 'starter' as const, target_date: '' });
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', category: 'contract' as const, file_url: '', notes: '' });

  if (!client) return null;

  const activeProjects = projects.filter((p) => !['completed', 'cancelled'].includes(p.status));
  const openTickets = tickets.filter((t) => !['resolved', 'closed'].includes(t.status));

  const handleCreateProject = async () => {
    await createProject({
      client_id: clientId,
      title: newProject.title,
      description: newProject.description || undefined,
      service_tier: newProject.service_tier,
      target_date: newProject.target_date || undefined,
    });
    setNewProject({ title: '', description: '', service_tier: 'starter', target_date: '' });
    setShowNewProject(false);
  };

  const handleCreateDoc = async () => {
    await createDoc({
      client_id: clientId,
      name: newDoc.name,
      category: newDoc.category,
      file_url: newDoc.file_url || undefined,
      notes: newDoc.notes || undefined,
      uploaded_by: 'admin',
    });
    setNewDoc({ name: '', category: 'contract', file_url: '', notes: '' });
    setShowNewDoc(false);
  };

  const statusLabels: Record<string, string> = {
    discovery: 'Discovery', proposal: 'Proposal', in_progress: 'In Progress',
    review: 'Review', completed: 'Completed', on_hold: 'On Hold', cancelled: 'Cancelled',
  };

  const statusColors: Record<string, string> = {
    discovery: 'bg-blue-500/10 text-blue-400', proposal: 'bg-purple-500/10 text-purple-400',
    in_progress: 'bg-yellow-500/10 text-yellow-400', review: 'bg-orange-500/10 text-orange-400',
    completed: 'bg-green-500/10 text-green-400', on_hold: 'bg-surface-500/10 text-surface-400',
    cancelled: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-surface-400 hover:text-brand-400 transition-colors">
        ← Back to Clients
      </button>

      {/* Client header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-bold">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{client.name}</h2>
              {client.company && <div className="text-sm text-surface-400">{client.company}</div>}
              <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>
                {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${client.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {client.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        {client.notes && (
          <div className="mt-4 p-3 rounded-lg bg-surface-900/50 border border-surface-800">
            <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-1"><StickyNote className="w-3 h-3" /> Notes</div>
            <p className="text-sm text-surface-300">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-white">{projects.length}</div>
          <div className="text-xs text-surface-400">Projects</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-white">{activeProjects.length}</div>
          <div className="text-xs text-surface-400">Active</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-white">{openTickets.length}</div>
          <div className="text-xs text-surface-400">Open Tickets</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-white">{documents.length}</div>
          <div className="text-xs text-surface-400">Documents</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-800">
        {(['overview', 'projects', 'tickets', 'documents'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-brand-500 text-brand-400' : 'border-transparent text-surface-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">Active Projects</h3>
            {activeProjects.length === 0 ? (
              <p className="text-sm text-surface-500">No active projects</p>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((p) => (
                  <div key={p._id} className="p-3 rounded-lg bg-surface-900/50 border border-surface-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white font-medium">{p.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[p.status]}`}>{statusLabels[p.status]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-800">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${p.progress_percent}%` }} />
                      </div>
                      <span className="text-xs text-surface-400">{p.progress_percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">Recent Tickets</h3>
            {tickets.length === 0 ? (
              <p className="text-sm text-surface-500">No tickets</p>
            ) : (
              <div className="space-y-2">
                {tickets.slice(0, 5).map((t) => (
                  <div key={t._id} className="flex items-center justify-between p-2 rounded-lg bg-surface-900/50">
                    <span className="text-sm text-white">{t.subject}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      t.status === 'open' ? 'bg-blue-500/10 text-blue-400' : t.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'
                    }`}>{t.status.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'projects' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowNewProject(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </button>
          </div>
          {showNewProject && (
            <div className="card p-5 space-y-4 border-brand-500/30">
              <h3 className="text-white font-semibold">New Project</h3>
              <input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="Project title" className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500" />
              <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newProject.service_tier} onChange={(e) => setNewProject({ ...newProject, service_tier: e.target.value as any })} className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none">
                  <option value="starter">Starter ($1,500)</option>
                  <option value="business_pro">Business Pro ($3,500)</option>
                  <option value="custom">Custom ($7,500+)</option>
                </select>
                <input type="date" value={newProject.target_date} onChange={(e) => setNewProject({ ...newProject, target_date: e.target.value })} className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowNewProject(false)} className="btn-secondary text-sm">Cancel</button>
                <button onClick={handleCreateProject} disabled={!newProject.title.trim()} className="btn-primary text-sm disabled:opacity-50">Create</button>
              </div>
            </div>
          )}
          {projects.map((p) => (
            <div key={p._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{p.title}</h3>
                  {p.description && <p className="text-xs text-surface-400 mt-1">{p.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={p.status}
                    onChange={(e) => updateProject({ id: p._id, status: e.target.value as any })}
                    className="text-xs px-2 py-1 rounded bg-surface-800 border border-surface-700 text-white outline-none"
                  >
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-2 rounded-full bg-surface-800">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${p.progress_percent}%` }} />
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={p.progress_percent}
                  onChange={(e) => updateProject({ id: p._id, progress_percent: parseInt(e.target.value) })}
                  className="w-20 accent-brand-500"
                />
                <span className="text-xs text-surface-400 w-8">{p.progress_percent}%</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-surface-500">
                {p.service_tier && <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {p.service_tier.replace('_', ' ')}</span>}
                {p.start_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Started {p.start_date}</span>}
                {p.target_date && <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Target {p.target_date}</span>}
                {p.live_url && <a href={p.live_url} target="_blank" className="flex items-center gap-1 text-brand-400"><Globe className="w-3 h-3" /> Live</a>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'tickets' && (
        <div className="space-y-2">
          {tickets.length === 0 ? <p className="text-sm text-surface-500 py-4">No tickets from this client.</p> : null}
          {tickets.map((t) => (
            <div key={t._id} className="card flex items-center justify-between p-4">
              <div>
                <div className="text-sm text-white font-medium">{t.subject}</div>
                <div className="text-xs text-surface-500 mt-0.5">{t.category.replace('_', ' ')} · {t.priority} priority</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                t.status === 'open' ? 'bg-blue-500/10 text-blue-400' : t.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'
              }`}>{t.status.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'documents' && (
        <DocumentsTab
          clientId={clientId}
          documents={documents}
          projects={projects}
          client={client}
          createDoc={createDoc}
          updateDoc={updateDoc}
          removeDoc={removeDoc}
          generateUploadUrl={generateUploadUrl}
        />
      )}
    </div>
  );
}

// =========== Documents Tab with File Upload + Signature ===========
function DocumentsTab({
  clientId,
  documents,
  projects,
  client,
  createDoc,
  updateDoc,
  removeDoc,
  generateUploadUrl,
}: {
  clientId: Id<'clients'>;
  documents: any[];
  projects: any[];
  client: any;
  createDoc: any;
  updateDoc: any;
  removeDoc: any;
  generateUploadUrl: any;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<string>('contract');
  const [docNotes, setDocNotes] = useState('');
  const [docProjectId, setDocProjectId] = useState('');
  const [requireSignature, setRequireSignature] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      setUploadFile(file);
      if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ''));
    }
  }, [docName]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!docName.trim()) return;
    setUploading(true);

    try {
      let storageId: string | undefined;
      let fileUrl: string | undefined;
      let fileSize: number | undefined;
      let mimeType: string | undefined;

      if (uploadFile) {
        // Upload file to Convex storage
        const url = await generateUploadUrl();
        const result = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': uploadFile.type },
          body: uploadFile,
        });
        const { storageId: sid } = await result.json();
        storageId = sid;
        fileSize = uploadFile.size;
        mimeType = uploadFile.type;
      }

      const signatureToken = requireSignature
        ? crypto.randomUUID().replace(/-/g, '')
        : undefined;

      await createDoc({
        client_id: clientId,
        project_id: docProjectId ? (docProjectId as any) : undefined,
        name: docName,
        category: docCategory as any,
        storage_id: storageId,
        file_size_bytes: fileSize,
        mime_type: mimeType,
        notes: docNotes || undefined,
        uploaded_by: 'admin' as const,
        signature_status: requireSignature ? ('pending' as const) : ('not_required' as const),
        signature_token: signatureToken,
      });

      // Reset form
      setUploadFile(null);
      setDocName('');
      setDocCategory('contract');
      setDocNotes('');
      setDocProjectId('');
      setRequireSignature(false);
      setShowUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const sendForSignature = async (doc: any) => {
    const token = doc.signature_token || crypto.randomUUID().replace(/-/g, '');
    await updateDoc({
      id: doc._id,
      signature_status: 'sent' as any,
      signature_token: token,
      sent_for_signature_at: Date.now(),
    });
    // Copy signing URL to clipboard
    const url = `${window.location.origin}/sign/${token}`;
    await navigator.clipboard.writeText(url);
    alert(`Signing link copied to clipboard!\n\n${url}\n\nSend this to ${client.name} to sign.`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const catLabels: Record<string, string> = {
    contract: 'Contract', invoice: 'Invoice', proposal: 'Proposal',
    deliverable: 'Deliverable', brief: 'Brief', other: 'Other',
  };

  const sigStatusStyles: Record<string, { icon: any; class: string; label: string }> = {
    not_required: { icon: null, class: '', label: '' },
    pending: { icon: Clock, class: 'text-surface-400', label: 'Pending' },
    sent: { icon: Send, class: 'text-blue-400', label: 'Sent for signature' },
    viewed: { icon: Eye, class: 'text-yellow-400', label: 'Viewed' },
    signed: { icon: CheckCircle2, class: 'text-green-400', label: 'Signed' },
    declined: { icon: AlertCircle, class: 'text-red-400', label: 'Declined' },
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <a
            href={`/admin/contracts?client=${clientId}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-600/30 text-purple-400 text-sm font-medium hover:bg-purple-600/30 transition-colors"
          >
            <PenLine className="w-4 h-4" />
            AI Contract Generator
          </a>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary text-sm">
          <Upload className="w-4 h-4 mr-2" /> Upload Document
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="card p-6 space-y-4 border-brand-500/30">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Upload Document</h3>
            <button onClick={() => { setShowUpload(false); setUploadFile(null); }} className="text-surface-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-brand-500 bg-brand-500/10'
                : uploadFile
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-surface-700 hover:border-surface-600 bg-surface-900/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
            />
            {uploadFile ? (
              <div className="space-y-2">
                <FileText className="w-10 h-10 mx-auto text-green-400" />
                <p className="text-sm text-white font-medium">{uploadFile.name}</p>
                <p className="text-xs text-surface-400">{formatFileSize(uploadFile.size)} · {uploadFile.type || 'unknown type'}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-10 h-10 mx-auto text-surface-500" />
                <p className="text-sm text-surface-300">
                  <span className="text-brand-400 font-medium">Click to browse</span> or drag and drop
                </p>
                <p className="text-xs text-surface-500">PDF, Word, Excel, images up to 10MB</p>
              </div>
            )}
          </div>

          {/* Document details */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Document Name *</label>
              <input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Web Development Contract"
                className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Category</label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
              >
                <option value="contract">Contract</option>
                <option value="invoice">Invoice</option>
                <option value="proposal">Proposal</option>
                <option value="deliverable">Deliverable</option>
                <option value="brief">Project Brief</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Link to Project</label>
              <select
                value={docProjectId}
                onChange={(e) => setDocProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
              >
                <option value="">No project</option>
                {projects.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Notes</label>
              <input
                value={docNotes}
                onChange={(e) => setDocNotes(e.target.value)}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500"
              />
            </div>
          </div>

          {/* Signature toggle */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-900/50 border border-surface-800">
            <button
              onClick={() => setRequireSignature(!requireSignature)}
              className={`relative w-10 h-5 rounded-full transition-colors ${requireSignature ? 'bg-brand-600' : 'bg-surface-700'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${requireSignature ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <div>
              <p className="text-sm text-white font-medium">Require digital signature</p>
              <p className="text-xs text-surface-500">Generate a signing link to send to the client</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowUpload(false); setUploadFile(null); }} className="btn-secondary text-sm">
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !docName.trim()}
              className="btn-primary text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 && !showUpload ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No documents yet</h3>
          <p className="text-surface-400 text-sm">Upload a document or generate a contract to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((d: any) => {
            const sigInfo = sigStatusStyles[d.signature_status ?? 'not_required'];
            const SigIcon = sigInfo?.icon;

            return (
              <div key={d._id} className="card p-4 hover:border-surface-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0">
                    {d.category === 'contract' ? <ScrollText className="w-5 h-5 text-blue-400" /> :
                     d.category === 'invoice' ? <Receipt className="w-5 h-5 text-green-400" /> :
                     d.category === 'proposal' ? <FileText className="w-5 h-5 text-purple-400" /> :
                     <FileText className="w-5 h-5 text-surface-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium">{d.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-surface-800 text-surface-400">
                        {catLabels[d.category] || d.category}
                      </span>
                      {SigIcon && (
                        <span className={`flex items-center gap-1 text-xs ${sigInfo.class}`}>
                          <SigIcon className="w-3 h-3" />
                          {sigInfo.label}
                          {d.signed_at && ` · ${new Date(d.signed_at).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-surface-500 mt-0.5">
                      {d.file_size_bytes && <span>{formatFileSize(d.file_size_bytes)}</span>}
                      {d.mime_type && <span>{d.mime_type}</span>}
                      {d.notes && <span>· {d.notes}</span>}
                      <span>· {new Date(d._creationTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Send for signature button */}
                    {d.signature_status === 'pending' && (
                      <button
                        onClick={() => sendForSignature(d)}
                        className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Send for signature"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {/* Copy signing link for sent/viewed */}
                    {(d.signature_status === 'sent' || d.signature_status === 'viewed') && d.signature_token && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/sign/${d.signature_token}`);
                          alert('Signing link copied!');
                        }}
                        className="p-2 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-surface-800 transition-colors"
                        title="Copy signing link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                    )}
                    {/* Download (for stored files) */}
                    {d.storage_id && (
                      <DownloadButton storageId={d.storage_id} name={d.name} />
                    )}
                    {d.file_url && !d.storage_id && (
                      <a href={d.file_url} target="_blank" className="p-2 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-surface-800 transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => { if (confirm('Delete this document?')) removeDoc({ id: d._id }); }}
                      className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper component to download files from Convex storage
function DownloadButton({ storageId, name }: { storageId: string; name: string }) {
  const fileUrl = useQuery(api.storage.getUrl, { storageId: storageId as any });

  if (!fileUrl) return (
    <span className="p-2 text-surface-600"><Loader2 className="w-4 h-4 animate-spin" /></span>
  );

  return (
    <a
      href={fileUrl}
      target="_blank"
      download={name}
      className="p-2 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-surface-800 transition-colors"
      title="Download"
    >
      <Download className="w-4 h-4" />
    </a>
  );
}

// =========== Main Clients Page ===========
export default function AdminClientsPage() {
  const clients = useQuery(api.clients.list, {}) ?? [];
  const projects = useQuery(api.projects.list, {}) ?? [];
  const ticketCounts = useQuery(api.tickets.counts, {});
  const createClient = useMutation(api.clients.create);

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<Id<'clients'> | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', company: '', password: '', notes: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const filtered = search
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase())
      )
    : clients;

  const getClientProjectCount = (id: string) => projects.filter((p) => p.client_id === id).length;
  const getClientActiveCount = (id: string) =>
    projects.filter((p) => p.client_id === id && !['completed', 'cancelled'].includes(p.status)).length;

  if (selectedId) {
    return <ClientDetail clientId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    try {
      await createClient({
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone || undefined,
        company: newClient.company || undefined,
        password: newClient.password,
        notes: newClient.notes || undefined,
      });
      setNewClient({ name: '', email: '', phone: '', company: '', password: '', notes: '' });
      setShowNew(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
    }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Clients</h1>
          <p className="text-surface-400 mt-1">Manage your web development clients and projects.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </button>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-white">{clients.length}</div>
          <div className="text-xs text-surface-400">Total Clients</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-white">{projects.length}</div>
          <div className="text-xs text-surface-400">Total Projects</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-white">{projects.filter((p) => p.status === 'in_progress').length}</div>
          <div className="text-xs text-surface-400">In Progress</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-white">{ticketCounts?.open ?? 0}</div>
          <div className="text-xs text-surface-400">Open Tickets</div>
        </div>
      </div>

      {/* New client form */}
      {showNew && (
        <div className="card p-6 space-y-4 border-brand-500/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">New Client</h3>
            <button onClick={() => setShowNew(false)} className="text-surface-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} placeholder="Full name *" className="px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500" />
            <input value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} type="email" placeholder="Email *" className="px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500" />
            <input value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} placeholder="Phone" className="px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500" />
            <input value={newClient.company} onChange={(e) => setNewClient({ ...newClient, company: e.target.value })} placeholder="Company" className="px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500" />
            <input value={newClient.password} onChange={(e) => setNewClient({ ...newClient, password: e.target.value })} type="text" placeholder="Portal password *" className="px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500" />
            <input value={newClient.notes} onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })} placeholder="Notes" className="px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500" />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNew(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleCreate} disabled={creating || !newClient.name || !newClient.email || !newClient.password} className="btn-primary text-sm disabled:opacity-50">
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Client
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500"
        />
      </div>

      {/* Client list */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {clients.length === 0 ? 'No clients yet' : 'No results'}
          </h3>
          <p className="text-surface-400 text-sm">
            {clients.length === 0 ? 'Add your first client to get started.' : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => (
            <button
              key={client._id}
              onClick={() => setSelectedId(client._id)}
              className="card w-full flex items-center gap-4 p-4 text-left group"
            >
              <div className="w-11 h-11 rounded-full bg-brand-600/80 flex items-center justify-center text-white font-bold flex-shrink-0">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors">
                  {client.name}
                </div>
                <div className="flex items-center gap-3 text-xs text-surface-500 mt-0.5">
                  <span>{client.email}</span>
                  {client.company && <span>· {client.company}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-surface-500">
                <span className="flex items-center gap-1"><FolderKanban className="w-3 h-3" /> {getClientProjectCount(client._id)}</span>
                <span className={`flex items-center gap-1 ${getClientActiveCount(client._id) > 0 ? 'text-yellow-400' : ''}`}>
                  <LifeBuoy className="w-3 h-3" /> {getClientActiveCount(client._id)} active
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-surface-600 group-hover:text-brand-400 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
