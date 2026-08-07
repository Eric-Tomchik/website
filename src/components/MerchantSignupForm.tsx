'use client';

import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react';

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

export default function MerchantSignupForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const message = [
      `Business: ${form.business_name}`,
      `Owner / Contact: ${form.owner_name}`,
      `Phone: ${form.phone}`,
      `Industry: ${form.industry || 'Not specified'}`,
      `Estimated Monthly Card Volume: ${form.monthly_volume || 'Not specified'}`,
      form.notes ? `Notes: ${form.notes}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.owner_name,
          email: form.email,
          subject: `Merchant Application — ${form.business_name}`,
          message,
          service_interest: 'merchant-signup',
          company: form.company,
        }),
      });
      const data = await res.json().catch(() => ({}));
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
        <h4 className="text-xl font-bold text-white">Application Received!</h4>
        <p className="text-surface-400 max-w-md mx-auto">
          Thanks for applying to become a Charity Swipes merchant partner. Eric will reach out
          within 24 hours to confirm your details and get you set up on Clover.
        </p>
        <button onClick={() => setStatus('idle')} className="btn-secondary mt-4">
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                       text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                       focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-surface-300 mb-1.5">
            Phone <span className="text-red-400">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={form.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                       text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                       focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
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
            className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                       text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                       focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
          />
        </div>
        <div>
          <label htmlFor="monthly_volume" className="block text-sm font-medium text-surface-300 mb-1.5">
            Estimated Monthly Card Volume <span className="text-surface-500">(optional)</span>
          </label>
          <select
            id="monthly_volume"
            name="monthly_volume"
            value={form.monthly_volume}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                       text-white focus:outline-none focus:ring-2
                       focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
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

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-surface-300 mb-1.5">
          Anything else we should know? <span className="text-surface-500">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={handleChange}
          placeholder="Current processor, equipment needs, questions, etc."
          className="w-full px-4 py-2.5 rounded-lg bg-surface-800/60 border border-surface-700/50
                     text-white placeholder:text-surface-500 focus:outline-none focus:ring-2
                     focus:ring-brand-500/50 focus:border-brand-500/50 transition-all resize-none"
        />
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
            Apply to Become a Merchant
          </>
        )}
      </button>
      <p className="text-xs text-surface-500 text-center">
        No obligation. We&apos;ll follow up within 24 hours to confirm details and next steps.
      </p>
    </form>
  );
}
