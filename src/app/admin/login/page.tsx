'use client';

import { useState, useRef, useEffect } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const totpRef = useRef<HTMLInputElement>(null);

  // Auto-focus the TOTP input when it appears
  useEffect(() => {
    if (needs2FA && totpRef.current) {
      totpRef.current.focus();
    }
  }, [needs2FA]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          ...(needs2FA && totpCode ? { totp_code: totpCode } : {}),
        }),
      });

      const data = await res.json();

      if (data.requires_2fa && !data.error) {
        // Password accepted, now need TOTP code
        setNeeds2FA(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        if (data.requires_2fa) {
          // Wrong TOTP code — clear it for retry
          setTotpCode('');
        }
        setLoading(false);
        return;
      }

      window.location.href = '/admin';
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-brand-600/20 border border-brand-600/30
                          flex items-center justify-center mx-auto mb-4">
            {needs2FA ? (
              <ShieldCheck className="w-7 h-7 text-brand-400" />
            ) : (
              <Lock className="w-7 h-7 text-brand-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {needs2FA ? 'Two-Factor Auth' : 'Admin Login'}
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            {needs2FA
              ? 'Enter the 6-digit code from your authenticator app'
              : 'Sign in to manage your site'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="card p-6 space-y-4">
          {!needs2FA ? (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700
                           text-white placeholder-surface-500 focus:border-brand-500
                           focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="totp" className="block text-sm font-medium text-surface-300 mb-1.5">
                Verification Code
              </label>
              <input
                ref={totpRef}
                id="totp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                required
                value={totpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setTotpCode(val);
                }}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700
                           text-white text-center text-2xl tracking-[0.5em] font-mono
                           placeholder-surface-500 focus:border-brand-500
                           focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                placeholder="000000"
              />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading
              ? 'Verifying...'
              : needs2FA
                ? 'Verify'
                : 'Sign In'}
          </button>

          {needs2FA && (
            <button
              type="button"
              onClick={() => {
                setNeeds2FA(false);
                setTotpCode('');
                setError('');
              }}
              className="w-full text-sm text-surface-400 hover:text-white transition-colors"
            >
              ← Back to password
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
