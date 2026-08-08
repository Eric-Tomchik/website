'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Send,
  ChevronDown,
  Upload,
  FileText,
  X,
  Lock,
} from 'lucide-react';
import { VOLUME_EVENT } from './ProcessingSavingsCalculator';
import {
  STATEMENT_ACCEPT_ATTR,
  formatBytes,
  validateStatementFile,
} from '@/lib/statementUpload';

interface FormData {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  industry: string;
  monthly_volume: string;
  notes: string;
  company: string; // honeypot
}

const initialForm: FormData = {
  business_name: '',
  owner_name: '',
  email: '',
  phone: '',
  industry: '',
  monthly_volume: '',
  notes: '',
  company: '',
};

const volumeOptions = [
  'Under $5,000/mo',
  '$5,000 – $15,000/mo',
  '$15,000 – $50,000/mo',
  'Over $50,000/mo',
  'Not sure yet',
];

const inputClass =
  'w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50 ' +
  'text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 ' +
  'focus:ring-brand-500/50 focus:border-brand-500/50 transition-all';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function track(event: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = (window as any).gtag;
  if (gtag) gtag('event', event, params);
}

interface UploadedStatement {
  storageId: string;
  filename: string;
  sizeBytes: number;
}

export default function MerchantSignupForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [started, setStarted] = useState(false);
  const [statement, setStatement] = useState<UploadedStatement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submittedWithStatement, setSubmittedWithStatement] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill the volume band the visitor picked in the hero calculator.
  useEffect(() => {
    const onVolume = (e: Event) => {
      const band = (e as CustomEvent<string>).detail;
      if (band) setForm((prev) => ({ ...prev, monthly_volume: band }));
    };
    window.addEventListener(VOLUME_EVENT, onVolume);
    return () => window.removeEventListener(VOLUME_EVENT, onVolume);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!started) {
      setStarted(true);
      track('form_start', { form: 'processing_analysis' });
    }
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStatementSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    if (!started) {
      setStarted(true);
      track('form_start', { form: 'processing_analysis' });
    }

    // Fail fast in the browser, then let the server re-check authoritatively.
    const check = validateStatementFile({ name: file.name, size: file.size, type: file.type });
    if (!check.ok) {
      setUploadError(check.error || 'That file could not be accepted.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/merchant-statement', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed. Please try again.');
      setStatement({
        storageId: data.storageId,
        filename: data.filename,
        sizeBytes: data.sizeBytes,
      });
      track('statement_uploaded', { form: 'processing_analysis' });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Upload failed. Please try again, or email it instead.'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearStatement = () => {
    setStatement(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/merchant-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: form.business_name,
          owner_name: form.owner_name,
          email: form.email,
          phone: form.phone || undefined,
          industry: form.industry || undefined,
          monthly_volume: form.monthly_volume || undefined,
          notes: form.notes || undefined,
          statement_storage_id: statement?.storageId,
          statement_filename: statement?.filename,
          statement_size_bytes: statement?.sizeBytes,
          company: form.company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      track('form_submit', {
        form: 'processing_analysis',
        monthly_volume: form.monthly_volume || 'not_specified',
        has_statement: statement ? 'yes' : 'no',
      });
      setSubmittedWithStatement(Boolean(statement));
      setStatus('success');
      setForm(initialForm);
      setStatement(null);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-600/10 border border-green-600/20 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h4 className="text-xl font-bold text-white">Request Received</h4>
        <p className="text-surface-400 max-w-md mx-auto">
          {submittedWithStatement
            ? 'Thanks — your statement came through. Eric will review it and walk you through your real numbers within 24 hours.'
            : "Thanks — Eric will reach out within 24 hours to set up your free processing review. Have your most recent processing statement handy; that's all it takes to see exactly what you're paying today."}
        </p>
        <p className="text-sm text-surface-500">
          In a hurry? Text or call{' '}
          <a href="tel:2283445724" className="text-brand-400 hover:text-brand-300">
            (228) 344-5724
          </a>
          .
        </p>
        <button onClick={() => setStatus('idle')} className="btn-secondary mt-4">
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium text-surface-300 mb-1.5">
            Business Name <span className="text-red-400">*</span>
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            required
            value={form.business_name}
            onChange={handleChange}
            placeholder="e.g. Joe's Barbershop"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="owner_name" className="block text-sm font-medium text-surface-300 mb-1.5">
            Your Name <span className="text-red-400">*</span>
          </label>
          <input
            id="owner_name"
            name="owner_name"
            type="text"
            required
            value={form.owner_name}
            onChange={handleChange}
            placeholder="Full name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@business.com"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="monthly_volume" className="block text-sm font-medium text-surface-300 mb-1.5">
            Monthly Card Volume <span className="text-red-400">*</span>
          </label>
          <select
            id="monthly_volume"
            name="monthly_volume"
            required
            value={form.monthly_volume}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select a range</option>
            {volumeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Optional extras — kept collapsed so the required path stays 4 fields. */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
          />
          {showDetails ? 'Hide optional details' : 'Add phone, industry, or notes (optional)'}
        </button>

        {showDetails && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-surface-300 mb-1.5">
                  Phone <span className="text-surface-500">(optional — fastest way to reach you)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-surface-300 mb-1.5">
                  Industry <span className="text-surface-500">(optional)</span>
                </label>
                <input
                  id="industry"
                  name="industry"
                  type="text"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="e.g. Salon, Auto Repair, Restaurant"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-surface-300 mb-1.5">
                Anything else? <span className="text-surface-500">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                placeholder="Current processor, equipment questions, best time to reach you…"
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Statement upload — the single highest-value thing they can give us.
          Optional on purpose: requiring it would gate the whole lead. */}
      <div className="rounded-lg border border-dashed border-surface-700/70 bg-surface-800/30 p-4">
        <input
          ref={fileInputRef}
          id="statement"
          type="file"
          accept={STATEMENT_ACCEPT_ATTR}
          onChange={handleStatementSelect}
          className="hidden"
        />

        {statement ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-600/10 border border-green-600/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-medium truncate">{statement.filename}</p>
              <p className="text-xs text-green-400">
                Attached — {formatBytes(statement.sizeBytes)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearStatement}
              className="text-surface-400 hover:text-white transition-colors p-1"
              aria-label="Remove uploaded statement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-surface-200">
                  Upload your processing statement{' '}
                  <span className="text-surface-500 font-normal">(optional — but it speeds everything up)</span>
                </p>
                <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                  One recent statement holds every number needed for the analysis. PDF or a photo
                  works — up to 10 MB.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1.5" />
                    Choose file
                  </>
                )}
              </button>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-surface-500">
              <Lock className="w-3 h-3 flex-shrink-0" />
              Sent over an encrypted connection and visible only to Eric. Deleted on request.
            </p>
          </div>
        )}

        {uploadError && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {uploadError}
          </div>
        )}
      </div>

      {/* Honeypot — hidden from real users */}
      <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" tabIndex={-1}>
        <input
          name="company"
          type="text"
          value={form.company}
          onChange={handleChange}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary w-full py-3.5 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Get My Free Processing Analysis
          </>
        )}
      </button>
      <p className="text-xs text-surface-500 text-center leading-relaxed">
        Free and no obligation. No credit check to request an analysis. Takes about 40 seconds —
        Eric follows up within 24 hours.
      </p>
    </form>
  );
}
