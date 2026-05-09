'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Copy, Check, ExternalLink } from 'lucide-react';

interface SetupData {
  enabled: boolean;
  secret?: string;
  otpauth_uri?: string;
  instructions?: string[];
  message?: string;
}

export function TwoFactorSetup() {
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/totp-setup');
      const data = await res.json();
      setSetupData(data);
    } catch {
      setSetupData(null);
    }
    setLoading(false);
  };

  const copySecret = async () => {
    if (setupData?.secret) {
      await navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Two-Factor Authentication (TOTP)</h3>
          <p className="text-xs text-surface-400 mt-0.5">
            Require a verification code from an authenticator app on every login
          </p>
        </div>
        {!setupData && (
          <button
            onClick={fetchSetup}
            disabled={loading}
            className="btn-secondary text-xs"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        )}
      </div>

      {setupData && (
        <div className="rounded-lg border border-surface-700 bg-surface-800/50 p-4 space-y-4">
          {setupData.enabled ? (
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-400">2FA is active</p>
                <p className="text-xs text-surface-400 mt-1">
                  {setupData.message}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-400">2FA is not enabled</p>
                  <p className="text-xs text-surface-400 mt-1">
                    Follow the steps below to secure your admin panel with two-factor authentication.
                  </p>
                </div>
              </div>

              {setupData.secret && (
                <>
                  {/* QR code via external service */}
                  {setupData.otpauth_uri && (
                    <div className="text-center">
                      <p className="text-xs text-surface-400 mb-2">
                        Scan this QR code with your authenticator app:
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.otpauth_uri)}`}
                        alt="TOTP QR Code"
                        className="mx-auto rounded-lg"
                        width={200}
                        height={200}
                      />
                    </div>
                  )}

                  {/* Manual secret */}
                  <div>
                    <p className="text-xs text-surface-400 mb-1.5">Or enter this secret manually:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-surface-900 rounded-lg text-brand-400 font-mono text-sm tracking-wider select-all">
                        {setupData.secret}
                      </code>
                      <button
                        onClick={copySecret}
                        className="p-2 rounded-lg bg-surface-700 hover:bg-surface-600 transition-colors"
                        title="Copy secret"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-surface-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Steps */}
                  {setupData.instructions && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-surface-300">Setup steps:</p>
                      <ol className="space-y-1.5">
                        {setupData.instructions.map((step, i) => (
                          <li key={i} className="text-xs text-surface-400 flex gap-2">
                            <span className="text-brand-400 font-mono flex-shrink-0">{i + 1}.</span>
                            {step.replace(/^\d+\.\s*/, '')}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <a
                    href="https://dash.cloudflare.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open Cloudflare Dashboard to add environment variable
                  </a>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
