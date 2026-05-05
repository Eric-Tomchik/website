'use client';

import Link from 'next/link';
import { CheckCircle, Package, Download, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="py-24">
      <div className="section-container max-w-2xl">
        <div className="card p-12 text-center space-y-6">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Order Confirmed!</h1>
            <p className="text-surface-400">
              Thank you for your purchase. You&apos;ll receive a confirmation email shortly.
            </p>
          </div>

          <div className="glass rounded-xl p-6 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-brand-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white">Digital Downloads</h3>
                <p className="text-sm text-surface-400">
                  Digital copies will be sent to your email within minutes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-brand-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white">Physical Copies</h3>
                <p className="text-sm text-surface-400">
                  Signed author copies will ship within 3–5 business days.
                  You&apos;ll receive tracking info via email.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/books" className="btn-primary">
              Browse More Books
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
