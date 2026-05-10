'use client';

import { useState } from 'react';
import { Download, Mail, CheckCircle2, Loader2, Lock, FileText } from 'lucide-react';

interface LeadMagnetProps {
  /** Title shown on the card */
  title: string;
  /** Description text */
  description: string;
  /** The download URL revealed after email submission */
  downloadUrl: string;
  /** Filename shown in download button */
  fileName: string;
  /** Optional preview items */
  previewItems?: string[];
}

export function LeadMagnet({
  title,
  description,
  downloadUrl,
  fileName,
  previewItems,
}: LeadMagnetProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'locked' | 'loading' | 'unlocked' | 'error'>('locked');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('unlocked');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="card p-6 sm:p-8 border-brand-600/20">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-brand-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-sm text-surface-400 mt-1">{description}</p>
        </div>
      </div>

      {previewItems && previewItems.length > 0 && (
        <ul className="space-y-1.5 mb-6 ml-1">
          {previewItems.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-surface-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {status === 'unlocked' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Access unlocked! You&apos;re subscribed to the newsletter.</span>
          </div>
          <a
            href={downloadUrl}
            download={fileName}
            className="btn-primary text-sm py-2.5 inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download {fileName}
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('locked'); }}
                placeholder="you@email.com"
                required
                aria-label="Email address to unlock download"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700
                           text-sm text-white placeholder:text-surface-500
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap disabled:opacity-50"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 mr-1.5" />
                  Unlock
                </>
              )}
            </button>
          </div>
          {status === 'error' && (
            <p className="text-xs text-red-400" role="alert">{errorMsg}</p>
          )}
          <p className="text-[11px] text-surface-500">
            Free download — just enter your email. You&apos;ll also get occasional insights on business credit, tech, and web development. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
}
