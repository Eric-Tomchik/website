'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const result = await subscribe({ email: email.trim() });
      if (result.alreadySubscribed) {
        setMessage("You're already subscribed!");
      } else {
        setMessage('Thanks for subscribing!');
      }
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400">
        <CheckCircle2 className="w-4 h-4" />
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
      <div className="relative flex-1 md:w-72">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
          placeholder="you@email.com"
          required
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700
                     text-sm text-white placeholder:text-surface-500
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                     transition-all"
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
          'Subscribe'
        )}
      </button>
      {status === 'error' && (
        <p className="text-xs text-red-400 mt-1">{message}</p>
      )}
    </form>
  );
}
