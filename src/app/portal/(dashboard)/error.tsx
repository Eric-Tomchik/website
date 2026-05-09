'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Portal Error</h2>
        <p className="text-surface-400 mb-8">
          Something went wrong. Please try again or log back in.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <a
            href="/portal/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 text-sm font-medium hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log In Again
          </a>
        </div>
      </div>
    </div>
  );
}
