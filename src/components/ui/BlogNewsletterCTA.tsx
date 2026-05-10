'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Loader2, Bell } from 'lucide-react';

export function BlogNewsletterCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setStatus('success');
      setMessage(data.alreadySubscribed
        ? "You're already subscribed!"
        : 'Subscribed! Check your inbox for a welcome email 🎉');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="card p-6 sm:p-8 text-center border-brand-600/20 my-12">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
        <p className="text-sm text-emerald-400">{message}</p>
      </div>
    );
  }

  return (
    <div className="card p-6 sm:p-8 my-12 border-brand-600/20">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-lg bg-brand-600/10 border border-brand-600/20 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Enjoyed this article?</h3>
          <p className="text-sm text-surface-400 mt-0.5">
            Get notified when I publish new posts on business credit, web development, cybersecurity, and AI.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="you@email.com"
            required
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
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && <p className="text-xs text-red-400 mt-2">{message}</p>}
    </div>
  );
}
