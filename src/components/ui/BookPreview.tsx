'use client';

import { useState } from 'react';
import { Eye, X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, BookOpen } from 'lucide-react';

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
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full h-full max-w-5xl max-h-[92vh] mx-4 my-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-surface-900/95 backdrop-blur border border-surface-700/50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">{bookTitle}</h3>
              <p className="text-xs text-surface-400">Sample Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        <div className="flex-1 bg-surface-800 border-x border-b border-surface-700/50 rounded-b-xl overflow-hidden">
          <iframe
            src={`${previewUrl}#toolbar=1&navpanes=0&view=FitH`}
            className="w-full h-full"
            title={`Preview of ${bookTitle}`}
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
