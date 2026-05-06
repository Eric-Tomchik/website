'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import {
  FileText,
  Sparkles,
  Download,
  Send,
  Upload,
  ArrowLeft,
  Receipt,
  ScrollText,
  FileCheck,
  ClipboardCopy,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react';

type DocType = 'contract' | 'invoice' | 'proposal';

const DOC_TYPES: { id: DocType; label: string; icon: any; description: string }[] = [
  { id: 'contract', label: 'Contract', icon: ScrollText, description: 'Web development service agreement' },
  { id: 'invoice', label: 'Invoice', icon: Receipt, description: 'Payment invoice for services' },
  { id: 'proposal', label: 'Proposal', icon: FileCheck, description: 'Project proposal with scope & pricing' },
];

const SERVICE_TIERS: Record<string, { label: string; price: string; features: string[] }> = {
  starter: {
    label: 'Starter',
    price: '$1,500',
    features: ['Single-page website', 'Mobile responsive', 'Contact form', 'Basic SEO', '1 revision round'],
  },
  business_pro: {
    label: 'Business Pro',
    price: '$3,500',
    features: ['Multi-page website (up to 5)', 'Mobile responsive', 'Contact form + Google Maps', 'SEO optimization', 'Social media integration', '3 revision rounds', '30-day support'],
  },
  custom: {
    label: 'Custom App',
    price: '$7,500+',
    features: ['Full custom application', 'Database integration', 'User authentication', 'Payment processing', 'Custom API', 'Unlimited revisions', '90-day support'],
  },
};

function generateContract(client: any, project: any, customScope: string, tier: any): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const tierInfo = tier ? SERVICE_TIERS[tier] : null;

  return `
═══════════════════════════════════════════
         WEB DEVELOPMENT CONTRACT
═══════════════════════════════════════════

Date: ${today}
Contract #: ET-${Date.now().toString(36).toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEVELOPER:
  Eric Tomchik
  ArcLight Press / Web Development
  Mississippi Gulf Coast
  info@erictomchik.com

CLIENT:
  ${client?.name || '[Client Name]'}
  ${client?.company ? client.company + '\n  ' : ''}${client?.email || '[Client Email]'}
  ${client?.phone || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: ${project?.title || '[Project Title]'}
${project?.description ? `Description: ${project.description}\n` : ''}Service Tier: ${tierInfo?.label || 'Custom'}
Price: ${tierInfo?.price || '$_____'}

${customScope ? `Scope of Work:\n${customScope}\n` : tierInfo ? `Included Features:\n${tierInfo.features.map(f => `  • ${f}`).join('\n')}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Start Date: ${project?.start_date || '[Start Date]'}
Target Completion: ${project?.target_date || '[Target Date]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  • 50% deposit due upon signing
  • 50% balance due upon project completion
  • Payments accepted via PayPal or Stripe
  • Late payments subject to 1.5% monthly fee

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REVISION POLICY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  • ${tierInfo?.label === 'Starter' ? '1 revision round' : tierInfo?.label === 'Business Pro' ? '3 revision rounds' : 'Unlimited revisions'} included
  • Additional revisions billed at $75/hour
  • Revision requests must be submitted in writing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTELLECTUAL PROPERTY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Upon full payment, all custom code, designs, and content
created for this project become the property of the Client.
Developer retains the right to showcase the work in their
portfolio.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TERMINATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Either party may terminate this agreement with 7 days
written notice. Client is responsible for payment of all
work completed up to the date of termination.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SIGNATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Developer: ____________________________
           Eric Tomchik
           Date: ${today}

Client:    ____________________________
           ${client?.name || '[Client Name]'}
           Date: _______________
`.trim();
}

function generateInvoice(client: any, project: any, customItems: string, tier: any): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dueDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const tierInfo = tier ? SERVICE_TIERS[tier] : null;
  const invoiceNum = `INV-${Date.now().toString(36).toUpperCase()}`;

  return `
═══════════════════════════════════════════
              INVOICE
═══════════════════════════════════════════

Invoice #: ${invoiceNum}
Date: ${today}
Due Date: ${dueDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FROM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Eric Tomchik
ArcLight Press / Web Development
Mississippi Gulf Coast
info@erictomchik.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BILL TO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${client?.name || '[Client Name]'}
${client?.company ? client.company + '\n' : ''}${client?.email || '[Client Email]'}
${client?.phone || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${customItems || `${project?.title || 'Web Development Services'} - ${tierInfo?.label || 'Custom'} Package
  ${tierInfo ? tierInfo.features.map(f => `• ${f}`).join('\n  ') : '• Custom development services'}

  Subtotal:  ${tierInfo?.price || '$_____'}`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  TOTAL DUE: ${tierInfo?.price || '$_____'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT METHODS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PayPal: info@erictomchik.com
Stripe: Available at erictomchik.com

Payment is due within 30 days of invoice date.
Late payments are subject to a 1.5% monthly fee.

Thank you for your business!
`.trim();
}

function generateProposal(client: any, project: any, customScope: string, tier: any): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const tierInfo = tier ? SERVICE_TIERS[tier] : null;

  return `
═══════════════════════════════════════════
         PROJECT PROPOSAL
═══════════════════════════════════════════

Date: ${today}
Proposal #: PROP-${Date.now().toString(36).toUpperCase()}

Prepared for: ${client?.name || '[Client Name]'}${client?.company ? ` — ${client.company}` : ''}
Prepared by: Eric Tomchik, ArcLight Press

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for considering my web development services.
This proposal outlines the scope, timeline, and pricing
for ${project?.title || 'your upcoming project'}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCOPE OF WORK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${customScope || (tierInfo ? `${tierInfo.label} Package (${tierInfo.price}):\n${tierInfo.features.map(f => `  • ${f}`).join('\n')}` : '[Describe the scope of work]')}

${project?.description ? `\nProject Description:\n${project.description}\n` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNOLOGY STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  • Next.js 15 (React 19) — Modern, fast framework
  • TypeScript — Type-safe development
  • Tailwind CSS — Custom, responsive design
  • Cloudflare — Enterprise-grade hosting & CDN
  • ${tier === 'custom' ? 'Convex — Real-time database\n  • Stripe/PayPal — Payment processing' : 'Mobile-first responsive design'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estimated Start: ${project?.start_date || 'Upon contract signing'}
Estimated Completion: ${project?.target_date || (tier === 'starter' ? '2-3 weeks' : tier === 'business_pro' ? '4-6 weeks' : '8-12 weeks')}

Phases:
  1. Discovery & Planning (Week 1)
  2. Design & Development (${tier === 'starter' ? 'Week 2' : tier === 'business_pro' ? 'Weeks 2-4' : 'Weeks 2-8'})
  3. Review & Revisions (${tier === 'starter' ? 'Week 3' : tier === 'business_pro' ? 'Week 5' : 'Weeks 9-10'})
  4. Launch & Handoff (Final week)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRICING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Package: ${tierInfo?.label || 'Custom'}
  Price:   ${tierInfo?.price || '$_____'}

  Payment Schedule:
  • 50% deposit upon signing ($${tierInfo ? (parseInt(tierInfo.price.replace(/\D/g, '')) / 2).toLocaleString() : '___'})
  • 50% upon completion ($${tierInfo ? (parseInt(tierInfo.price.replace(/\D/g, '')) / 2).toLocaleString() : '___'})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHY CHOOSE ME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✓ 9 successful websites built
  ✓ Published author on AI & business tech
  ✓ Gulf Coast local — in-person meetings available
  ✓ Modern tech stack (Next.js, React, TypeScript)
  ✓ Enterprise-grade hosting on Cloudflare

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This proposal is valid for 30 days from the date above.

To proceed, please sign and return the accompanying
contract. I look forward to working with you!

Eric Tomchik
info@erictomchik.com | erictomchik.com
`.trim();
}

export default function AIContractGeneratorPage() {
  const searchParams = useSearchParams();
  const preSelectedClient = searchParams.get('client') as Id<'clients'> | null;

  const clients = useQuery(api.clients.list, {}) ?? [];
  const allProjects = useQuery(api.projects.list, {}) ?? [];
  const createDoc = useMutation(api.clientDocuments.create);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [docType, setDocType] = useState<DocType>('contract');
  const [selectedClientId, setSelectedClientId] = useState<string>(preSelectedClient ?? '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [serviceTier, setServiceTier] = useState<string>('');
  const [customScope, setCustomScope] = useState('');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [requireSignature, setRequireSignature] = useState(false);

  const selectedClient = clients.find((c) => c._id === selectedClientId);
  const clientProjects = allProjects.filter((p) => p.client_id === selectedClientId);
  const selectedProject = allProjects.find((p) => p._id === selectedProjectId);

  // Auto-set tier from project
  useEffect(() => {
    if (selectedProject?.service_tier && !serviceTier) {
      setServiceTier(selectedProject.service_tier);
    }
  }, [selectedProject, serviceTier]);

  const handleGenerate = () => {
    setSaved(false);
    const tier = serviceTier || selectedProject?.service_tier || null;

    if (docType === 'contract') {
      setPreview(generateContract(selectedClient, selectedProject, customScope, tier));
    } else if (docType === 'invoice') {
      setPreview(generateInvoice(selectedClient, selectedProject, customScope, tier));
    } else {
      setPreview(generateProposal(selectedClient, selectedProject, customScope, tier));
    }
  };

  const handleSaveToClient = async () => {
    if (!selectedClientId || !preview) return;
    setSaving(true);

    try {
      const signatureToken = requireSignature
        ? crypto.randomUUID().replace(/-/g, '')
        : undefined;

      await createDoc({
        client_id: selectedClientId as Id<'clients'>,
        project_id: selectedProjectId ? (selectedProjectId as Id<'projects'>) : undefined,
        name: `${docType.charAt(0).toUpperCase() + docType.slice(1)} — ${selectedClient?.name ?? 'Client'} — ${new Date().toLocaleDateString()}`,
        category: docType as any,
        uploaded_by: 'admin' as const,
        generated_content: preview,
        notes: `AI-generated ${docType}`,
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(preview);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <a
          href={selectedClientId ? `/admin/clients` : '/admin/clients'}
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
          <p className="text-surface-400 text-sm">Auto-generate contracts, invoices, and proposals</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-5">
            {/* Document Type */}
            <div>
              <label className="text-xs font-medium text-surface-400 mb-2 block">Document Type</label>
              <div className="grid grid-cols-3 gap-2">
                {DOC_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDocType(t.id)}
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
                <p className="text-sm text-white font-medium">Require signature</p>
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
              Generate {docType.charAt(0).toUpperCase() + docType.slice(1)}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-3">
          <div className="card p-6 space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-surface-400" />
                Preview
              </h2>
              {preview && (
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 text-surface-300 hover:text-white text-sm transition-colors"
                  >
                    <ClipboardCopy className="w-3.5 h-3.5" />
                    Copy
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

            {preview ? (
              <pre className="bg-surface-900 border border-surface-800 rounded-xl p-6 text-sm text-surface-200 whitespace-pre-wrap font-mono overflow-auto max-h-[70vh] leading-relaxed">
                {preview}
              </pre>
            ) : (
              <div className="bg-surface-900/30 border border-surface-800 border-dashed rounded-xl p-16 text-center">
                <FileText className="w-16 h-16 mx-auto text-surface-700 mb-4" />
                <h3 className="text-lg font-semibold text-surface-500 mb-2">No document generated yet</h3>
                <p className="text-sm text-surface-600">
                  Select a client and click Generate to preview your document.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
