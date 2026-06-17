'use client';

import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react';

interface FormData {
  business_name: string;
  owner_name: string;
  business_phone: string;
  referrer_name: string;
  referrer_phone: string;
  referrer_email: string;
  notes: string;
  website: string; // honeypot
}

const initialForm: FormData = {
  business_name: '',
  owner_name: '',
  business_phone: '',
  referrer_name: '',
  referrer_phone: '',
  referrer_email: '',
  notes: '',
  website: '',
};

export default function ReferralForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setStatus('success');
      setForm(initialForm);
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
        <h4 className="text-xl font-bold text-white">Referral Submitted!</h4>
        <p className="text-surface-400 max-w-md mx-auto">
          Thank you! Eric will reach out to the business owner shortly.
          You&apos;ll be notified once the referral qualifies and your fee is ready.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="btn-secondary mt-4"
        >
          Submit Another Referral
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Referred Business Info */}
      <div>
        <p className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">
          Business Being Referred
        </p>
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
              className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                         text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                         focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            />
          </div>
          <div>
            <label htmlFor="owner_name" className="block text-sm font-medium text-surface-300 mb-1.5">
              Owner / Decision Maker <span className="text-red-400">*</span>
            </label>
            <input
              id="owner_name"
              name="owner_name"
              type="text"
              required
              value={form.owner_name}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                         text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                         focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="business_phone" className="block text-sm font-medium text-surface-300 mb-1.5">
              Best Contact Number <span className="text-red-400">*</span>
            </label>
            <input
              id="business_phone"
              name="business_phone"
              type="tel"
              required
              value={form.business_phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                         text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                         focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-surface-700/50" />

      {/* Referrer Info */}
      <div>
        <p className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">
          Your Information (Referrer)
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="referrer_name" className="block text-sm font-medium text-surface-300 mb-1.5">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              id="referrer_name"
              name="referrer_name"
              type="text"
              required
              value={form.referrer_name}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                         text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                         focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            />
          </div>
          <div>
            <label htmlFor="referrer_phone" className="block text-sm font-medium text-surface-300 mb-1.5">
              Your Phone <span className="text-red-400">*</span>
            </label>
            <input
              id="referrer_phone"
              name="referrer_phone"
              type="tel"
              required
              value={form.referrer_phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                         text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                         focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="referrer_email" className="block text-sm font-medium text-surface-300 mb-1.5">
              Your Email <span className="text-red-400">*</span>
            </label>
            <input
              id="referrer_email"
              name="referrer_email"
              type="email"
              required
              value={form.referrer_email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                         text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                         focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-surface-300 mb-1.5">
          Additional Notes <span className="text-surface-500">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={handleChange}
          placeholder="Anything else we should know about this referral..."
          className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                     text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                     focus:ring-brand-500/50 focus:border-brand-500/50 transition-all resize-none"
        />
      </div>

      {/* Honeypot — hidden from real users */}
      <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" tabIndex={-1}>
        <input
          name="website"
          type="text"
          value={form.website}
          onChange={handleChange}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      {/* Error message */}
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Submit Referral
          </>
        )}
      </button>
    </form>
  );
}
