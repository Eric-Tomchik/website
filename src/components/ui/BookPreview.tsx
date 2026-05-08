'use client';

import { useState, useEffect } from 'react';
import { Eye, X, Download, BookOpen } from 'lucide-react';

interface BookPreviewProps {
  previewUrl: string;
  bookTitle: string;
}

export function BookPreviewButton({ previewUrl, bookTitle }: BookPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl
                   bg-gradient-to-r from-brand-600/10 to-brand-500/10
                   border border-brand-500/30 hover:border-brand-400/50
                   hover:from-brand-600/20 hover:to-brand-500/20
                   text-brand-400 hover:text-brand-300
                   transition-all duration-300 shadow-lg shadow-brand-600/5
                   hover:shadow-brand-500/10"
      >
        <div className="relative">
          <Eye className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute -inset-1 bg-brand-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="font-semibold text-sm">Look Inside</span>
        <BookOpen className="w-4 h-4 opacity-50 group-hover:opacity-80 transition-opacity" />
      </button>

      {isOpen && (
        <PreviewModal
          previewUrl={previewUrl}
          bookTitle={bookTitle}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

function PreviewModal({
  previewUrl,
  bookTitle,
  onClose,
}: BookPreviewProps & { onClose: () => void }) {
  const [isMobile, setIsMobile] = useState(false);

  // Lock body scroll and detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full h-full max-w-5xl max-h-[92vh] mx-4 my-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-surface-900/95 backdrop-blur border border-surface-700/50 rounded-t-xl shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-brand-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white leading-tight truncate">{bookTitle}</h3>
              <p className="text-xs text-surface-400">Sample Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={previewUrl}
              download
              className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700/50 transition-colors"
              title="Download preview"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-700/50 transition-colors"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div
          className="flex-1 bg-surface-800 border-x border-b border-surface-700/50 rounded-b-xl overflow-hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {isMobile ? (
            /* Mobile: use object tag inside a scrollable container for better touch scrolling */
            <div
              className="w-full h-full overflow-auto"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <object
                data={`${previewUrl}#toolbar=1&navpanes=0&view=FitH`}
                type="application/pdf"
                className="w-full h-full"
                title={`Preview of ${bookTitle}`}
              >
                {/* Fallback for browsers that can't render PDF inline */}
                <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
                  <BookOpen className="w-16 h-16 text-surface-500" />
                  <div>
                    <p className="text-white font-semibold mb-2">
                      PDF preview isn&apos;t available in this browser
                    </p>
                    <p className="text-surface-400 text-sm mb-6">
                      Tap below to open the preview in a new tab
                    </p>
                  </div>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-3 px-8"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Open Preview
                  </a>
                </div>
              </object>
            </div>
          ) : (
            /* Desktop: iframe works great */
            <iframe
              src={`${previewUrl}#toolbar=1&navpanes=0&view=FitH`}
              className="w-full h-full"
              title={`Preview of ${bookTitle}`}
              style={{ border: 'none' }}
            />
          )}
        </div>

        {/* Mobile: always show a "Open in new tab" button at the bottom as a safety fallback */}
        {isMobile && (
          <div className="shrink-0 flex justify-center py-3">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Open in new tab for best viewing
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
