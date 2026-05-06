'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, Mail, ArrowLeft } from 'lucide-react';
import { usePortalAuth } from '../PortalAuthContext';

export default function PortalLoginPage() {
  const { login, client } = usePortalAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (client) {
    router.replace('/portal');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/portal');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img src="/et-monogram.png" alt="Eric Tomchik logo" className="w-12 h-12 mx-auto rounded-lg" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Client Portal</h1>
          <p className="text-surface-400 mt-2">Sign in to access your projects and support</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label htmlFor="portal-email" className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white outline-none focus:border-brand-500 placeholder:text-surface-500"
                  id="portal-email"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="portal-password" className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white outline-none focus:border-brand-500 placeholder:text-surface-500"
                  id="portal-password"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center text-sm text-surface-400 hover:text-brand-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
