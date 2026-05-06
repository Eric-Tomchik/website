import { Metadata } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../../../convex/_generated/api';
import { BookOpen, Download, FileText, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Download Your Book',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function DownloadPage({ params }: Props) {
  const { token } = await params;

  const result = await fetchQuery(api.downloadTokens.validate, { token });

  if (!result.valid) {
    return (
      <div className="py-20">
        <div className="max-w-lg mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Download Unavailable</h1>
          <p className="text-surface-400">{result.error}</p>
          <Link href="/contact" className="btn-secondary inline-flex">
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  const { book, downloads_remaining, expires_at } = result;
  const expiresDate = new Date(expires_at!);
  const hoursLeft = Math.max(
    0,
    Math.round((expires_at! - Date.now()) / (1000 * 60 * 60))
  );

  return (
    <div className="py-20">
      <div className="max-w-lg mx-auto px-4">
        <div className="card p-8 space-y-6">
          {/* Book info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 rounded-lg overflow-hidden border border-surface-700 flex-shrink-0">
              {book!.cover_image_url ? (
                <img
                  src={book!.cover_image_url}
                  alt={book!.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-surface-800">
                  <BookOpen className="w-6 h-6 text-surface-600" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{book!.title}</h1>
              <p className="text-sm text-surface-400">by Eric Tomchik</p>
            </div>
          </div>

          {/* Download buttons */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">
              Download Your Copy
            </h2>

            {book!.has_pdf && (
              <a
                href={`/api/download/${token}?format=pdf`}
                className="btn-primary w-full justify-center text-base py-3"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </a>
            )}

            {book!.has_epub && (
              <a
                href={`/api/download/${token}?format=epub`}
                className="btn-secondary w-full justify-center text-base py-3"
              >
                <FileText className="w-5 h-5 mr-2" />
                Download EPUB
              </a>
            )}
          </div>

          {/* Info */}
          <div className="border-t border-surface-800 pt-4 space-y-2 text-sm text-surface-400">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>
                {downloads_remaining} download{downloads_remaining !== 1 ? 's' : ''}{' '}
                remaining
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Link expires in {hoursLeft} hour{hoursLeft !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Help */}
          <p className="text-xs text-surface-500 text-center">
            Having trouble? <Link href="/contact" className="text-brand-400 hover:text-brand-300">Contact us</Link> and
            we&apos;ll help you get your book.
          </p>
        </div>
      </div>
    </div>
  );
}
