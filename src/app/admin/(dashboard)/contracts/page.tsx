'use client';

import { useState, useEffect, useRef } from 'react';

import { useSearchParams } from 'next/navigation';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { generatePDF } from '../../../../lib/pdfGenerator';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';
import {
  FileText,
  Sparkles,
  Download,
  Upload,
  Receipt,
  ScrollText,
  FileCheck,
  Eye,
  Loader2,
  RefreshCw,
  PenLine,
} from 'lucide-react';

type DocType = 'contract' | 'invoice' | 'proposal';

const DOC_TYPES: { id: DocType; label: string; icon: typeof FileText; description: string }[] = [
  { id: 'contract', label: 'Contract', icon: ScrollText, description: 'Web development service agreement' },
  { id: 'invoice', label: 'Invoice', icon: Receipt, description: 'Payment invoice for services' },
  { id: 'proposal', label: 'Proposal', icon: FileCheck, description: 'Project proposal with scope & pricing' },
];

const SERVICE_TIERS: Record<string, { label: string; price: string }> = {
  starter: { label: 'Starter', price: '$1,500' },
  business_pro: { label: 'Business Pro', price: '$3,500' },
  custom: { label: 'Custom App', price: '$7,500+' },
};

export default function AIContractGeneratorPage() {
  const searchParams = useSearchParams();
  const preSelectedClient = searchParams.get('client') as Id<'clients'> | null;

  const clients = useAdminQuery(api.clients.list, {}) ?? [];
  const allProjects = useAdminQuery(api.projects.list, {}) ?? [];
  const createDoc = useAdminMutation(api.clientDocuments.create);
  const generateUploadUrl = useAdminMutation(api.storage.generateUploadUrl);

  const [docType, setDocType] = useState<DocType>('contract');
  const [selectedClientId, setSelectedClientId] = useState<string>(preSelectedClient ?? '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [serviceTier, setServiceTier] = useState<string>('');
  const [customScope, setCustomScope] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [requireSignature, setRequireSignature] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selectedClient = clients.find((c) => c._id === selectedClientId);
  const clientProjects = allProjects.filter((p) => p.client_id === selectedClientId);
  const selectedProject = allProjects.find((p) => p._id === selectedProjectId);

  // Auto-set tier from project
  useEffect(() => {
    if (selectedProject?.service_tier && !serviceTier) {
      setServiceTier(selectedProject.service_tier);
    }
  }, [selectedProject, serviceTier]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  const handleGenerate = async () => {
    if (!selectedClient) return;
    setSaved(false);

    const pdfBytes = await generatePDF(docType, {
      client: {
        name: selectedClient.name,
        email: selectedClient.email,
        company: selectedClient.company,
        phone: selectedClient.phone,
      },
      project: selectedProject ? {
        title: selectedProject.title,
        description: selectedProject.description,
        service_tier: selectedProject.service_tier,
        start_date: selectedProject.start_date,
        target_date: selectedProject.target_date,
      } : undefined,
      serviceTier: serviceTier || selectedProject?.service_tier || undefined,
      customScope,
      requireSignature,
    });

    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const url = URL.createObjectURL(blob);
    setPdfBlob(blob);
    setPdfUrl(url);
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = `${docType}-${selectedClient?.name?.replace(/\s+/g, '-').toLowerCase() ?? 'client'}-${new Date().toISOString().slice(0, 10)}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleSaveToClient = async () => {
    if (!selectedClientId || !pdfBlob) return;
    setSaving(true);

    try {
      // Upload PDF to Convex storage
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/pdf' },
        body: pdfBlob,
      });
      const { storageId } = await uploadRes.json();

      const signatureToken = requireSignature
        ? crypto.randomUUID().replace(/-/g, '')
        : undefined;

      const docName = `${docType.charAt(0).toUpperCase() + docType.slice(1)} — ${selectedClient?.name ?? 'Client'} — ${new Date().toLocaleDateString()}`;

      await createDoc({
        client_id: selectedClientId as Id<'clients'>,
        project_id: selectedProjectId ? (selectedProjectId as Id<'projects'>) : undefined,
        name: docName,
        category: docType as any,
        uploaded_by: 'admin' as const,
        storage_id: storageId,
        file_type: 'application/pdf',
        notes: `AI-generated ${docType} (PDF)`,
        signature_status: requireSignature ? ('pending' as const) : ('not_required' as const),
        signature_token: signatureToken,
      });

      setSaved(true);
    } catch (err) {
      console.error(err);
      alert('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <a
          href="/admin/clients"
          className="text-sm text-surface-400 hover:text-brand-400 transition-colors"
        >
          ← Back to Clients
        </a>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Contract Generator</h1>
          <p className="text-surface-400 text-sm">Generate professional PDF contracts, invoices, and proposals</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-5">
            {/* Document Type */}
            <div>
              <label className="text-xs font-medium text-surface-400 mb-2 block">Document Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DOC_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setDocType(t.id); setPdfUrl(null); setPdfBlob(null); setSaved(false); }}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      docType === t.id
                        ? 'border-brand-500 bg-brand-600/20'
                        : 'border-surface-700 bg-surface-800 hover:border-surface-600'
                    }`}
                  >
                    <t.icon className={`w-5 h-5 mx-auto mb-1 ${docType === t.id ? 'text-brand-400' : 'text-surface-400'}`} />
                    <span className={`text-xs font-medium ${docType === t.id ? 'text-white' : 'text-surface-400'}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Client */}
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Client *</label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setSelectedProjectId('');
                  setServiceTier('');
                  setPdfUrl(null);
                  setPdfBlob(null);
                  setSaved(false);
                }}
                className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>
                ))}
              </select>
            </div>

            {/* Project */}
            {selectedClientId && (
              <div>
                <label className="text-xs font-medium text-surface-400 mb-1 block">Project (optional)</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
                >
                  <option value="">No specific project</option>
                  {clientProjects.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Service Tier */}
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">Service Tier</label>
              <select
                value={serviceTier}
                onChange={(e) => setServiceTier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500"
              >
                <option value="">Select tier...</option>
                <option value="starter">Starter ($1,500)</option>
                <option value="business_pro">Business Pro ($3,500)</option>
                <option value="custom">Custom App ($7,500+)</option>
              </select>
            </div>

            {/* Custom scope / line items */}
            <div>
              <label className="text-xs font-medium text-surface-400 mb-1 block">
                {docType === 'invoice' ? 'Custom Line Items' : 'Custom Scope (optional)'}
              </label>
              <textarea
                value={customScope}
                onChange={(e) => setCustomScope(e.target.value)}
                rows={4}
                placeholder={
                  docType === 'invoice'
                    ? 'Override default items...\ne.g. Website redesign - $2,000\nLogo design - $500'
                    : 'Override default scope...\ne.g. • Custom restaurant ordering system\n• Menu management dashboard'
                }
                className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm outline-none focus:border-brand-500 placeholder:text-surface-500 resize-none"
              />
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
                <p className="text-sm text-white font-medium flex items-center gap-2">
                  Require signature
                  <PenLine className="w-3.5 h-3.5 text-surface-500" />
                </p>
                <p className="text-xs text-surface-500">Client signs via secure link</p>
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedClientId}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Generate PDF {docType.charAt(0).toUpperCase() + docType.slice(1)}
            </button>
          </div>
        </div>

        {/* Right: PDF Preview */}
        <div className="lg:col-span-3">
          <div className="card p-6 space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-surface-400" />
                PDF Preview
              </h2>
              {pdfUrl && (
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 text-surface-300 hover:text-white text-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                  <button
                    onClick={handleSaveToClient}
                    disabled={saving || !selectedClientId || saved}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      saved
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50'
                    }`}
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : saved ? (
                      <FileCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    {saved ? 'Saved to Client Hub' : 'Save to Client'}
                  </button>
                </div>
              )}
            </div>

            {pdfUrl ? (
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className="w-full rounded-xl border border-surface-800 bg-white"
                style={{ height: '70vh' }}
                title="PDF Preview"
              />
            ) : (
              <div className="bg-surface-900/30 border border-surface-800 border-dashed rounded-xl p-16 text-center">
                <FileText className="w-16 h-16 mx-auto text-surface-700 mb-4" />
                <h3 className="text-lg font-semibold text-surface-500 mb-2">No document generated yet</h3>
                <p className="text-sm text-surface-600">
                  Select a client and click Generate to preview your professional PDF.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
